const PLACEHOLDER_PATTERN = /^__.*__$/;

const EXPECTED_STAGES = [
  'Clarify',
  'Ideate',
  'Develop',
  'Implement'
];

const FORBIDDEN_TERM_PATTERN = /草稿/;

const STRUCTURED_DIRECTIVE_PATTERN =
  /(建议|应当|应该|最好|不妨|尝试|可以进一步|优先处理|需要补充|修改为|返回.{0,8}阶段|保留.{0,12}功能|删除.{0,12}功能)/;

const REPEATED_SCORE_PATTERN =
  /(得分为|评分为|获得)\s*[1-7](?:\s*分)?/;

const BIASED_EXPERIENCE_PATTERN =
  /(完整的?用户体验|用户体验闭环|体验闭环|统一体验|整合体验)/;

const UNSUPPORTED_ASSERTION_PATTERN =
  /(确保|有效解决|有效支持|潜在市场价值|市场前景广阔|已通过.{0,12}测试|经测试证明)/;

const DIRECT_CONTENT_CONTROL_PATTERN =
  /(?:我会|我将).{0,12}(?:补充|加入|增加|设计出|改成|替换成)/;

const CONTROL_PATTERN =
  /(继续生成|继续搜索|切换|重新界定|重新理解|比较|筛选|检验|判断|持续发展|继续发展|继续深化|暂时保留|舍弃|分开|组合|继续投入|停止|结束|提交|完成当前构思)/;

const CONDITIONAL_PATTERN =
  /(如果|若|当.+时|仍未|仍然|达到.+后|满足.+后|只有.+才)/;

const CANDIDATE_COMPARISON_PATTERN =
  /(相比|相较|比较|分别来看|其中|两者|前者|后者|更接近|更具有)/;

const OLD_TEMPLATE_PATTERNS = [
  /接手这份.{0,12}时，我先明确/,
  /由此看来，当前问题不是/,
  /因此，我会把策略从/,
  /调整后，我会重新检查/,
  /这次判断形成的经验是/
];

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

    if (first !== -1 && last > first) {
      return JSON.parse(
        cleaned.slice(first, last + 1)
      );
    }

    throw new Error(
      '模型返回内容不是有效JSON。'
    );
  }
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .replace(/。{2,}/g, '。')
    .trim();
}

function requireText(value, fieldName) {
  const text = cleanText(value);

  if (!text) {
    throw new Error(
      `模型输出缺少字段：${fieldName}`
    );
  }

  return text;
}

function numberInRange(
  value,
  min,
  max,
  fieldName
) {
  const parsed = Number.parseInt(
    String(value ?? ''),
    10
  );

  if (!Number.isFinite(parsed)) {
    throw new Error(
      `${fieldName}缺少有效整数。`
    );
  }

  if (parsed < min || parsed > max) {
    throw new Error(
      `${fieldName}必须在${min}-${max}之间。`
    );
  }

  return parsed;
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
        if (typeof item === 'string') {
          return item;
        }

        return item?.text ||
          item?.content ||
          '';
      })
      .join('');

    if (joined.trim()) {
      return joined;
    }
  }

  throw new Error(
    'API响应中没有可读取的模型文本。'
  );
}

function assertTerminology(
  text,
  fieldName
) {
  if (FORBIDDEN_TERM_PATTERN.test(text)) {
    throw new Error(
      `${fieldName}使用了禁止的参与者术语。`
    );
  }
}

function assertEvidenceBoundary(
  text,
  fieldName
) {
  if (UNSUPPORTED_ASSERTION_PATTERN.test(text)) {
    throw new Error(
      `${fieldName}包含越过证据边界的断言。`
    );
  }

  if (
    /符合.{0,16}标准/.test(text) &&
    !/(声称|提出|提到|写明)/.test(text)
  ) {
    throw new Error(
      `${fieldName}把合规声称当作已验证事实。`
    );
  }
}

function normalizeScores(scores = {}) {
  const usefulness = numberInRange(
    scores.usefulness_score ??
      scores.quality_score,
    1,
    7,
    'usefulness_score'
  );

  return {
    overall_score: numberInRange(
      scores.overall_score,
      1,
      6,
      'overall_score'
    ),
    originality_score: numberInRange(
      scores.originality_score,
      1,
      7,
      'originality_score'
    ),
    usefulness_score: usefulness,
    quality_score: usefulness,
    elaboration_score: numberInRange(
      scores.elaboration_score,
      1,
      7,
      'elaboration_score'
    )
  };
}

function validateScoreRelationships(scores) {
  const dimensions = [
    scores.originality_score,
    scores.usefulness_score,
    scores.elaboration_score
  ];

  if (
    scores.overall_score === 6 &&
    dimensions.some((score) => score < 6)
  ) {
    throw new Error(
      '整体创造性6分缺少三个高水平维度的支持。'
    );
  }

  if (
    scores.overall_score === 5 &&
    dimensions.filter(
      (score) => score >= 5
    ).length < 2
  ) {
    throw new Error(
      '整体创造性5分缺少至少两个较强维度的支持。'
    );
  }
}

function validateStructuredText(
  text,
  fieldName
) {
  assertTerminology(text, fieldName);
  assertEvidenceBoundary(text, fieldName);

  if (STRUCTURED_DIRECTIVE_PATTERN.test(text)) {
    throw new Error(
      `${fieldName}包含修改方向或建议。`
    );
  }

  if (REPEATED_SCORE_PATTERN.test(text)) {
    throw new Error(
      `${fieldName}重复陈述了数字评分。`
    );
  }
}

function normalizeCpsStructure(rows) {
  if (!Array.isArray(rows)) {
    throw new Error(
      'cps_structure必须是数组。'
    );
  }

  return EXPECTED_STAGES.map((stage) => {
    const row = rows.find(
      (item) => item?.stage === stage
    );

    if (!row) {
      throw new Error(
        `cps_structure缺少${stage}阶段。`
      );
    }

    const evidence = requireText(
      row.evidence_from_draft,
      `${stage}.evidence_from_draft`
    );

    const comment = requireText(
      row.evaluative_comment,
      `${stage}.evaluative_comment`
    );

    assertTerminology(
      evidence,
      `${stage}.evidence_from_draft`
    );

    validateStructuredText(
      comment,
      `${stage}.evaluative_comment`
    );

    return {
      stage,
      stage_score: numberInRange(
        row.stage_score,
        1,
        4,
        `${stage}.stage_score`
      ),
      evidence_from_draft: evidence,
      evaluative_comment: comment
    };
  });
}

function validateStageScoreRelationships(
  scores,
  rows
) {
  const develop = rows.find(
    (row) => row.stage === 'Develop'
  );

  const implement = rows.find(
    (row) => row.stage === 'Implement'
  );

  if (
    scores.elaboration_score >= 6 &&
    develop?.stage_score < 3
  ) {
    throw new Error(
      '具体性6分以上与Develop阶段评分明显不一致。'
    );
  }

  if (
    scores.elaboration_score >= 6 &&
    implement?.stage_score < 3
  ) {
    throw new Error(
      '具体性6分以上与Implement阶段评分明显不一致。'
    );
  }
}

function extractIdeateSection(responseText) {
  const text = String(responseText || '');

  const startMatch = text.match(
    /(?:Ideate\s*生成想法|2[.．、\s]*Ideate|生成想法)/
  );

  if (
    !startMatch ||
    startMatch.index === undefined
  ) {
    return '';
  }

  const start =
    startMatch.index +
    startMatch[0].length;

  const remaining = text.slice(start);

  const endMatch = remaining.match(
    /(?:Develop\s*发展方案|3[.．、\s]*Develop|发展方案)/
  );

  if (
    !endMatch ||
    endMatch.index === undefined
  ) {
    return remaining;
  }

  return remaining.slice(
    0,
    endMatch.index
  );
}

function hasMultipleCandidates(responseText) {
  const section =
    extractIdeateSection(responseText);

  if (!section) {
    return false;
  }

  const matches = section.match(
    /(?:^|\n)\s*\d+\s*[.．、)]/g
  );

  return (matches || []).length >= 2;
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

function validateCmc(
  cmc,
  responseText
) {
  assertTerminology(
    cmc,
    'cmc_overall_comment'
  );

  assertEvidenceBoundary(
    cmc,
    'cmc_overall_comment'
  );

  if (cmc.length < 120) {
    throw new Error(
      'CMC段落过短。'
    );
  }

  if (cmc.length > 700) {
    throw new Error(
      'CMC段落过长。'
    );
  }

  if (/\d+\s*\/\s*\d+/.test(cmc)) {
    throw new Error(
      'CMC不得解释数字评分。'
    );
  }

  if (!CONTROL_PATTERN.test(cmc)) {
    throw new Error(
      'CMC缺少认知控制操作。'
    );
  }

  if (!CONDITIONAL_PATTERN.test(cmc)) {
    throw new Error(
      'CMC缺少条件性继续或停止判断。'
    );
  }

  if (DIRECT_CONTENT_CONTROL_PATTERN.test(cmc)) {
    throw new Error(
      'CMC直接规定了产品内容。'
    );
  }

  if (BIASED_EXPERIENCE_PATTERN.test(cmc)) {
    throw new Error(
      'CMC使用了通用体验偏置表达。'
    );
  }

  if (
    hasMultipleCandidates(responseText) &&
    !CANDIDATE_COMPARISON_PATTERN.test(cmc)
  ) {
    throw new Error(
      '存在多个候选想法，但CMC没有呈现比较。'
    );
  }

  if (
    /(已经选择|已经选定|选定了|最终方案|进入发展)/.test(cmc) &&
    /停止探索/.test(cmc)
  ) {
    throw new Error(
      '停止用语与当前创作阶段不一致。'
    );
  }

  if (
    /(目标.{0,8}明确|逻辑.{0,6}清晰|与目标.{0,6}契合)/.test(cmc) &&
    /(可以|能够|因此).{0,12}(结束|提交)/.test(cmc)
  ) {
    throw new Error(
      'CMC仅凭清晰度或目标契合判断结束。'
    );
  }

  const templateHits =
    OLD_TEMPLATE_PATTERNS.filter(
      (pattern) => pattern.test(cmc)
    ).length;

  if (templateHits >= 3) {
    throw new Error(
      'CMC重复使用旧版固定句式。'
    );
  }
}

function sentenceList(text) {
  return String(text || '')
    .split(/[。！？]/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 12);
}

function validateCrossSectionSeparation(
  evaluation
) {
  const structuredText = [
    evaluation.structured_overall_comment,
    ...evaluation.cps_structure.map(
      (row) => row.evaluative_comment
    )
  ].join(' ');

  if (
    BIASED_EXPERIENCE_PATTERN.test(
      structuredText
    )
  ) {
    throw new Error(
      '结构化反馈使用了通用体验偏置表达。'
    );
  }

  const duplicate = sentenceList(
    evaluation.cmc_overall_comment
  ).find(
    (sentence) =>
      structuredText.includes(sentence)
  );

  if (duplicate) {
    throw new Error(
      'CMC与结构化反馈存在整句重复。'
    );
  }
}

function normalizeEvaluation(
  rawEvaluation,
  responseText = ''
) {
  if (
    !rawEvaluation ||
    typeof rawEvaluation !== 'object' ||
    Array.isArray(rawEvaluation)
  ) {
    throw new Error(
      '模型输出不是有效评价对象。'
    );
  }

  const scores = normalizeScores(
    rawEvaluation.scores
  );

  validateScoreRelationships(scores);

  const cpsStructure =
    normalizeCpsStructure(
      rawEvaluation.cps_structure
    );

  validateStageScoreRelationships(
    scores,
    cpsStructure
  );

  const overallComment =
    requireText(
      rawEvaluation
        .structured_overall_comment,
      'structured_overall_comment'
    );

  validateStructuredText(
    overallComment,
    'structured_overall_comment'
  );

  const cmcComment = cleanCmc(
    requireText(
      rawEvaluation.cmc_overall_comment,
      'cmc_overall_comment'
    )
  );

  validateCmc(
    cmcComment,
    responseText
  );

  const normalized = {
    scores,
    cps_structure: cpsStructure,
    structured_overall_comment:
      overallComment,
    cmc_overall_comment:
      cmcComment
  };

  validateCrossSectionSeparation(
    normalized
  );

  return normalized;
}

function extractScoreSnapshot(rawText) {
  try {
    const parsed =
      parseJsonOutput(rawText);

    const scores =
      normalizeScores(parsed.scores);

    validateScoreRelationships(scores);

    if (
      !Array.isArray(
        parsed.cps_structure
      )
    ) {
      return null;
    }

    const stageScores =
      Object.fromEntries(
        EXPECTED_STAGES.map((stage) => {
          const row =
            parsed.cps_structure.find(
              (item) =>
                item?.stage === stage
            );

          if (!row) {
            throw new Error(
              'missing stage'
            );
          }

          return [
            stage,
            numberInRange(
              row.stage_score,
              1,
              4,
              `${stage}.stage_score`
            )
          ];
        })
      );

    return {
      scores,
      stageScores
    };
  } catch {
    return null;
  }
}

function applyScoreSnapshot(
  evaluation,
  snapshot
) {
  if (!snapshot) {
    return evaluation;
  }

  return {
    ...evaluation,
    scores: {
      ...snapshot.scores
    },
    cps_structure:
      Array.isArray(
        evaluation.cps_structure
      )
        ? evaluation.cps_structure.map(
            (row) => ({
              ...row,
              stage_score:
                snapshot
                  .stageScores[
                    row.stage
                  ] ??
                row.stage_score
            })
          )
        : evaluation.cps_structure
  };
}

function explicitMockEvaluation() {
  return {
    scores: {
      overall_score: 1,
      originality_score: 1,
      usefulness_score: 1,
      quality_score: 1,
      elaboration_score: 1
    },
    cps_structure:
      EXPECTED_STAGES.map(
        (stage) => ({
          stage,
          stage_score: 1,
          evidence_from_draft:
            '模拟模式未调用模型。',
          evaluative_comment:
            '这是界面测试占位文本，不能作为实验反馈或研究数据。'
        })
      ),
    structured_overall_comment:
      '当前为模拟模式，未生成真实评价，不能用于实验。',
    cmc_overall_comment:
      '当前为模拟模式，没有调用人工智能模型，因此不能根据参与者方案重建专家的创造力元认知过程。这段文字只用于检查页面显示、计时和数据传输是否正常，不能作为反馈内容、评分依据或正式实验数据。'
  };
}

async function requestCompletion(
  messages,
  config
) {
  const requestBody = {
    model: config.model,
    temperature:
      config.temperature,
    max_tokens:
      config.maxTokens,
    messages
  };

  if (
    config.responseFormat ===
    'json_object'
  ) {
    requestBody.response_format = {
      type: 'json_object'
    };
  }

  const response = await fetch(
    config.apiUrl,
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
        Authorization:
          `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(
        requestBody
      )
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `API请求失败：${response.status} ${errorText}`
    );
  }

  const data =
    await response.json();

  return {
    rawText:
      extractApiText(data),
    usage:
      data.usage || null
  };
}

function repairMessages(
  messages,
  rawText,
  validationError,
  scoreSnapshot
) {
  const scoreInstruction =
    scoreSnapshot
      ? `
The numerical scores passed the checks.
Preserve every overall, dimension, and CPS-stage score exactly.
Repair only the wording and JSON structure.
`
      : `
The scores did not pass the checks.
Re-evaluate them conservatively with the fixed Urban calibration.
`;

  return [
    ...messages,
    {
      role: 'assistant',
      content: rawText
    },
    {
      role: 'user',
      content: `
The previous output failed this current-request audit:

${validationError.message}

${scoreInstruction}

Regenerate the complete JSON using only the current participant response.

Do not add metadata.
Do not invent evidence.
Keep structured feedback descriptive.
Make CMC show monitoring and control.
The two sections may use the same underlying evidence but must not copy sentences.
Do not prescribe product content.
Do not use the Chinese word “草稿”.
Return valid JSON only.
      `.trim()
    }
  ];
}

export async function generateEvaluation(
  messages,
  context = {}
) {
  const responseText = String(
    context.draft || ''
  );

  const apiUrl =
    env('AI_API_URL');

  const apiKey =
    env('AI_API_KEY');

  const model = env(
    'AI_MODEL',
    '__MODEL_TO_BE_SELECTED__'
  );

  const allowMock =
    env(
      'ALLOW_MOCK',
      'false'
    ).toLowerCase() === 'true';

  if (
    !isConfigured(apiUrl) ||
    !isConfigured(apiKey) ||
    !isConfigured(model)
  ) {
    if (!allowMock) {
      throw new Error(
        'AI接口尚未完整配置。为防止模拟文本被误作实验数据，系统已停止生成。'
      );
    }

    const parsedJson =
      explicitMockEvaluation();

    return {
      mock: true,
      model: 'explicit-mock',
      rawText: JSON.stringify(
        parsedJson,
        null,
        2
      ),
      parsedJson,
      usage: null
    };
  }

  const config = {
    apiUrl,
    apiKey,
    model,
    temperature: Number(
      env(
        'AI_TEMPERATURE',
        '0'
      )
    ),
    maxTokens: Number(
      env(
        'AI_MAX_TOKENS',
        '2500'
      )
    ),
    responseFormat: env(
      'AI_RESPONSE_FORMAT',
      'none'
    )
  };

  const firstResult =
    await requestCompletion(
      messages,
      config
    );

  try {
    const parsedJson =
      normalizeEvaluation(
        parseJsonOutput(
          firstResult.rawText
        ),
        responseText
      );

    return {
      mock: false,
      model,
      rawText:
        firstResult.rawText,
      parsedJson,
      usage:
        firstResult.usage
    };
  } catch (firstError) {
    const scoreSnapshot =
      extractScoreSnapshot(
        firstResult.rawText
      );

    const repairedResult =
      await requestCompletion(
        repairMessages(
          messages,
          firstResult.rawText,
          firstError,
          scoreSnapshot
        ),
        config
      );

    try {
      const repairedJson =
        applyScoreSnapshot(
          parseJsonOutput(
            repairedResult.rawText
          ),
          scoreSnapshot
        );

      const parsedJson =
        normalizeEvaluation(
          repairedJson,
          responseText
        );

      return {
        mock: false,
        model,
        rawText:
          repairedResult.rawText,
        parsedJson,
        usage:
          repairedResult.usage
      };
    } catch (secondError) {
      throw new Error(
        `模型两次输出均未通过评价检查：${secondError.message}`
      );
    }
  }
}
