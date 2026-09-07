import {
  retrieveCalibration,
  applyCalibrationCaps
} from './calibration/retrieveCalibration.js';

const PLACEHOLDER_PATTERN = /^__.*__$/;

function env(name, fallback = '') {
  return process.env[name] || fallback;
}

function isConfigured(value) {
  return Boolean(value) &&
    !PLACEHOLDER_PATTERN.test(value);
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

    if (
      first !== -1 &&
      last !== -1 &&
      last > first
    ) {
      return JSON.parse(
        cleaned.slice(first, last + 1)
      );
    }

    throw new Error(
      '模型返回内容不是有效JSON。请将AI_TEMPERATURE设为0，并检查模型是否支持严格JSON输出。'
    );
  }
}

function numberInRange(
  value,
  min,
  max,
  fallback
) {
  const parsed = Number.parseInt(
    String(value ?? ''),
    10
  );

  const safe = Number.isFinite(parsed)
    ? parsed
    : fallback;

  return Math.max(
    min,
    Math.min(max, safe)
  );
}

function cleanText(
  value,
  fallback = '未呈现'
) {
  const text = String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/。{2,}/g, '。')
    .trim();

  return text || fallback;
}

function normalizeScores(scores = {}) {
  const usefulness = numberInRange(
    scores.usefulness_score ??
      scores.quality_score,
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
    (
      (
        usefulness +
        elaboration +
        originality
      ) / 3
    ) * (6 / 7)
  );

  return {
    overall_score: numberInRange(
      scores.overall_score ??
        scores.holistic_score,
      1,
      6,
      overallFallback
    ),

    /*
     * Retain quality_score as an internal alias for compatibility
     * with older storage and export code.
     */
    quality_score: usefulness,
    usefulness_score: usefulness,
    elaboration_score: elaboration,
    originality_score: originality
  };
}

function normalizeCreativeQuality(
  quality = {}
) {
  return {
    originality_judgment: cleanText(
      quality.originality_judgment ??
        quality.originality,
      '方案已经呈现一定的改进方向，但核心想法与常见毛绒玩具设计之间的区别程度仍需结合草稿内容判断。'
    ),

    usefulness_judgment: cleanText(
      quality.usefulness_judgment ??
        quality.usefulness ??
        quality.quality,
      '方案与任务目标具有一定联系，并呈现了潜在使用价值，但部分功能的实际作用和适用条件尚未充分说明。'
    ),

    elaboration_judgment: cleanText(
      quality.elaboration_judgment ??
        quality.elaboration ??
        quality.specificity,
      '方案包含部分功能、结构或使用信息，基本产品方向可以理解，但核心机制及其相互联系的具体程度仍然有限。'
    )
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
        '该阶段已经呈现部分相关信息，但信息的完整性和具体程度有限，因此只能作中等以下判断。'
      )
    };
  });
}

function removeLegacyCmcLabels(text) {
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
    return removeLegacyCmcLabels(cmc);
  }

  if (
    !cmc ||
    typeof cmc !== 'object'
  ) {
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

  return removeLegacyCmcLabels(
    fields
      .filter(Boolean)
      .map((item) =>
        cleanText(item, '')
      )
      .filter(Boolean)
      .join(' ')
  );
}

function normalizeCmcOverallComment(
  evaluation = {}
) {
  const direct =
    removeLegacyCmcLabels(
      evaluation.cmc_overall_comment
    );

  if (direct) {
    return direct;
  }

  const migrated =
    legacyCmcToParagraph(
      evaluation.cmc_reasoning_demo
    );

  if (migrated) {
    return migrated;
  }

  return (
    '接手这份草稿时，我先明确这个任务既要探索不同方向，也要从中选出兼具新意和使用价值的想法，因此不能只看功能多少或文字长短。' +
    '现有内容已经呈现若干改进方向，但部分想法沿着相近的功能添加思路展开，说明创意搜索的范围仍然有限。' +
    '比较候选想法后，有些方向较为具体但接近常见设计，另一些方向具有一定发展空间，却尚未形成清楚机制。' +
    '由此看来，当前问题不是单纯缺少想法，而是候选想法之间尚未经过充分比较和筛选。' +
    '因此，我会把策略从继续增加功能调整为分类比较，并根据新颖性、使用价值和发展潜力决定哪些想法继续深化、暂时保留或不再采用。' +
    '调整后，我会重新检查核心方向是否比常见设计更有区别、是否保留实际价值，以及机制是否足够清楚；若仍未达到这些条件，就继续探索或深化，达到后再结束构思。' +
    '由此形成的经验是：当想法数量增加但类别不再扩展时，应切换搜索策略；选定有潜力的方向后，再从广泛探索转向持续深化。'
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

  normalized.scores =
    normalizeScores(
      normalized.scores || {}
    );

  normalized.creative_quality =
    normalizeCreativeQuality(
      normalized.creative_quality || {}
    );

  normalized.cps_structure =
    normalizeCpsStructure(
      normalized.cps_structure
    );

  normalized.structured_overall_comment =
    cleanText(
      normalized.structured_overall_comment,
      '方案已经形成基本产品改进方向并呈现一定使用价值；核心想法的区别程度和整体发展完整性仍然有限。'
    );

  normalized.cmc_overall_comment =
    normalizeCmcOverallComment(
      normalized
    );

  /*
   * Remove deprecated CMC fields after converting their content
   * into the new one-paragraph schema.
   */
  delete normalized.cmc_reasoning_demo;

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

    creative_quality: {
      originality_judgment:
        '方案包含若干与任务相关的改进方向，但核心想法主要表现为常见功能的组合，区别程度处于中等以下水平。',

      usefulness_judgment:
        '方案能够回应部分使用需要，也呈现了潜在使用价值，但功能作用和具体适用条件尚未得到充分说明。',

      elaboration_judgment:
        '方案已经提供部分功能和结构信息，基本方向可以理解，但核心机制、使用过程及要素联系仍不够充分。'
    },

    cps_structure: [
      {
        stage: 'Clarify',
        stage_score: 2,
        evidence_from_draft:
          '草稿呈现了部分用户、场景或需要信息。',

        evaluative_comment:
          '方案已经形成基本问题方向，但用户、情境和主要需要之间的关系尚未充分展开，因此澄清程度处于中等水平。'
      },
      {
        stage: 'Ideate',
        stage_score: 2,
        evidence_from_draft:
          '草稿提出了若干与毛绒兔有关的改进方向。',

        evaluative_comment:
          '想法数量达到基本要求，也包含一定方向差异，但部分内容属于相近的功能添加，发散范围和类别跨度较为有限。'
      },
      {
        stage: 'Develop',
        stage_score: 2,
        evidence_from_draft:
          '草稿选择了一个或多个主要方向继续发展。',

        evaluative_comment:
          '主要设计方向可以识别，但选择依据、核心机制和完整使用过程尚不充分，方案发展仍处于初步水平。'
      },
      {
        stage: 'Implement',
        stage_score: 2,
        evidence_from_draft:
          '草稿提供了少量材料、结构或实现信息。',

        evaluative_comment:
          '最终方案已经具有初步产品形态，但关键操作、结构联系和基本可行性信息仍然有限，具体化程度一般。'
      }
    ],

    structured_overall_comment:
      '方案已形成与任务相关的基本改进方向，并呈现一定潜在价值；核心创意的区别程度和整体发展完整性仍然有限。',

    cmc_overall_comment:
      '接手这份草稿时，我先明确这个任务既要探索不同方向，也要从中选出兼具新意和使用价值的想法，因此不能只看功能多少或文字长短。现有内容已经呈现若干改进方向，但部分想法沿着相近的功能添加思路展开，说明创意搜索的范围仍然有限。比较候选想法后，有些方向较具体但接近常见设计，另一些具有一定发展空间，却尚未形成清楚机制。由此看来，当前问题不是单纯缺少想法，而是候选想法之间尚未经过充分比较和筛选。因此，我会把策略从继续增加功能调整为分类比较，并根据新颖性、使用价值和发展潜力决定哪些想法继续深化、暂时保留或不再采用。调整后，我会重新检查核心方向是否更有区别、是否保留实际价值，以及机制是否足够清楚；若仍未达到这些条件，就继续探索或深化，达到后再结束构思。由此形成的经验是：当想法数量增加但类别不再扩展时，应切换搜索策略；选定有潜力的方向后，再从广泛探索转向持续深化。'
  };

  return normalizeEvaluation(
    base,
    draft
  );
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
    env('AI_MAX_TOKENS', '2800')
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

  if (
    responseFormat === 'json_object'
  ) {
    requestBody.response_format = {
      type: 'json_object'
    };
  }

  const response = await fetch(
    apiUrl,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },

      body: JSON.stringify(
        requestBody
      )
    }
  );

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
