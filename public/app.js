let currentRecord = null;
let feedbackOpenedAt = null;
let timerHandle = null;

function el(id) {
  return document.getElementById(id);
}

function value(id) {
  return el(id).value.trim();
}

function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function startTimer() {
  stopTimer();
  feedbackOpenedAt = new Date();
  el('timer').textContent = '00:00';

  timerHandle = setInterval(() => {
    const elapsed = Math.floor((Date.now() - feedbackOpenedAt.getTime()) / 1000);
    el('timer').textContent = formatSeconds(elapsed);
  }, 1000);
}

function stopTimer() {
  if (timerHandle) clearInterval(timerHandle);
  timerHandle = null;
}

async function generateFeedback() {
  const participantId = value('participantId');
  const materialCode = value('materialCode');
  const draft = value('draft');

  if (!participantId) {
    el('meta').textContent = '请先填写被试编号。';
    return;
  }

  if (!draft) {
    el('meta').textContent = '请先粘贴反馈前CPS内容或反馈前完整方案。';
    return;
  }

  el('generate').disabled = true;
  el('complete').disabled = true;
  el('meta').textContent = '正在生成反馈，请稍候。';
  el('result').textContent = '生成中...';

  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId, materialCode, draft })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '生成失败');
    }

    currentRecord = {
      recordId: data.recordId,
      participantId,
      materialCode
    };

    el('result').textContent = data.feedback;

    const saveText = data.saved ? '成功' : '失败';
    const saveError = data.saveError ? `｜${data.saveError}` : '';
    const mockText = data.mock ? '｜当前为未配置API的模拟输出' : '';

    el('meta').textContent =
      `${data.conditionLabel}｜记录编号：${data.recordId}｜数据库保存：${saveText}${saveError}${mockText}`;

    el('complete').disabled = false;
    startTimer();
  } catch (error) {
    currentRecord = null;
    stopTimer();
    el('result').textContent = `错误：${error.message}`;
    el('meta').textContent = '生成失败，请检查网络、API配置或输入内容。';
  } finally {
    el('generate').disabled = false;
  }
}

function clearForm() {
  stopTimer();
  currentRecord = null;
  feedbackOpenedAt = null;

  el('participantId').value = '';
  el('materialCode').value = 'B';
  el('draft').value = '';
  el('result').textContent = '请先提交反馈前方案。';
  el('meta').textContent = '等待生成反馈。';
  el('timer').textContent = '00:00';
  el('complete').disabled = true;
}

async function copyFeedback() {
  await navigator.clipboard.writeText(el('result').textContent);

  el('meta').textContent = currentRecord
    ? `反馈已复制｜记录编号：${currentRecord.recordId}`
    : '反馈已复制。';
}

async function completeReading() {
  if (!currentRecord || !feedbackOpenedAt) return;

  const readingSeconds = Math.round((Date.now() - feedbackOpenedAt.getTime()) / 1000);

  stopTimer();
  el('complete').disabled = true;
  el('meta').textContent = `阅读完成，用时 ${readingSeconds} 秒。请回到实验材料继续修订。`;
}

el('generate').addEventListener('click', generateFeedback);
el('clear').addEventListener('click', clearForm);
el('copy').addEventListener('click', copyFeedback);
el('complete').addEventListener('click', completeReading);
