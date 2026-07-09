export const rubricVersion = 'v9-urban-hidden-calibration-output-6-7-2026-07-02';

export const taskRubric = `
Task-specific expert rubric for the ordinary 30 cm plush rabbit Product Improvement Task.

Urban et al. (2024, Computers & Education), Appendix 1 provides a Product Improvement Task evaluation matrix with three dimensions:
1. Quality: usefulness for goals.
2. Elaboration: amount of detail and coherence.
3. Originality: uniqueness of ideas.

In this system, Urban et al.'s matrix is used as a hidden expert calibration framework, not as the participant-facing scoring scale.

Mapping to this study:
- Urban Quality corresponds to this study's usefulness_score / 实用性.
- Urban Elaboration corresponds to this study's elaboration_score / 具体性.
- Urban Originality corresponds to this study's originality_score / 原创性.
- Overall creativity is this study's holistic expert judgment.

Participant-facing output scales:
- overall_score: 1-6.
- usefulness_score / quality_score: 1-7.
- elaboration_score: 1-7.
- originality_score: 1-7.
- CPS stage_score: 1-4.

Urban-style semantic anchors:
- Very low: non-specific ideas, color change, larger eyes, no detail, most common ideas.
- Low: minor decorative or personalization changes, such as clothing or surface accessories.
- Medium: major but common trend-based improvements, such as LED light, music, simple smart function, pocket, heating, or recording.
- High: clearer scenario-based product extension, such as reading support, learning companion, situated emotional support, or a coherent use process.
- Very high: surprising and coherent cross-domain integration, where multiple elements form one meaningful product experience.

Important calibration principles:
- Do not convert the output to Urban's 1-5 scale.
- Use Urban's criteria to decide what counts as low, medium, or high quality, elaboration, and originality.
- Common add-ons such as lights, music, clothing, pockets, heating, recording, Bluetooth, app, or sensors should not receive high originality unless the draft explains a distinctive mechanism or user experience.
- Practical optimization can receive high usefulness and elaboration even when originality is moderate.
- High-risk ideas involving children, medical use, heating, electronics, movement, privacy, emotional support, or data collection require safety, boundary, maintenance, or implementation awareness before receiving high usefulness or elaboration.
- Participants are university students in a short laboratory task. Do not require market survey data, real user feedback data, professional testing data, or industry-level cost estimates.
- Treat strong claims such as "永不脱落", "通过严格测试", "一秒回弹", "显著提升", "完全解决", "降低风险", or "容易量产" as participant claims, not verified evidence.
`;

export const cpsRubric = `
CPS process rubric for structured feedback, scored 1-4.

Clarify:
1 = missing user, context, and need.
2 = broad user or broad need only.
3 = clear user, context, and need.
4 = specific user, situated context, concrete need, and relevant constraint.

Ideate:
1 = no visible idea generation.
2 = mainly common feature additions.
3 = several relevant directions or one clear alternative direction.
4 = meaningfully diverse directions or a distinctive creative mechanism.

Develop:
1 = no selected concept.
2 = loose feature list.
3 = coherent basic solution with core design and use mode.
4 = integrated product experience with clear relation among functions, user need, and use flow.

Implement:
1 = no feasibility information.
2 = shallow feasibility statement.
3 = some material, technology, use-flow, safety, cleaning, cost, or production detail.
4 = credible implementation awareness with relevant constraints or risks addressed.
`;

export const commonThemes = [
  {
    id: 'appearance',
    label: '外观/颜色/换装',
    keywords: ['颜色', '眼睛', '外观', '衣服', '换装', '装饰', '蝴蝶结', '贴纸', '刺绣', '小卡', 'DIY']
  },
  {
    id: 'sound',
    label: '声音/音乐/录音',
    keywords: ['唱歌', '音乐', '儿歌', '喇叭', '播放', '录音', '语音', '故事', '声音']
  },
  {
    id: 'light',
    label: '灯光/夜灯/发光',
    keywords: ['灯', '发光', '夜灯', 'LED', '投影', '冷暖光', '灯带', '补光']
  },
  {
    id: 'heating_sleep',
    label: '加热/睡眠/陪伴',
    keywords: ['加热', '发热', '暖手', '热敷', '睡前', '助眠', '抱枕', '陪伴', '安抚']
  },
  {
    id: 'storage',
    label: '口袋/收纳',
    keywords: ['口袋', '收纳', '拉链', '装东西', '小包', '隐藏袋', '文具']
  },
  {
    id: 'app_sensor_ai',
    label: 'APP/传感器/智能',
    keywords: ['APP', 'app', '蓝牙', '芯片', '传感器', 'AI', '算法', '识别', '数据', '小程序']
  },
  {
    id: 'learning',
    label: '学习/复习/知识',
    keywords: ['学习', '背单词', '词汇', '复习', '真题', '知识', '教育', '考试', '学生']
  },
  {
    id: 'medical_care',
    label: '医疗/护理/康复',
    keywords: ['患者', '术后', '医院', '病房', '伤口', '引流管', '康复', '疼痛', '过敏', '消毒', '护理']
  },
  {
    id: 'mechanical_motion',
    label: '机械运动/强干预',
    keywords: ['轮子', '爬', '跑', '机械臂', '弹射', '飞行', '吸附', '马达', '震动', '电击', '图钉']
  },
  {
    id: 'privacy_recording',
    label: '隐私/记录/监测',
    keywords: ['录音', '摄像', '麦克风', '定位', '记录', '监测', '情绪识别', '上传', '云端', '隐私']
  }
];

export const scoreCapRules = [
  {
    id: 'COMMON_APPEARANCE_ONLY',
    condition: 'The draft mainly changes color, eyes, clothing, decoration, or surface appearance.',
    caps: { originalityMax: 3, usefulnessMax: 4, qualityMax: 4, overallMax: 3 },
    warning: 'Appearance changes are common low-level product improvements unless they create a new interaction or use scenario.'
  },
  {
    id: 'COMMON_SINGLE_FUNCTION',
    condition: 'The core proposal is a single common plush-toy function such as music, light, pocket, warmth, or recording.',
    caps: { originalityMax: 4, overallMax: 4 },
    warning: 'A single common feature should not be treated as highly original.'
  },
  {
    id: 'FEATURE_STACKING_NO_EXPERIENCE',
    condition: 'Several functions are listed but no coherent trigger-interaction-feedback-use experience is explained.',
    caps: { originalityMax: 4, elaborationMax: 4, overallMax: 4 },
    warning: 'Function stacking is not the same as a coherent product concept.'
  },
  {
    id: 'SMART_LABEL_NO_MECHANISM',
    condition: 'The draft mentions APP, AI, Bluetooth, chip, sensor, or algorithm but does not explain data, mechanism, user control, or use flow.',
    caps: { originalityMax: 4, elaborationMax: 4, usefulnessMax: 5, qualityMax: 5, overallMax: 4 },
    warning: 'Technology labels should not inflate expert scores without mechanism evidence.'
  },
  {
    id: 'RISK_WITHOUT_BOUNDARY',
    condition: 'The draft involves children, heating, electronics, movement, medical use, privacy, recording, emotional support, or physical force but lacks safety, cleaning, privacy, consent, maintenance, or use-boundary explanation.',
    caps: { usefulnessMax: 5, qualityMax: 5, elaborationMax: 4, overallMax: 4 },
    warning: 'Risk-sensitive concepts need boundary and feasibility awareness before high usefulness or elaboration scores.'
  },
  {
    id: 'STRONG_CLAIMS_NO_MECHANISM',
    condition: 'The draft makes strong claims such as fully solves, guarantees, passes strict testing, greatly improves, reduces risk, clinical value, or increases sales without explaining mechanism or boundary.',
    caps: { usefulnessMax: 5, qualityMax: 5, elaborationMax: 5 },
    warning: 'Strong claims should be treated as unverified participant claims.'
  }
];

export const lowQualityPatterns = [
  'Only changes color, eyes, clothing, decoration, or cuteness.',
  'Only adds one common function such as music, light, heat, pocket, recording, or simple app control.',
  'Lists many functions without explaining how they form one user experience.',
  'Uses broad needs such as fun, cute, useful, emotional, or companion without a concrete user/context.',
  'Uses smart technology labels without explaining mechanism, use flow, safety, privacy, or maintenance.',
  'Claims effects that are not supported by a plausible mechanism within the draft.'
];

export const highQualityMechanisms = [
  'A concrete user and use situation are identified before functions are added.',
  'The rabbit form itself is used meaningfully, such as ears, belly, limbs, softness, hugging, portability, or symbolic value.',
  'The concept forms a coherent use loop: need, trigger, interaction, feedback, and continued use.',
  'The proposal distinguishes what is new, why it matters, and how users experience it.',
  'Implementation details address materials, use flow, safety, cleaning, power, privacy, durability, cost, or production when relevant.',
  'The idea balances originality with plausible usefulness instead of relying on novelty alone.'
];

export function mergeScoreCaps(capsList = []) {
  const merged = {};

  for (const caps of capsList) {
    if (!caps || typeof caps !== 'object') continue;
    for (const [key, value] of Object.entries(caps)) {
      if (typeof value !== 'number') continue;
      merged[key] = merged[key] === undefined ? value : Math.min(merged[key], value);
    }
  }

  return merged;
}

export function applyScoreCaps(evaluation, scoreCaps = {}) {
  if (!evaluation || typeof evaluation !== 'object') return evaluation;

  const scores = evaluation.scores || {};
  const usefulnessKey = scores.usefulness_score !== undefined ? 'usefulness_score' : 'quality_score';

  if (typeof scoreCaps.overallMax === 'number') {
    scores.overall_score = Math.min(scores.overall_score ?? scoreCaps.overallMax, scoreCaps.overallMax);
  }

  const usefulnessMax = scoreCaps.usefulnessMax ?? scoreCaps.qualityMax;
  if (typeof usefulnessMax === 'number') {
    scores[usefulnessKey] = Math.min(scores[usefulnessKey] ?? usefulnessMax, usefulnessMax);
    scores.quality_score = scores[usefulnessKey];
    scores.usefulness_score = scores[usefulnessKey];
  }

  if (typeof scoreCaps.elaborationMax === 'number') {
    scores.elaboration_score = Math.min(scores.elaboration_score ?? scoreCaps.elaborationMax, scoreCaps.elaborationMax);
  }

  if (typeof scoreCaps.originalityMax === 'number') {
    scores.originality_score = Math.min(scores.originality_score ?? scoreCaps.originalityMax, scoreCaps.originalityMax);
  }

  evaluation.scores = scores;

  const stageCaps = {
    Clarify: scoreCaps.clarifyMax,
    Ideate: scoreCaps.ideateMax,
    Develop: scoreCaps.developMax,
    Implement: scoreCaps.implementMax
  };

  if (Array.isArray(evaluation.cps_structure)) {
    evaluation.cps_structure = evaluation.cps_structure.map((row) => {
      const cap = stageCaps[row.stage];
      if (typeof cap === 'number') {
        return { ...row, stage_score: Math.min(row.stage_score ?? cap, cap) };
      }
      return row;
    });
  }

  return evaluation;
}
