import { retrieveCalibration, applyCalibrationCaps } from './calibration/retrieveCalibration.js';

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

    throw new Error('模型返回内容不是有效JSON。请将 AI_TEMPERATURE 设为 0，并检查模型是否支持严格JSON输出。');
  }
}

function numberInRange(value, min, max, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, safe));
}

function normalizeEvaluation(evaluation, draft = '') {
  const normalized = evaluation && typeof evaluation === 'object' ? evaluation : {};
  const scores = normalized.scores || {};

  const usefulness = numberInRange(scores.usefulness_score ?? scores.quality_score, 1, 7, 4);
  const elaboration = numberInRange(scores.elaboration_score, 1, 7, 4);
  const originality = numberInRange(scores.originality_score, 1, 7, 4);
  const overallFallback = Math.round(((usefulness + elaboration + originality) / 3) * (6 / 7));

  normalized.scores = {
    overall_score: numberInRange(scores.overall_score ?? scores.holistic_score, 1, 6, overallFallback),
    quality_score: usefulness,
    usefulness_score: usefulness,
    elaboration_score: elaboration,
    originality_score: originality
  };

  const expectedStages = ['Clarify', 'Ideate', 'Develop', 'Implement'];
  const rows = Array.isArray(normalized.cps_structure) ? normalized.cps_structure : [];

  normalized.cps_structure = expectedStages.map((stage) => {
    const row = rows.find((item) => item?.stage === stage) || {};
    return {
      stage,
      stage_score: numberInRange(row.stage_score, 1, 4, 2),
      evidence_from_draft: row.evidence_from_draft || '未呈现',
      evaluative_comment: row.evaluative_comment || '未呈现'
    };
  });

  const creative = normalized.creative_quality || {};
  normalized.creative_quality = {
    usefulness: creative.usefulness || creative.quality || '未呈现',
    elaboration: creative.elaboration || '未呈现',
    originality: creative.originality || '未呈现'
  };

  normalized.structured_overall_comment =
    normalized.structured_overall_comment ||
    '该方案已完成基本任务要求，但仍需依据实用性、具体性和原创性综合判断其创造性水平。';

  const cmc = normalized.cmc_reasoning_demo || {};
  normalized.cmc_reasoning_demo = {
    knowledge_activation:
      cmc.knowledge_activation ||
      '我先调用创造力元认知中的产品评价知识：普通毛绒兔改进不能只看功能多少，而要同时区分原创性、实用性和具体性。',
    evidence_monitoring:
      cmc.evidence_monitoring ||
      '我会监控草稿中已经呈现的目标用户、使用场景、核心需要和产品机制，不补充草稿没有写出的市场数据或专业测试。',
    bias_control:
      cmc.bias_control ||
      '为了避免评分偏差，我不会因为方案用了智能、APP、传感器等技术词，或因为功能较多，就自动提高创造性评价。',
    dimension_distinction:
      cmc.dimension_distinction ||
      '我把三个维度分开判断：原创性看机制是否不同于常见毛绒玩具，实用性看是否回应用户需要，具体性看流程和实现边界是否清楚。',
    score_calibration:
      cmc.score_calibration ||
      '因此，最终分数会根据草稿中的证据校准：证据充分的维度可以较高，仍停留在常见功能或边界不足的维度保持适度。'
  };

  const calibration = retrieveCalibration(draft);
  applyCalibrationCaps(normalized, calibration);

  return normalized;
}

function mockEvaluation(context = {}) {
  const draft = context.draft || '';
  const base = {
    scores: {
      overall_score: 3,
      quality_score: 4,
      usefulness_score: 4,
      elaboration_score: 4,
      originality_score: 3
    },
    cps_structure: [
      {
        stage: 'Clarify',
        stage_score: 2,
        evidence_from_draft: '草稿呈现了部分用户或场景信息。',
        evaluative_comment: '澄清信息能支持基本判断，但用户需要和使用限制还不够具体。'
      },
      {
        stage: 'Ideate',
        stage_score: 2,
        evidence_from_draft: '草稿提出了若干普通毛绒玩具改进方向。',
        evaluative_comment: '想法与任务相关，但多数仍接近常见功能添加，独特机制不够明显。'
      },
      {
        stage: 'Develop',
        stage_score: 2,
        evidence_from_draft: '草稿说明了核心功能，但功能之间的体验联系较弱。',
        evaluative_comment: '方案方向可以理解，但还没有充分发展成连贯的产品体验。'
      },
      {
        stage: 'Implement',
        stage_score: 2,
        evidence_from_draft: '草稿呈现了少量材料或实现信息。',
        evaluative_comment: '可行性说明较初步，安全、清洁、维护或生产边界仍需更清楚。'
      }
    ],
    creative_quality: {
      usefulness: '方案有一定实用价值，但需要看功能是否真正匹配具体用户需要。',
      elaboration: '方案有基本描述，但使用流程、材料和实现边界仍可更具体。',
      originality: '方案与普通毛绒兔相比有变化，但若主要是常见功能添加，原创性保持中等。'
    },
    structured_overall_comment:
      '该方案与任务相关，具有基本产品改进方向；整体创造性取决于其实用性、具体性和原创性是否同时成立。',
    cmc_reasoning_demo: {
      knowledge_activation:
        '我先调用创造力元认知中的产品评价知识：创造性不能只看想法是否新奇，而要同时判断原创性、实用性和具体性。',
      evidence_monitoring:
        '草稿中已经呈现了一些用户、场景或功能线索，我会只依据这些文本证据判断，而不补充未写出的市场数据或专业测试。',
      bias_control:
        '为了避免“新颖性光环”或“技术词光环”，我不会因为功能数量多、听起来智能，或描述较长，就直接提高整体创造性。',
      dimension_distinction:
        '原创性关注是否形成不同于常见毛绒兔的机制，实用性关注是否回应目标需要，具体性关注使用流程和实现边界是否清楚。',
      score_calibration:
        '所以评分会按证据强弱校准：相关性成立的维度可以给中等以上，但机制不独特或边界不足的维度不会给过高分。'
    }
  };

  return normalizeEvaluation(base, draft);
}

export async function generateEvaluation(messages, context = {}) {
  const apiUrl = env('AI_API_URL');
  const apiKey = env('AI_API_KEY');
  const model = env('AI_MODEL', '__MODEL_TO_BE_SELECTED__');

  if (!isConfigured(apiUrl) || !isConfigured(apiKey) || !isConfigured(model)) {
    const parsedJson = mockEvaluation(context);
    return {
      mock: true,
      model,
      rawText: JSON.stringify(parsedJson, null, 2),
      parsedJson,
      usage: null
    };
  }

  const temperature = Number(env('AI_TEMPERATURE', '0'));
  const maxTokens = Number(env('AI_MAX_TOKENS', '2200'));
  const responseFormat = env('AI_RESPONSE_FORMAT', 'none');

  const requestBody = {
    model,
    temperature,
    max_tokens: maxTokens,
    messages
  };

  if (responseFormat === 'json_object') {
    requestBody.response_format = { type: 'json_object' };
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
    throw new Error(`API请求失败：${response.status} ${text}`);
  }

  const data = await response.json();
  const rawText =
    data.choices?.[0]?.message?.content ||
    data.output_text ||
    data.content ||
    JSON.stringify(data);

  return {
    mock: false,
    model,
    rawText,
    parsedJson: normalizeEvaluation(parseJsonOutput(rawText), context.draft || ''),
    usage: data.usage || null
  };
}
