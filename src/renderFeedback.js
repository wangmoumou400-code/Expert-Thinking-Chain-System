const STAGE_NAMES = {
  Clarify: '1. 明确问题与目标',
  Ideate: '2. 提出多种想法',
  Develop: '3. 形成并发展方案',
  Implement: '4. 完善最终方案'
};

const PARTICIPANT_TERM_REPLACEMENTS = [
  [/\bClarify\b/gi, '明确问题与目标'],
  [/\bIdeate\b/gi, '提出多种想法'],
  [/\bDevelop\b/gi, '形成并发展方案'],
  [/\bImplement\b/gi, '完善最终方案'],
  [/CPS\s*阶段/gi, '四个阶段'],
  [/\bCPS\b/gi, '四阶段']
];

function cleanScore(score) {
  if (
    score === undefined ||
    score === null ||
    score === ''
  ) {
    return '';
  }

  return String(score)
    .replace(/[^\d]/g, '');
}

function cleanText(
  text,
  fallback = '未呈现'
) {
  let cleaned = String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/。{2,}/g, '。')
    .trim();

  for (
    const [pattern, replacement]
    of PARTICIPANT_TERM_REPLACEMENTS
  ) {
    cleaned = cleaned.replace(
      pattern,
      replacement
    );
  }

  return cleaned || fallback;
}

function scoreLines(evaluation) {
  const scores =
    evaluation?.scores || {};

  const usefulness =
    scores.usefulness_score ??
    scores.quality_score;

  return [
    `整体创造性：${cleanScore(
      scores.overall_score
    )}/6`,

    `原创性：${cleanScore(
      scores.originality_score
    )}/7`,

    `实用性：${cleanScore(
      usefulness
    )}/7`,

    `具体性：${cleanScore(
      scores.elaboration_score
    )}/7`
  ].join('\n');
}

function stageLines(evaluation) {
  const rows = Array.isArray(
    evaluation?.cps_structure
  )
    ? evaluation.cps_structure
    : [];

  return rows
    .map((row) => {
      const stage =
        STAGE_NAMES[row.stage] ||
        '阶段';

      const score = cleanScore(
        row.stage_score
      );

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

function overallComment(evaluation) {
  return cleanText(
    evaluation?.cmc_overall_comment,
    '当前未生成总体评语。'
  );
}

function commonStructuredFeedback(
  evaluation
) {
  return [
    '【结构化评价结果】',
    scoreLines(evaluation),
    '',
    '【阶段评分反馈】',
    stageLines(evaluation),
    '',
    '【总体评价】',
    cleanText(
      evaluation
        .structured_overall_comment
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

  if (
    condition === 'structured_feedback'
  ) {
    return commonStructuredFeedback(
      evaluation
    );
  }

  if (
    condition ===
    'cmc_reasoning_feedback'
  ) {
    return [
      '【总体评语】',
      overallComment(evaluation),
      '',
      commonStructuredFeedback(
        evaluation
      )
    ].join('\n');
  }

  throw new Error(
    `未知反馈条件：${condition}`
  );
}
