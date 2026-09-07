import {
  retrieveCalibration,
  applyCalibrationCaps
} from './calibration/retrieveCalibration.js';

const PLACEHOLDER_PATTERN = /^__.*__$/;

function env(name, fallback = '') {
  return process.env[name] || fallback;
}

function isConfigured(value) {
  return Boolean(value) && !PLACEHOLDER_PATTERN.test(value);
}

function stripCodeFence(text) {
  return String(text || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

export function parseJsonOutput(text) {
  const cleaned = stripCodeFence(text);

  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');

    if (first !== -1 && last !== -1 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }

    throw new Error(
      '模型返回内容不是有效JSON。请将AI_TEMPERATURE设为0，并检查模型是否支持严格JSON输出。'
    );
  }
}

function numberInRange(value, min, max, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, safe));
}

function cleanText(value, fallback = '未呈现') {
  const text = String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/。{2,}/g, '。')
    .trim();

  return text || fallback;
}

function normalizeScores(scores = {}) {
  const usefulness = numberInRange(
    scores.usefulness_score ?? scores.quality_score,
    1,
    7,
    4
  );

  const elaboration = numberInRange(
    scores.elaboration_score,
    1,
    7,
    4
  );

  const originality = numberInRange(
    scores.originality_score,
    1,
    7,
    4
  );

  const overallFallback = Math.round(
    ((usefulness + elaboration + originality) / 3) * (6 / 7)
  );

  return {
    overall_score: numberInRange(
      scores.overall_score ?? scores.holistic_score,
      1,
      6,
      overallFallback
    ),
    quality_score: usefulness,
    usefulness_score: usefulness,
    elaboration_score: elaboration,
    originality_score: originality
  };
}

function normalizeCpsStructure(rows = []) {
  const expectedStages = [
    'Clarify',
    'Ideate',
    'Develop',
    'Implement'
  ];

  const sourceRows = Array.isArray(rows) ? rows : [];

  return expectedStages.map((stage) => {
    const row =
      sourceRows.find((item) => item?.stage === stage) || {};

    return {
      stage,
      stage_score: numberInRange(
        row.stage_score,
        1,
        4,
        2
      ),
      evidence_from_draft: cleanText(
        row.evidence_from_draft,
        '未呈现'
      ),
      evaluative_comment: cleanText(
        row.evaluative_comment,
        '该阶段信息不足，暂时只能作有限判断。'
      )
    };
  });
}

function normalizeCmcReasoning(cmc = {}) {
  return {
    orientation: cleanText(
      cmc.orientation ?? cmc.knowledge_activation,
      '我先依据创造性需要兼顾区别度、使用价值和充分表达的原则进行判断，同时避免把功能数量或文字长度直接视为创造性。'
    ),

    diagnostic_question: cleanText(
      cmc.diagnostic_question,
      '我当前需要判断的是：这个方案是否已经形成了与用户需要相关、并且区别于常见功能添加的核心设计。'
    ),

    evidence_monitoring: cleanText(
      cmc.evidence_monitoring,
      '我会比较草稿中的用户需要、候选想法和最终设计，检查它们之间是否建立了明确联系，而不是只计算出现了多少功能。'
    ),

    priority_diagnosis: cleanText(
      cmc.priority_diagnosis,
      '当前需要优先判断的不是描述是否足够长，而是核心功能是否已经发展为连贯且有区别度的产品体验。'
    ),

    control_decision: cleanText(
      cmc.control_decision ?? cmc.bias_control,
      '基于这一判断，我会选择一个主要CPS阶段调整策略，保留与核心需要有关的内容，并减少与核心概念联系较弱的功能。'
    ),

    re_monitoring: cleanText(
      cmc.re_monitoring ?? cmc.dimension_distinction,
      '调整后需要重新检查核心设计是否更有区别度、各项功能是否服务于同一体验，以及实际价值是否仍然成立。'
    ),

    transfer_rule: cleanText(
      cmc.transfer_rule ?? cmc.score_calibration,
      '评价其他创造性方案时，也应先识别核心机制，再判断细节是否真正支持该机制，而不是用功能数量代替创造性。'
    )
  };
}

function normalizeEvaluation(evaluation, draft = '') {
  const normalized =
    evaluation && typeof evaluation === 'object'
      ? evaluation
      : {};

  normalized.scores = normalizeScores(
    normalized.scores || {}
  );

  normalized.cps_structure = normalizeCpsStructure(
    normalized.cps_structure
  );

  normalized.structured_overall_comment = cleanText(
    normalized.structured_overall_comment,
    '该方案完成了基本产品改进要求，但核心设计的区别度和整体发展程度仍需结合草稿证据谨慎判断。'
  );

  normalized.cmc_reasoning_demo = normalizeCmcReasoning(
    normalized.cmc_reasoning_demo || {}
  );

  /*
   * Older model responses may still contain creative_quality.
   * It is intentionally removed because its three dimension summaries
   * duplicate scores, CPS comments, and the CMC demonstration.
   */
  delete normalized.creative_quality;

  const calibration = retrieveCalibration(draft);
  applyCalibrationCaps(normalized, calibration);

  return normalized;
}

function mockEvaluation(context = {}) {
  const draft = context.draft || '';

  const base = {
    scores: {
      overall_score: 3,
      usefulness_score: 4,
      elaboration_score: 4,
      originality_score: 3
    },

    cps_structure: [
      {
        stage: 'Clarify',
        stage_score: 2,
        evidence_from_draft:
          '草稿呈现了部分用户、场景或需要信息。',
        evaluative_comment:
          '已经具备基本问题方向，但用户需要与情境限制尚未完全建立联系。'
      },
      {
        stage: 'Ideate',
        stage_score: 2,
        evidence_from_draft:
          '草稿提出了若干毛绒兔改进想法。',
        evaluative_comment:
          '想法与任务相关，但不同方向之间的差异程度仍然有限。'
      },
      {
        stage: 'Develop',
        stage_score: 2,
        evidence_from_draft:
          '草稿选择了一个主要功能继续发展。',
        evaluative_comment:
          '核心方向可以识别，但功能、用户需要与使用过程之间的联系尚不充分。'
      },
      {
        stage: 'Implement',
        stage_score: 2,
        evidence_from_draft:
          '草稿提供了少量材料或实现信息。',
        evaluative_comment:
          '方案具有初步实现设想，但相关边界和关键细节仍较有限。'
      }
    ],

    structured_overall_comment:
      '方案已形成基本改进方向，优势是与任务相关；当前主要限制是核心机制和整体产品体验仍不够清楚。',

    cmc_reasoning_demo: {
      orientation:
        '我先依据创造性需要兼顾区别度、使用价值和充分表达的原则进行评价，同时避免把功能数量、技术词汇或文字长度直接当作创造性。',

      diagnostic_question:
        '我当前最需要判断的是：这些改进是否围绕一个用户需要形成了核心机制，还是仍然停留在若干常见功能的并列。',

      evidence_monitoring:
        '草稿已经提供了一些用户、情境和功能线索，但这些线索之间的联系还不完全清楚；部分功能能够回应需要，部分内容则更接近独立的附加设计。',

      priority_diagnosis:
        '因此，当前最优先的问题不是继续扩写材料和外观细节，而是先确定能够组织整个方案的核心体验，因为缺少这一点会同时限制方案的区别度和连贯性。',

      control_decision:
        '基于这一判断，我会先回到Develop阶段，保留与主要用户需要联系最强的设计，弱化关系较小的附加功能，并用一个清楚的使用过程把核心设计发展完整。',

      re_monitoring:
        '完成调整后，我会再次检查：方案是否仍只是普通功能的组合，各项设计是否服务于同一体验，以及区别度提高后是否仍保留基本使用价值。',

      transfer_rule:
        '在其他创造性任务中，也应先寻找能够组织方案的核心机制，再决定增加哪些细节，而不是把想法数量直接等同于创造质量。'
    }
  };

  return normalizeEvaluation(base, draft);
}

export async function generateEvaluation(
  messages,
  context = {}
) {
  const apiUrl = env('AI_API_URL');
  const apiKey = env('AI_API_KEY');
  const model = env(
    'AI_MODEL',
    '__MODEL_TO_BE_SELECTED__'
  );

  if (
    !isConfigured(apiUrl) ||
    !isConfigured(apiKey) ||
    !isConfigured(model)
  ) {
    const parsedJson = mockEvaluation(context);

    return {
      mock: true,
      model,
      rawText: JSON.stringify(parsedJson, null, 2),
      parsedJson,
      usage: null
    };
  }

  const temperature = Number(
    env('AI_TEMPERATURE', '0')
  );

  const maxTokens = Number(
    env('AI_MAX_TOKENS', '2400')
  );

  const responseFormat = env(
    'AI_RESPONSE_FORMAT',
    'none'
  );

  const requestBody = {
    model,
    temperature,
    max_tokens: maxTokens,
    messages
  };

  if (responseFormat === 'json_object') {
    requestBody.response_format = {
      type: 'json_object'
    };
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `API请求失败：${response.status} ${text}`
    );
  }

  const data = await response.json();

  const rawText =
    data.choices?.[0]?.message?.content ||
    data.output_text ||
    data.content ||
    JSON.stringify(data);

  const parsedJson = normalizeEvaluation(
    parseJsonOutput(rawText),
    context.draft || ''
  );

  return {
    mock: false,
    model,
    rawText,
    parsedJson,
    usage: data.usage || null
  };
}
