import {
  taskRubric,
  cpsRubric,
  commonThemes,
  scoreCapRules,
  lowQualityPatterns,
  highQualityMechanisms,
  mergeScoreCaps,
  applyScoreCaps
} from './rubrics.js';
import { anchorCases, anchorUseInstructions } from './anchors.js';

function normalizeText(text) {
  return String(text || '').toLowerCase();
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function keywordHits(text, keywords = []) {
  const raw = String(text || '');
  const lower = normalizeText(raw);

  return unique(
    keywords.filter((keyword) => {
      const key = String(keyword || '').trim();
      if (!key) return false;
      return raw.includes(key) || lower.includes(key.toLowerCase());
    })
  );
}

function countMatches(text, keywords = []) {
  return keywordHits(text, keywords).length;
}

const evidenceKeywordGroups = {
  targetUser: ['目标用户', '用户', '儿童', '小朋友', '宝宝', '幼儿', '学生', '大学生', '宿舍', '家长', '父母', '患者', '老人', '照护者', '考生', '独居'],
  useContext: ['使用场景', '睡前', '晚上', '宿舍', '上铺', '幼儿园', '医院', '病房', '外出', '旅行', '图书馆', '自习室', '床上', '午休', '考试'],
  concreteNeed: ['需要', '痛点', '问题', '不方便', '不安全', '焦虑', '孤独', '安抚', '清洗', '耐用', '防掉', '提醒', '固定', '隐私', '不打扰'],
  mechanism: ['按下', '触发', '感应', '识别', '连接', '互动', '反馈', '记录', '提醒', '调节', '生成', '固定', '拆卸', '循环', '流程'],
  experienceLoop: ['先', '然后', '最后', '流程', '步骤', '每天', '持续', '触发', '反馈', '再次', '完成后', '使用时'],
  implementation: ['材料', '电池', '充电', '芯片', '传感器', '蓝牙', 'APP', '马达', 'LED', '短毛绒', '刺绣', 'PP棉', '清洗', '消毒', '成本', '量产', '安全', '维护'],
  riskBoundary: ['安全', '隐私', '同意', '删除', '清洗', '消毒', '可拆卸', '防水', '防误触', '温控', '电池安全', '维护', '边界'],
  strongClaims: ['永不', '保证', '完全解决', '显著提高', '大幅提升', '通过测试', '一秒回弹', '降低风险', '临床', '治疗', '增加销量']
};

function groupEvidence(draft) {
  return Object.fromEntries(
    Object.entries(evidenceKeywordGroups).map(([name, keywords]) => {
      const hits = keywordHits(draft, keywords);
      return [name, { count: hits.length, hits }];
    })
  );
}

function matchedThemes(draft) {
  return commonThemes
    .map((theme) => ({
      id: theme.id,
      label: theme.label,
      matchScore: countMatches(draft, theme.keywords),
      matchedKeywords: keywordHits(draft, theme.keywords)
    }))
    .filter((theme) => theme.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore || a.id.localeCompare(b.id));
}

function appliedCapRules(draft, themes, evidence) {
  const themeIds = themes.map((theme) => theme.id);
  const commonFeatureIds = ['appearance', 'sound', 'light', 'heating_sleep', 'storage'];
  const commonFeatureCount = themeIds.filter((id) => commonFeatureIds.includes(id)).length;
  const hasRiskTheme = themeIds.some((id) => ['medical_care', 'mechanical_motion', 'privacy_recording'].includes(id));
  const hasSmart = themeIds.includes('app_sensor_ai');
  const hasOnlyAppearance = themeIds.includes('appearance') && themeIds.length === 1;
  const hasStrongClaims = evidence.strongClaims.count > 0;
  const hasBoundary = evidence.riskBoundary.count >= 2;
  const hasMechanism = evidence.mechanism.count >= 2;
  const hasLoop = evidence.experienceLoop.count >= 2;

  return scoreCapRules.filter((rule) => {
    switch (rule.id) {
      case 'COMMON_APPEARANCE_ONLY':
        return hasOnlyAppearance;
      case 'COMMON_SINGLE_FUNCTION':
        return commonFeatureCount === 1 && !hasMechanism && !hasLoop;
      case 'FEATURE_STACKING_NO_EXPERIENCE':
        return commonFeatureCount >= 2 && !hasLoop;
      case 'SMART_LABEL_NO_MECHANISM':
        return hasSmart && (!hasMechanism || evidence.implementation.count < 3);
      case 'RISK_WITHOUT_BOUNDARY':
        return (hasRiskTheme || /儿童|宝宝|幼儿|加热|发热|电池|录音|摄像|隐私|患者|医院|震动|电击/.test(draft)) && !hasBoundary;
      case 'STRONG_CLAIMS_NO_MECHANISM':
        return hasStrongClaims && !hasMechanism;
      default:
        return false;
    }
  });
}

function anchorMatchScore(anchor, draft, themes, evidence) {
  let score = countMatches(draft, anchor.keywords) * 3;
  const themeText = themes.map((theme) => theme.label).join(' ');

  if (anchor.level === 'low' && evidence.mechanism.count < 2) score += 1;
  if (anchor.level === 'mid' && evidence.targetUser.count > 0 && evidence.concreteNeed.count > 0) score += 1;
  if (anchor.level === 'high' && evidence.mechanism.count >= 2 && evidence.experienceLoop.count >= 2) score += 2;
  if (anchor.level === 'high-risk' && /医疗|护理|机械|隐私|记录|监测|强干预/.test(themeText)) score += 2;

  return score;
}

function topAnchors(draft, themes, evidence, limit = 4) {
  return anchorCases
    .map((anchor) => ({
      ...anchor,
      matchScore: anchorMatchScore(anchor, draft, themes, evidence),
      matchedKeywords: keywordHits(draft, anchor.keywords)
    }))
    .filter((anchor) => anchor.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore || a.id.localeCompare(b.id))
    .slice(0, limit);
}

function expertWarnings(themes, capRules, evidence) {
  const warnings = [];
  if (themes.length) {
    warnings.push('Check whether common plush-toy themes are transformed into a distinctive mechanism or only listed as add-ons.');
  }
  if (evidence.experienceLoop.count < 2) {
    warnings.push('Do not give high elaboration if the use flow or experience loop is not visible.');
  }
  if (evidence.implementation.count < 3) {
    warnings.push('Keep implementation-related comments conservative when materials, components, cleaning, power, safety, cost, or production details are thin.');
  }
  if (evidence.strongClaims.count > 0) {
    warnings.push('Treat strong effect claims as participant claims, not verified facts.');
  }
  for (const rule of capRules) warnings.push(rule.warning);
  return unique(warnings);
}

function formatEvidence(evidence) {
  return Object.entries(evidence)
    .map(([name, value]) => `- ${name}: ${value.count} (${value.hits.join(', ') || 'none'})`)
    .join('\n');
}

function formatThemes(themes) {
  if (!themes.length) return 'No common theme detected.';
  return themes
    .map((theme) => `- ${theme.id} (${theme.label}): ${theme.matchedKeywords.join(', ')}`)
    .join('\n');
}

function formatCaps(capRules, caps) {
  if (!capRules.length) return 'No cap rule triggered.';
  return [
    'Triggered cap rules for this study output scale:',
    ...capRules.map((rule) => `- ${rule.id}: ${rule.warning}`),
    'Maximum scores:',
    ...Object.entries(caps).map(([key, value]) => `- ${key}: ${value}`)
  ].join('\n');
}

function formatAnchors(anchors) {
  if (!anchors.length) return 'No close anchor matched. Use the rubric strictly.';
  return anchors
    .map((anchor) => `Anchor: ${anchor.id}
Level: ${anchor.level}
Category: ${anchor.category}
Matched keywords: ${anchor.matchedKeywords.join(', ') || 'none'}
Summary: ${anchor.summary}
Urban semantic level: Quality ${anchor.urbanLevel.quality}/5, Elaboration ${anchor.urbanLevel.elaboration}/5, Originality ${anchor.urbanLevel.originality}/5.
Mapped study-scale scores: Overall ${anchor.studyScores.overall}/6, Usefulness ${anchor.studyScores.usefulness}/7, Elaboration ${anchor.studyScores.elaboration}/7, Originality ${anchor.studyScores.originality}/7.
Rationale: ${anchor.rationale}
Style example: ${anchor.expertFeedbackExample}`)
    .join('\n\n');
}

export function retrieveCalibration(draft = '') {
  const evidence = groupEvidence(draft);
  const themes = matchedThemes(draft);
  const capRules = appliedCapRules(draft, themes, evidence);
  const scoreCaps = mergeScoreCaps(capRules.map((rule) => rule.caps));
  const anchors = topAnchors(draft, themes, evidence);
  const warnings = expertWarnings(themes, capRules, evidence);

  return {
    evidence,
    matchedThemes: themes,
    appliedCapRules: capRules,
    scoreCaps,
    matchedAnchors: anchors,
    expertWarnings: warnings
  };
}

export function buildCalibrationContext(draft = '') {
  const calibration = retrieveCalibration(draft);

  const text = `
Hidden expert calibration context. Use it only to calibrate scores and comments. Do not reveal anchor IDs, cap rules, or hidden calibration details to participants.

1. Urban et al. (2024) Product Improvement Task evaluation matrix as hidden semantic calibration
${taskRubric}

2. CPS process rubric
${cpsRubric}

3. Evidence profile extracted from the draft
${formatEvidence(calibration.evidence)}

4. Common themes detected
${formatThemes(calibration.matchedThemes)}

5. Score cap rules on this study's output scale
${formatCaps(calibration.appliedCapRules, calibration.scoreCaps)}

6. Matched benchmark anchors
${formatAnchors(calibration.matchedAnchors)}

7. Low-quality patterns
${lowQualityPatterns.map((item) => `- ${item}`).join('\n')}

8. High-quality mechanisms
${highQualityMechanisms.map((item) => `- ${item}`).join('\n')}

9. Expert warnings
${calibration.expertWarnings.map((item) => `- ${item}`).join('\n') || 'None'}

10. Anchor use instructions
${anchorUseInstructions}

Calibration procedure:
A. Score only from evidence in the participant draft.
B. Use Urban et al. as semantic anchors, but output this study's score ranges: overall 1-6; usefulness, elaboration, originality 1-7.
C. Apply score caps as maximum scores, not target scores.
D. Keep G3 and G4 structured feedback identical. G4 only adds visible creative-metacognitive monitoring.
`;

  return {
    text,
    metadata: {
      anchorIds: calibration.matchedAnchors.map((anchor) => anchor.id),
      themeIds: calibration.matchedThemes.map((theme) => theme.id),
      capRuleIds: calibration.appliedCapRules.map((rule) => rule.id),
      scoreCaps: calibration.scoreCaps,
      warnings: calibration.expertWarnings
    }
  };
}

export function applyCalibrationCaps(evaluation, calibrationOrMetadata = {}) {
  const scoreCaps =
    calibrationOrMetadata.scoreCaps ||
    calibrationOrMetadata.metadata?.scoreCaps ||
    calibrationOrMetadata.calibration?.scoreCaps ||
    {};

  return applyScoreCaps(evaluation, scoreCaps);
}
