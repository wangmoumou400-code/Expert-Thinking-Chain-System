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
    ((usefulness + elaboration + originality) / 3) *
      (6 / 7)
  );

  return {
    overall_score: numberInRange(
      scores.overall_score ?? scores.holistic_score,
      1,
      6,
      overallFallback
    ),

    /*
     * quality_score is retained as an internal alias so that older
     * storage/export code remains compatible.
     */
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

  const sourceRows = Array.isArray(rows)
    ? rows
    : [];

  return expectedStages.map((stage) => {
    const row =
      sourceRows.find(
        (item) => item?.stage === stage
      ) || {};

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
        '该阶段信息不足，只能作有限判断。'
      )
    };
  });
}

function removeOldCmcLabels(text) {
  return String(text || '')
    .replace(
      /【(?:评价定向|核心自问|证据监控|核心判断|调节决策|再监控|可迁移原则)】/g,
      ''
    )
    .replace(
      /(?:评价定向|核心自问|证据监控|核心判断|调节决策|再监控|可迁移原则)\s*[:：]/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function legacyCmcToParagraph(cmc = {}) {
  if (typeof cmc === 'string') {
    return removeOldCmcLabels(cmc);
  }

  if (!cmc || typeof cmc !== 'object') {
    return '';
  }

  const fields = [
    cmc.orientation ??
      cmc.knowledge_activation,

    cmc.diagnostic_question,

    cmc.evidence_monitoring,

    cmc.priority_diagnosis,

    cmc.control_decision ??
      cmc.bias_control,

    cmc.re_monitoring ??
      cmc.dimension_distinction,

    cmc.transfer_rule ??
      cmc.score_calibration
  ];

  return removeOldCmcLabels(
    fields
      .filter(Boolean)
      .map((item) => cleanText(item, ''))
      .filter(Boolean)
      .join(' ')
  );
}

function normalizeCmcOverallComment(
  evaluation = {}
) {
  const direct = removeOldCmcLabels(
    evaluation.cmc_overall_comment
  );

  if (direct) {
    return direct;
  }

  const migrated = legacyCmcToParagraph(
    evaluation.cmc_reasoning_demo
  );

  if (migrated) {
    return migrated;
  }

  return (
    '当我评价这个方案时，我先检查用户需要、候选想法和最终设计之间是否形成了连续关系，' +
    '同时避免把功能数量或描述长度直接当作创造性。草稿已经呈现了一些与任务相关的内容，' +
    '但还需要比较这些内容是否围绕同一个核心需要发展，而不是停留在若干功能的并列。' +
    '接着要判断被保留的方向是否形成了可识别的核心机制，以及后续细节是否真正支持这一机制。' +
    '当前最需要优先处理的是核心概念与用户体验之间的联系，因为仅增加材料或外观细节不能自动提高原创性。' +
    '基于这一判断，我会回到Develop阶段，保留与主要需要联系最强的内容，筛除联系较弱的附加部分，' +
    '并进一步发展核心使用过程。修改后，需要再次检查核心设计是否更有区别度、各项内容是否服务于同一体验，' +
    '以及这种改变是否仍保持基本实用价值。类似任务中，应先发展核心创意，再让实施细节为它提供支持。'
  );
}

function normalizeEvaluation(
  evaluation,
  draft = ''
) {
  const normalized =
    evaluation &&
    typeof evaluation === 'object' &&
    !Array.isArray(evaluation)
      ? evaluation
      : {};

  normalized.scores = normalizeScores(
    normalized.scores || {}
  );

  normalized.cps_structure =
    normalizeCpsStructure(
      normalized.cps_structure
    );

  normalized.structured_overall_comment =
    cleanText(
      normalized.structured_overall_comment,
      '该方案已形成基本改进方向，但核心概念的区别度和发展完整性仍需结合草稿内容谨慎判断。'
    );

  normalized.cmc_overall_comment =
    normalizeCmcOverallComment(normalized);

  /*
   * Remove deprecated output sections. Their content either duplicates
   * the CPS evaluation or has already been migrated into the single
   * cmc_overall_comment paragraph.
   */
  delete normalized.cmc_reasoning_demo;
  delete normalized.creative_quality;

  const calibration =
    retrieveCalibration(draft);

  applyCalibrationCaps(
    normalized,
    calibration
  );

  return normalized;
}

function mockEvaluation(context = {}) {
  const draft = context.draft || '';

  const base = {
    scores: {
      overall_score: 3,
      originality_score: 3,
      usefulness_score: 4,
      elaboration_score: 4
    },

    cps_structure: [
      {
        stage: 'Clarify',
        stage_score: 2,
        evidence_from_draft:
          '草稿呈现了部分用户、场景或需要信息。',
        evaluative_comment:
          '已经具备基本问题方向，但用户需要与使用情境之间的联系仍不够完整。'
      },
      {
        stage: 'Ideate',
        stage_score: 2,
        evidence_from_draft:
          '草稿提出了若干与毛绒兔有关的改进方向。',
        evaluative_comment:
          '想法与任务相关，但部分方向仍属于相近的功能添加，类别差异有限。'
      },
      {
        stage: 'Develop',
        stage_score: 2,
        evidence_from_draft:
          '草稿选择了一个主要方向继续发展。',
        evaluative_comment:
          '核心方向可以识别，但功能、用户需要与使用过程之间尚未形成充分联系。'
      },
      {
        stage: 'Implement',
        stage_score: 2,
        evidence_from_draft:
          '草稿提供了少量材料、结构或实现信息。',
        evaluative_comment:
          '方案具有初步实现设想，但关键使用条件和实施边界仍较有限。'
      }
    ],

    structured_overall_comment:
      '方案已形成与任务相关的基本改进方向，但核心机制及其所组织的产品体验仍不够清楚。',

    cmc_overall_comment:
      '当我评价这个方案时，我先问自己：前面澄清的用户需要是否真正引导了想法生成，最终选择的方向是否又发展成了可以组织整个方案的核心机制？草稿已经呈现了若干与任务相关的功能，这说明参与者能够从现有产品出发寻找改进方向；不过，这些功能之间的联系还不完全清楚，因此功能数量不能直接作为高创造性的依据。接着检查被保留的方向，它虽然回应了部分用户需要，但目前仍主要表现为一个附加功能，尚未充分形成连贯的使用体验。后续提供的材料或结构信息增强了方案的具体性，却不能自动证明其原创性。为了避免把描述丰富误判为创意发展，我把核心概念与用户体验之间的联系不足确定为当前最优先的问题。基于这一判断，我会回到Develop阶段，保留与主要需要联系最强的内容，通过比较和筛选进一步明确核心使用过程，而不是继续增加零散功能。修改后，我会再次检查核心设计是否更有区别度、各项内容是否服务于同一体验，以及实用价值是否仍然成立。类似任务中，应先让核心需要引导创意选择，再用实施细节支持已经形成的核心机制。'
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
    const parsedJson =
      mockEvaluation(context);

    return {
      mock: true,
      model,
      rawText: JSON.stringify(
        parsedJson,
        null,
        2
      ),
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

  const parsedJson =
    normalizeEvaluation(
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
