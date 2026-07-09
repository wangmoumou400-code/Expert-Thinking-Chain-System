export const anchorUseInstructions = `
Anchor responses are used only as hidden calibration examples. Do not reveal anchor IDs or copy anchor wording to participants.
Urban et al. (2024) anchors are used to calibrate semantic score levels, not to replace this study's output scales.
This study outputs overall creativity on 1-6 and originality/usefulness/elaboration on 1-7.
`;

export const anchorCases = [
  {
    id: 'URBAN_LOW_COLOR_EYES',
    level: 'low',
    category: 'common appearance change',
    keywords: ['颜色', '眼睛', '变大', '可爱', '外观'],
    summary: 'Changing color or making eyes larger.',
    urbanLevel: { quality: 1, elaboration: 1, originality: 1 },
    studyScores: { overall: 1, usefulness: 2, elaboration: 1, originality: 1 },
    rationale: 'This resembles Urban et al. low-level examples: non-specific, no detail, and among the most common ideas.',
    expertFeedbackExample: '该方案主要停留在外观变化层面，能让产品略有差异，但用户价值、细节和独特性都较弱。'
  },
  {
    id: 'URBAN_LOW_PERSONAL_CLOTHES',
    level: 'low',
    category: 'minor personalization',
    keywords: ['衣服', '换装', '个性化', '装饰', 'DIY', '小卡', '贴纸'],
    summary: 'Personalized clothing or decorative accessories.',
    urbanLevel: { quality: 2, elaboration: 2, originality: 2 },
    studyScores: { overall: 2, usefulness: 3, elaboration: 3, originality: 2 },
    rationale: 'Personalization is slightly different from ordinary toys but remains a minor improvement unless embedded in a stronger experience.',
    expertFeedbackExample: '个性化装饰有一定吸引力，但如果只是换衣或贴饰，它更像常见产品延展，而不是新的产品机制。'
  },
  {
    id: 'URBAN_MID_LED_LIGHT',
    level: 'mid',
    category: 'general trend smart feature',
    keywords: ['LED', '灯', '发光', '按钮', '夜灯', '灯带', '冷暖光'],
    summary: 'Built-in LED or light effects activated by buttons.',
    urbanLevel: { quality: 3, elaboration: 3, originality: 3 },
    studyScores: { overall: 3, usefulness: 4, elaboration: 4, originality: 3 },
    rationale: 'This follows a general smart-toy trend. It can be useful, but originality is limited unless tied to a specific user scenario and interaction loop.',
    expertFeedbackExample: '灯光功能能带来明确用途，但它属于常见智能玩具方向，评分关键在于是否说明具体场景、安全和使用流程。'
  },
  {
    id: 'URBAN_HIGH_READER_SPEAKER_BOOKS',
    level: 'mid-high',
    category: 'educational product extension',
    keywords: ['阅读', '读书', '绘本', '扬声器', '知识', '问答', '学习', '故事'],
    summary: 'A rabbit with reader and speaker functions sold with books, supporting learning or story interaction.',
    urbanLevel: { quality: 4, elaboration: 4, originality: 4 },
    studyScores: { overall: 5, usefulness: 6, elaboration: 6, originality: 5 },
    rationale: 'The idea creates a clearer use scenario and product value than simple playback, especially if interaction and learning experience are described.',
    expertFeedbackExample: '方案把毛绒兔从普通玩具转向阅读陪伴工具，用户价值更清楚；若互动规则和内容机制充分，能达到较高水平。'
  },
  {
    id: 'URBAN_TOP_APP_SENSOR_ECOSYSTEM',
    level: 'high',
    category: 'coherent multi-component ecosystem',
    keywords: ['APP', 'app', '麦克风', '扬声器', '传感器', '互动', '游戏', '任务', 'QR', '监测', '生态'],
    summary: 'A complementary app, microphone, speaker, and sensors form an interactive play/learning ecosystem.',
    urbanLevel: { quality: 5, elaboration: 5, originality: 5 },
    studyScores: { overall: 6, usefulness: 7, elaboration: 7, originality: 7 },
    rationale: 'This resembles the highest Urban et al. example: surprising cross-domain integration, coherent narrative, and strong product value.',
    expertFeedbackExample: '方案不只是增加功能，而是形成了兔子、应用、互动任务和持续使用之间的完整体验闭环。'
  },
  {
    id: 'COMMON_SOUND_PLAYBACK',
    level: 'low-mid',
    category: 'single common function',
    keywords: ['唱歌', '音乐', '儿歌', '喇叭', '播放', '录音', '语音'],
    summary: 'The rabbit plays songs, stories, recordings, or simple voice messages.',
    urbanLevel: { quality: 3, elaboration: 2, originality: 2 },
    studyScores: { overall: 3, usefulness: 4, elaboration: 3, originality: 2 },
    rationale: 'Sound playback is familiar in plush toys. It may be useful but is not highly original without a specific interaction logic.',
    expertFeedbackExample: '声音播放有基本实用价值，但如果只是按一下播放，它的原创性通常较低。'
  },
  {
    id: 'DORM_WAKEUP_RABBIT',
    level: 'mid',
    category: 'specific student scenario',
    keywords: ['宿舍', '早起', '赖床', '闹钟', '静音', '震动', '学生', '上铺'],
    summary: 'A dormitory wake-up rabbit for students who need to wake without disturbing roommates.',
    urbanLevel: { quality: 4, elaboration: 3, originality: 3 },
    studyScores: { overall: 4, usefulness: 6, elaboration: 4, originality: 4 },
    rationale: 'The user context is concrete, but common alarm or vibration mechanisms need safety, noise, comfort, and acceptance details.',
    expertFeedbackExample: '宿舍早起场景较清楚，实用性较强；但原创性取决于唤醒机制是否不同于普通闹钟。'
  },
  {
    id: 'EMOTIONAL_COMPANION_RABBIT',
    level: 'mid',
    category: 'emotional support',
    keywords: ['情绪', '陪伴', '孤独', '安抚', '焦虑', '压力', '睡前', '亲友'],
    summary: 'A rabbit for emotional companionship, sleep comfort, loneliness, or anxiety support.',
    urbanLevel: { quality: 4, elaboration: 3, originality: 3 },
    studyScores: { overall: 4, usefulness: 6, elaboration: 4, originality: 4 },
    rationale: 'Emotional companionship has plausible value but is common in smart plush products. Strong scores require concrete mechanism and boundaries.',
    expertFeedbackExample: '情绪陪伴方向有潜在价值，但不能只用“治愈”“陪伴”等词支撑高分，需要说明具体互动怎样发生。'
  },
  {
    id: 'MEDICAL_CARE_RISK_CAPPED',
    level: 'high-risk',
    category: 'medical or care scenario',
    keywords: ['患者', '术后', '医院', '病房', '伤口', '引流管', '康复', '疼痛', '护理', '消毒'],
    summary: 'A rabbit adapted for patient care, postoperative comfort, tube support, or rehabilitation.',
    urbanLevel: { quality: 4, elaboration: 3, originality: 5 },
    studyScores: { overall: 4, usefulness: 5, elaboration: 4, originality: 6 },
    rationale: 'A medical-care use is uncommon and can be original, but usefulness and elaboration must be capped if hygiene, pressure, safety, and care boundaries are missing.',
    expertFeedbackExample: '医疗护理场景能显著提高独特性，但它同时带来卫生、安全和使用边界问题，因此不能仅凭新颖就给满分。'
  },
  {
    id: 'MECHANICAL_FORCE_WAKEUP_RISK',
    level: 'high-risk',
    category: 'mechanical force intervention',
    keywords: ['弹射', '机械臂', '吸附', '轮子', '飞行', '震动', '电击', '撞', '图钉', '强制'],
    summary: 'A mechanically active rabbit that physically intervenes, wakes, pushes, pulls, or disturbs the user.',
    urbanLevel: { quality: 3, elaboration: 3, originality: 5 },
    studyScores: { overall: 4, usefulness: 4, elaboration: 4, originality: 6 },
    rationale: 'Mechanical intervention may be imaginative, but safety, acceptance, disturbance, durability, and failure modes must restrain expert scoring.',
    expertFeedbackExample: '机械干预很有想象力，但若没有说明安全、噪音和误触控制，实用性和具体性不能随原创性一起升高。'
  },
  {
    id: 'FORM_FUNCTION_INTEGRATED_RABBIT',
    level: 'high',
    category: 'rabbit form-function integration',
    keywords: ['耳朵', '肚子', '腹部', '四肢', '尾巴', '柔软', '抱着', '中空', '结构', '按扣', '魔术贴'],
    summary: 'The rabbit body form is used as part of the product mechanism, not only as decoration.',
    urbanLevel: { quality: 4, elaboration: 4, originality: 4 },
    studyScores: { overall: 5, usefulness: 6, elaboration: 6, originality: 5 },
    rationale: 'Using ears, belly, limbs, softness, or hugging affordances as functional mechanisms is stronger than attaching generic electronics.',
    expertFeedbackExample: '方案把兔子的身体结构转化为功能载体，这比单纯外接电子元件更接近产品设计层面的创造。'
  },
  {
    id: 'SAFETY_DURABILITY_OPTIMIZATION',
    level: 'mid-high',
    category: 'practical optimization',
    keywords: ['安全', '耐用', '清洗', '短毛', '刺绣', 'PP棉', '七孔棉', '不掉毛', '可机洗', '防吞咽'],
    summary: 'The rabbit is improved through safety, durability, cleaning, material, or manufacturing optimization.',
    urbanLevel: { quality: 5, elaboration: 4, originality: 3 },
    studyScores: { overall: 5, usefulness: 7, elaboration: 6, originality: 4 },
    rationale: 'This can be highly useful and detailed even if originality is moderate, because it optimizes known product weaknesses rather than creating a rare mechanism.',
    expertFeedbackExample: '安全和耐用优化可以获得较高实用性分，但它通常属于实用改良，原创性需要保持适度。'
  }
];
