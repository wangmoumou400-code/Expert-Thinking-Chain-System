const PLACEHOLDER_PATTERN = /^__.*__$/;

const EXPECTED_STAGES = [
  'Clarify',
  'Ideate',
  'Develop',
  'Implement'
];

const STRUCTURED_DIRECTIVE_PATTERN =
  /(建议|应当|应该|最好|不妨|尝试|可以进一步|优先处理|需要补充|修改为|返回.{0,8}阶段|保留.{0,12}功能|删除.{0,12}功能)/;

const UNIVERSAL_EXPERIENCE_PATTERN =
  /(完整的?用户体验|用户体验闭环|体验闭环|统一体验|整合体验|完整使用流程)/;

const CONTROL_PATTERN =
  /(继续生成|继续搜索|切换|重新界定|重新理解|比较|筛选|深化|暂时保留|舍弃|分开|组合|继续投入|停止|结束)/;

const CONDITIONAL_PATTERN =
  /(如果|若|当.+时|仍未|仍然|达到.+后|满足.+后)/;

const OLD_TEMPLATE_PATTERNS = [
  /接手这份草稿时，我先明确这是一个开放性任务/,
  /由此看来，当前问题不是/,
  /因此，我会把策略从/,
  /调整后，我会重新检查/,
  /这次判断形成的经验是/
];

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

    if (first !== -1 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }

    throw new Error('模型返回的内容不是有效JSON。');
  }
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/。{2,}/g, '。')
    .trim();
}

function numberInRange(value, min, max) {
  const parsed = Number.parseInt(String(value ?? ''), 10);

  if (!Number.isFinite(parsed)) {
    throw new Error(`缺少${min}-${max}范围内的整数评分。`);
  }

  return Math.max(min, Math.min(max, parsed));
}

function requireText(value, fieldName) {
  const text = cleanText(value);

  if (!text) {
    throw new Error(`模型输出缺少字段：${fieldName}`);
  }

  return text;
}

function extractApiText(data) {
  const content =
    data.choices?.[0]?.message?.content ??
    data.output_text ??
    data.content;

  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    const joined = content
      .map((item) => {
        if (typeof item === 'string') return item;
        return item?.text || item?.content || '';
      })
      .join('');

    if (joined.trim()) return joined;
  }

  throw new Error('API响应中没有可读取的模型文本。');
}

function normalizeScores(scores = {}) {
  const usefulness = numberInRange(
    scores.usefulness_score ?? scores.quality_score,
    1,
    7
  );

  return {
    overall_score: numberInRange(scores.overall_score, 1, 6),
    originality_score: numberInRange(scores.originality_score, 1, 7),
    usefulness_score: usefulness,
    quality_score: usefulness,
    elaboration_score: numberInRange(scores.elaboration_score, 1, 7)
  };
}

function normalizeDiagnosticMeta(meta = {}) {
  if (typeof meta.process_flow_relevant !== 'boolean') {
    throw new Error('diagnostic_meta.process_flow_relevant必须是布尔值。');
  }

  return {
    primary_product_type: requireText(
      meta.primary_product_type,
      'diagnostic_meta.primary_product_type'
    ),
    process_flow_relevant: meta.process_flow_relevant,
    creative_process_state: requireText(
      meta.creative_process_state,
      'diagnostic_meta.creative_process_state'
    ),
    control_operation: requireText(
      meta.control_operation,
      'diagnostic_meta.control_operation'
    ),
    control_basis: requireText(
      meta.control_basis,
      'diagnostic_meta.control_basis'
    )
  };
}

function normalizeCpsStructure(rows) {
  if (!Array.isArray(rows)) {
    throw new Error('cps_structure必须是数组。');
  }

  return EXPECTED_STAGES.map((stage) => {
    const row = rows.find((item) => item?.stage === stage);

    if (!row) {
      throw new Error(`cps_structure缺少${stage}阶段。`);
    }

    const evidence = requireText(
      row.evidence_from_draft,
      `${stage}.evidence_from_draft`
    );

    const comment = requireText(
      row.evaluative_comment,
      `${stage}.evaluative_comment`
    );

    if (STRUCTURED_DIRECTIVE_PATTERN.test(comment)) {
      throw new Error(`${stage}阶段评价包含修改建议，必须改为描述性评价。`);
    }

    return {
      stage,
      stage_score: numberInRange(row.stage_score, 1, 4),
      evidence_from_draft: evidence,
      evaluative_comment: comment
    };
  });
}

function cleanCmc(text) {
  return cleanText(text)
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

function validateCmc(cmc, meta) {
  if (cmc.length < 120) {
    throw new Error('CMC段落过短，未充分呈现监控和控制。');
  }

  if (cmc.length > 650) {
    throw new Error('CMC段落过长，需要压缩。');
  }

  if (/\d+\s*\/\s*\d+/.test(cmc)) {
    throw new Error('CMC段落不得解释数字评分。');
  }

  if (!CONTROL_PATTERN.test(cmc)) {
    throw new Error('CMC段落缺少明确的控制操作。');
  }

  if (!CONDITIONAL_PATTERN.test(cmc)) {
    throw new Error('CMC段落缺少条件性的继续或停止判断。');
  }

  if (
    meta.process_flow_relevant === false &&
    UNIVERSAL_EXPERIENCE_PATTERN.test(cmc)
  ) {
    throw new Error('当前方案不适用体验流程标准，CMC却使用了该标准。');
  }

  const oldTemplateHitCount = OLD_TEMPLATE_PATTERNS
    .filter((pattern) => pattern.test(cmc))
    .length;

  if (oldTemplateHitCount >= 3) {
    throw new Error('CMC重复使用旧版固定句式，需要按当前案例重新组织。');
  }
}

function validateCrossSectionSeparation(evaluation) {
  const cmc = evaluation.cmc_overall_comment;
  const structured = [
    evaluation.structured_overall_comment,
    ...evaluation.cps_structure.map((row) => row.evaluative_comment)
  ].join(' ');

  if (
    evaluation.diagnostic_meta.process_flow_relevant === false &&
    UNIVERSAL_EXPERIENCE_PATTERN.test(structured)
  ) {
    throw new Error('结构化反馈把体验流程误作当前方案的通用标准。');
  }

  const cmcSentences = cmc
    .split(/[。！？]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 12);

  const duplicated = cmcSentences.some((sentence) =>
    structured.includes(sentence)
  );

  if (duplicated) {
    throw new Error('CMC与结构化反馈存在整句重复。');
  }
}

function normalizeEvaluation(rawEvaluation) {
  if (
    !rawEvaluation ||
    typeof rawEvaluation !== 'object' ||
    Array.isArray(rawEvaluation)
  ) {
    throw new Error('模型输出不是评价对象。');
  }

  const diagnosticMeta = normalizeDiagnosticMeta(
    rawEvaluation.diagnostic_meta
  );

  const cpsStructure = normalizeCpsStructure(
    rawEvaluation.cps_structure
  );

  const structuredOverallComment = requireText(
    rawEvaluation.structured_overall_comment,
    'structured_overall_comment'
  );

  if (STRUCTURED_DIRECTIVE_PATTERN.test(structuredOverallComment)) {
    throw new Error('总体评价包含修改建议，必须改为描述性评价。');
  }

  const cmcOverallComment = cleanCmc(
    requireText(
      rawEvaluation.cmc_overall_comment,
      'cmc_overall_comment'
    )
  );

  validateCmc(cmcOverallComment, diagnosticMeta);

  const normalized = {
    diagnostic_meta: diagnosticMeta,
    scores: normalizeScores(rawEvaluation.scores),
    cps_structure: cpsStructure,
    structured_overall_comment: structuredOverallComment,
    cmc_overall_comment: cmcOverallComment
  };

  validateCrossSectionSeparation(normalized);
  return normalized;
}

function explicitMockEvaluation() {
  return {
    diagnostic_meta: {
      primary_product_type: '模拟模式',
      process_flow_relevant: false,
      creative_process_state: '未调用模型，不能判断',
      control_operation: '未调用模型，不能判断',
      control_basis: '当前仅用于界面测试'
    },
    scores: {
      overall_score: 1,
      originality_score: 1,
      usefulness_score: 1,
      quality_score: 1,
      elaboration_score: 1
    },
    cps_structure: EXPECTED_STAGES.map((stage) => ({
      stage,
      stage_score: 1,
      evidence_from_draft: '模拟模式未调用模型。',
      evaluative_comment: '这是界面测试占位文本，不能作为实验反馈或研究数据。'
    })),
    structured_overall_comment:
      '当前为模拟模式，未生成真实评价，不能用于实验。',
    cmc_overall_comment:
      '当前为模拟模式，没有调用人工智能模型，因此不能根据草稿重建专家的创造力元认知过程。这段文字只用于检查页面显示、计时和数据传输是否正常，不能作为反馈内容、评分依据或正式实验数据。'
  };
}

async function requestCompletion(messages, config) {
  const requestBody = {
    model: config.model,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    messages
  };

  if (config.responseFormat === 'json_object') {
    requestBody.response_format = {
      type: 'json_object'
    };
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API请求失败：${response.status} ${errorText}`);
  }

  const data = await response.json();

  return {
    rawText: extractApiText(data),
    usage: data.usage || null
  };
}

function repairMessages(messages, rawText, validationError) {
  return [
    ...messages,
    {
      role: 'assistant',
      content: rawText
    },
    {
      role: 'user',
      content: `
The previous JSON failed the output audit:

${validationError.message}

Regenerate the complete JSON object from the original participant response.

Correct the identified problem while preserving evidence-based scoring.
Do not use a generic experience-flow diagnosis.
Do not copy the old CMC sentence template.
Return valid JSON only.
      `.trim()
    }
  ];
}

export async function generateEvaluation(messages) {
  const apiUrl = env('AI_API_URL');
  const apiKey = env('AI_API_KEY');
  const model = env('AI_MODEL', '__MODEL_TO_BE_SELECTED__');
  const allowMock = env('ALLOW_MOCK', 'false').toLowerCase() === 'true';

  if (
    !isConfigured(apiUrl) ||
    !isConfigured(apiKey) ||
    !isConfigured(model)
  ) {
    if (!allowMock) {
      throw new Error(
        'AI接口尚未完整配置。为防止模拟文本被误作实验数据，系统已停止生成。' +
        '如仅测试页面，请在.env中设置ALLOW_MOCK=true。'
      );
    }

    const parsedJson = explicitMockEvaluation();

    return {
      mock: true,
      model: 'explicit-mock',
      rawText: JSON.stringify(parsedJson, null, 2),
      parsedJson,
      usage: null
    };
  }

  const config = {
    apiUrl,
    apiKey,
    model,
    temperature: Number(env('AI_TEMPERATURE', '0')),
    maxTokens: Number(env('AI_MAX_TOKENS', '2500')),
    responseFormat: env('AI_RESPONSE_FORMAT', 'none')
  };

  const firstResult = await requestCompletion(messages, config);

  try {
    const parsedJson = normalizeEvaluation(
      parseJsonOutput(firstResult.rawText)
    );

    return {
      mock: false,
      model,
      rawText: firstResult.rawText,
      parsedJson,
      usage: firstResult.usage
    };
  } catch (firstError) {
    const repairedResult = await requestCompletion(
      repairMessages(messages, firstResult.rawText, firstError),
      config
    );

    try {
      const parsedJson = normalizeEvaluation(
        parseJsonOutput(repairedResult.rawText)
      );

      return {
        mock: false,
        model,
        rawText: repairedResult.rawText,
        parsedJson,
        usage: repairedResult.usage
      };
    } catch (secondError) {
      throw new Error(
        `模型两次输出均未通过评价结构检查：${secondError.message}`
      );
    }
  }
}
