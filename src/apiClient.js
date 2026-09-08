const PLACEHOLDER_PATTERN =
  /^__.*__$/;

const EXPECTED_STAGES = [
  'Clarify',
  'Ideate',
  'Develop',
  'Implement'
];

function env(name, fallback = '') {
  return process.env[name] || fallback;
}

function isConfigured(value) {
  return (
    Boolean(value) &&
    !PLACEHOLDER_PATTERN.test(value)
  );
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
    const firstBrace =
      cleaned.indexOf('{');

    const lastBrace =
      cleaned.lastIndexOf('}');

    if (
      firstBrace !== -1 &&
      lastBrace > firstBrace
    ) {
      return JSON.parse(
        cleaned.slice(
          firstBrace,
          lastBrace + 1
        )
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
    .replace(/草稿/g, '作答内容')
    .trim();
}

function cleanCmc(value) {
  return cleanText(value)
    .replace(
      /【(?:评价定向|核心自问|证据监控|核心判断|调节决策|再监控|可迁移原则|知识更新)】/g,
      ''
    )
    .replace(
      /(?:评价定向|核心自问|证据监控|核心判断|调节决策|再监控|可迁移原则|知识更新)\s*[:：]/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function requireText(
  value,
  fieldName
) {
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

  if (
    parsed < min ||
    parsed > max
  ) {
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

        return (
          item?.text ||
          item?.content ||
          ''
        );
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

function normalizeScores(
  scores = {}
) {
  const usefulness =
    numberInRange(
      scores.usefulness_score ??
        scores.quality_score,
      1,
      7,
      'usefulness_score'
    );

  return {
    overall_score:
      numberInRange(
        scores.overall_score,
        1,
        6,
        'overall_score'
      ),

    originality_score:
      numberInRange(
        scores.originality_score,
        1,
        7,
        'originality_score'
      ),

    usefulness_score:
      usefulness,

    quality_score:
      usefulness,

    elaboration_score:
      numberInRange(
        scores.elaboration_score,
        1,
        7,
        'elaboration_score'
      )
  };
}

function normalizeCpsStructure(
  rows
) {
  if (!Array.isArray(rows)) {
    throw new Error(
      'cps_structure必须是数组。'
    );
  }

  return EXPECTED_STAGES.map(
    (stage) => {
      const row = rows.find(
        (item) =>
          item?.stage === stage
      );

      if (!row) {
        throw new Error(
          `cps_structure缺少${stage}阶段。`
        );
      }

      return {
        stage,

        stage_score:
          numberInRange(
            row.stage_score,
            1,
            4,
            `${stage}.stage_score`
          ),

        evidence_from_draft:
          requireText(
            row.evidence_from_draft,
            `${stage}.evidence_from_draft`
          ),

        evaluative_comment:
          requireText(
            row.evaluative_comment,
            `${stage}.evaluative_comment`
          )
      };
    }
  );
}

function normalizeEvaluation(
  rawEvaluation
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

  const cmc = cleanCmc(
    requireText(
      rawEvaluation.cmc_overall_comment,
      'cmc_overall_comment'
    )
  );

  if (!cmc) {
    throw new Error(
      'cmc_overall_comment不能为空。'
    );
  }

  return {
    scores:
      normalizeScores(
        rawEvaluation.scores
      ),

    cps_structure:
      normalizeCpsStructure(
        rawEvaluation.cps_structure
      ),

    structured_overall_comment:
      requireText(
        rawEvaluation
          .structured_overall_comment,
        'structured_overall_comment'
      ),

    cmc_overall_comment:
      cmc
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

      body:
        JSON.stringify(
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

export async function generateEvaluation(
  messages
) {
  const apiUrl =
    env('AI_API_URL');

  const apiKey =
    env('AI_API_KEY');

  const model =
    env(
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
        'AI接口尚未完整配置。' +
        '为防止模拟文本被误作实验数据，系统已停止生成。' +
        '如仅测试页面，请设置ALLOW_MOCK=true。'
      );
    }

    const parsedJson =
      explicitMockEvaluation();

    return {
      mock: true,
      model: 'explicit-mock',

      rawText:
        JSON.stringify(
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

    temperature:
      Number(
        env(
          'AI_TEMPERATURE',
          '0'
        )
      ),

    maxTokens:
      Number(
        env(
          'AI_MAX_TOKENS',
          '2800'
        )
      ),

    responseFormat:
      env(
        'AI_RESPONSE_FORMAT',
        'none'
      )
  };

  /*
   * One participant request produces exactly one model call.
   * Semantic regexes, participant-specific retrieval, score caps,
   * and automatic whole-response regeneration are intentionally absent.
   */
  const result =
    await requestCompletion(
      messages,
      config
    );

  const parsedJson =
    normalizeEvaluation(
      parseJsonOutput(
        result.rawText
      )
    );

  return {
    mock: false,
    model,
    rawText: result.rawText,
    parsedJson,
    usage: result.usage
  };
}
