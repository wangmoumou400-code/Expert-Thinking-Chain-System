const STAGE_NAMES = {
  Clarify: 'Clarify 澄清问题',
  Ideate: 'Ideate 生成想法',
  Develop: 'Develop 发展方案',
  Implement: 'Implement 形成方案'
};

function cleanScore(score) {
  if (
    score === undefined ||
    score === null ||
    score === ''
  ) {
    return '';
  }

  return String(score).replace(/[^\d]/g, '');
}

function cleanText(text, fallback = '未呈现') {
  const cleaned = String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/。{2,}/g, '。')
    .trim();

  return cleaned || fallback;
}

function endSentence(text) {
  const cleaned = cleanText(text);

  if (/[。！？；]$/.test(cleaned)) {
    return cleaned;
  }

  return `${cleaned}。`;
}

function scoreLines(evaluation) {
  const scores = evaluation?.scores || {};

  const usefulness =
    scores.usefulness_score ??
    scores.quality_score;

  return [
    `整体创造性：${cleanScore(scores.overall_score)}/6`,
    `原创性：${cleanScore(scores.originality_score)}/7`,
    `实用性：${cleanScore(usefulness)}/7`,
    `具体性：${cleanScore(scores.elaboration_score)}/7`
  ].join('\n');
}

function cpsLines(evaluation) {
  const rows = Array.isArray(
    evaluation?.cps_structure
  )
    ? evaluation.cps_structure
    : [];

  return rows
    .map((row) => {
      const stage =
        STAGE_NAMES[row.stage] ||
        row.stage ||
        'CPS阶段';

      const score = cleanScore(row.stage_score);

      const evidence = cleanText(
        row.evidence_from_draft
      );

      const comment = cleanText(
        row.evaluative_comment
      );

      return [
        `${stage}：${score}/4`,
        `证据：${evidence}`,
        `评价：${comment}`
      ].join('\n');
    })
    .join('\n\n');
}

function cmcSections(evaluation) {
  const cmc =
    evaluation?.cmc_reasoning_demo || {};

  return [
    '【评价定向】',
    endSentence(cmc.orientation),
    '',
    '【核心自问】',
    endSentence(cmc.diagnostic_question),
    '',
    '【证据监控】',
    endSentence(cmc.evidence_monitoring),
    '',
    '【核心判断】',
    endSentence(cmc.priority_diagnosis),
    '',
    '【调节决策】',
    endSentence(cmc.control_decision),
    '',
    '【再监控】',
    endSentence(cmc.re_monitoring),
    '',
    '【可迁移原则】',
    endSentence(cmc.transfer_rule)
  ].join('\n');
}

function commonStructuredFeedback(evaluation) {
  return [
    '【结构化评价结果】',
    scoreLines(evaluation),
    '',
    '【CPS阶段评价】',
    cpsLines(evaluation),
    '',
    '【总体评价】',
    cleanText(
      evaluation.structured_overall_comment
    )
  ].join('\n');
}

export function renderFeedback(
  condition,
  evaluation
) {
  if (
    !evaluation ||
    typeof evaluation !== 'object'
  ) {
    throw new Error(
      '缺少有效的专家评价JSON。'
    );
  }

  if (condition === 'outcome_only') {
    return [
      '【结果性评分反馈】',
      scoreLines(evaluation)
    ].join('\n');
  }

  if (condition === 'structured_feedback') {
    return commonStructuredFeedback(
      evaluation
    );
  }

  if (
    condition === 'cmc_reasoning_feedback'
  ) {
    return [
      '【专家创造力元认知示范】',
      cmcSections(evaluation),
      '',
      commonStructuredFeedback(evaluation)
    ].join('\n');
  }

  throw new Error(
    `未知反馈条件：${condition}`
  );
}
