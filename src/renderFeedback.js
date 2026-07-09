const STAGE_NAMES = {
  Clarify: 'Clarify 澄清问题',
  Ideate: 'Ideate 生成想法',
  Develop: 'Develop 发展方案',
  Implement: 'Implement 形成方案'
};

function getValue(obj, path, fallback = '') {
  return path
    .split('.')
    .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? fallback;
}

function cleanScore(score) {
  if (score === undefined || score === null || score === '') return '';
  return String(score).replace(/[^\d]/g, '');
}

function scoreLine(evaluation) {
  const scores = evaluation?.scores || {};
  const usefulness = scores.usefulness_score ?? scores.quality_score;

  return [
    `整体创造性：${cleanScore(scores.overall_score)}/6`,
    `原创性：${cleanScore(scores.originality_score)}/7`,
    `实用性：${cleanScore(usefulness)}/7`,
    `具体性：${cleanScore(scores.elaboration_score)}/7`
  ].join('\n');
}

function cpsLines(evaluation) {
  const rows = Array.isArray(evaluation?.cps_structure) ? evaluation.cps_structure : [];

  return rows
    .map((row) => {
      const stage = STAGE_NAMES[row.stage] || row.stage || 'CPS阶段';
      const stageScore = cleanScore(row.stage_score);
      const evidence = row.evidence_from_draft || '未呈现';
      const comment = row.evaluative_comment || '未呈现';
      return `${stage}：${stageScore}/4\n证据：${evidence}\n评价：${comment}`;
    })
    .join('\n\n');
}

function qualityLines(evaluation) {
  return [
    `原创性：${getValue(evaluation, 'creative_quality.originality', '未呈现')}`,
    `实用性：${getValue(evaluation, 'creative_quality.usefulness', getValue(evaluation, 'creative_quality.quality', '未呈现'))}`,
    `具体性：${getValue(evaluation, 'creative_quality.elaboration', '未呈现')}`
  ].join('\n');
}

function cleanSentence(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/。+/g, '。')
    .trim();
}

function cmcLines(evaluation) {
  const demo = evaluation?.cmc_reasoning_demo || {};

  const parts = [
    demo.knowledge_activation,
    demo.evidence_monitoring,
    demo.bias_control,
    demo.dimension_distinction,
    demo.score_calibration
  ]
    .map(cleanSentence)
    .filter(Boolean);

  if (!parts.length) return '';

  return parts
    .map((part) => (/[。！？]$/.test(part) ? part : `${part}。`))
    .join('');
}

export function renderFeedback(condition, evaluation) {
  if (!evaluation || typeof evaluation !== 'object') {
    throw new Error('缺少有效的专家评价JSON。');
  }

  if (condition === 'outcome_only') {
    return `【结果性评分反馈】\n${scoreLine(evaluation)}`;
  }

  const structured = [
    '【结构化评价结果】',
    scoreLine(evaluation),
    '',
    '【CPS阶段评价】',
    cpsLines(evaluation),
    '',
    '【创造质量评价】',
    qualityLines(evaluation),
    '',
    '【总体评价】',
    evaluation.structured_overall_comment || '未呈现'
  ].join('\n');

  if (condition === 'structured_feedback') {
    return structured;
  }

  if (condition === 'cmc_reasoning_feedback') {
    return [
      '【专家创造力元认知示范】',
      cmcLines(evaluation) || '未呈现',
      '',
      structured
    ].join('\n');
  }

  throw new Error(`未知反馈条件：${condition}`);
}
