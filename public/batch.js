let shouldStop = false;
let batchResults = [];

function el(id) {
  return document.getElementById(id);
}

function logLine(message) {
  const box = el('batchLog');
  const stamp = new Date().toLocaleTimeString();
  box.textContent += `\n[${stamp}] ${message}`;
  box.scrollTop = box.scrollHeight;
}

function setMeta(message) {
  el('batchMeta').textContent = message;
}

function selectedConditions() {
  return Array.from(document.querySelectorAll('input[name="condition"]:checked')).map((item) => item.value);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseJsonl(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        const item = JSON.parse(line);
        if (!item.draft_id && !item.id) {
          throw new Error('missing draft_id');
        }
        if (!item.draft) {
          throw new Error('missing draft');
        }
        return item;
      } catch (error) {
        throw new Error(`第 ${index + 1} 行 JSONL 无法解析：${error.message}`);
      }
    });
}

function makeParticipantId(prefix, draftId, condition) {
  const safePrefix = String(prefix || 'pilot').replace(/[^\w-]/g, '_');
  const safeDraftId = String(draftId || 'unknown').replace(/[^\w-]/g, '_');
  return `${safePrefix}_${safeDraftId}_${condition}`;
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'application/jsonl;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function loadSampleLibrary() {
  setMeta('正在载入内置测试库。');

  const response = await fetch('/rabbit_cps_test_drafts.jsonl', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('没有找到 /rabbit_cps_test_drafts.jsonl，请先把测试库文件部署到 public 目录。');
  }

  const text = await response.text();
  el('jsonlInput').value = text.trim();

  const items = parseJsonl(text);
  setMeta(`已载入 ${items.length} 份测试初稿。`);
  el('batchCounter').textContent = `0/${items.length * selectedConditions().length}`;
  el('batchLog').textContent = `已载入内置测试库：${items.length} 份初稿。`;
}

async function runBatch() {
  shouldStop = false;
  batchResults = [];

  const prefix = el('participantPrefix').value.trim() || 'pilot';
  const delayMs = Math.max(0, Number.parseInt(el('delayMs').value || '0', 10));
  const conditions = selectedConditions();

  if (!conditions.length) {
    setMeta('请至少选择一个反馈条件。');
    return;
  }

  let drafts;
  try {
    drafts = parseJsonl(el('jsonlInput').value);
  } catch (error) {
    setMeta(error.message);
    return;
  }

  const tasks = [];
  for (const draft of drafts) {
    for (const condition of conditions) {
      tasks.push({ draft, condition });
    }
  }

  el('runBatch').disabled = true;
  el('stopBatch').disabled = false;
  el('downloadJsonl').disabled = true;
  el('batchLog').textContent = `准备运行：${drafts.length} 份初稿 × ${conditions.length} 个条件 = ${tasks.length} 条任务。`;
  setMeta('批量运行中。请保持页面打开。');

  let completed = 0;
  let failed = 0;

  for (const task of tasks) {
    if (shouldStop) {
      logLine('已手动停止，剩余任务未运行。');
      break;
    }

    const draftId = task.draft.draft_id || task.draft.id;
    const participantId = makeParticipantId(prefix, draftId, task.condition);
    const startedAt = new Date().toISOString();

    logLine(`开始 ${participantId}`);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          materialCode: task.condition,
          draft: task.draft.draft
        })
      });

      const data = await response.json();
      const finishedAt = new Date().toISOString();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      batchResults.push({
        draft_id: draftId,
        source_type: task.draft.source_type || '',
        participant_id: participantId,
        material_code: task.condition,
        condition: data.condition,
        condition_label: data.conditionLabel,
        record_id: data.recordId,
        model: data.model,
        mock: Boolean(data.mock),
        saved: Boolean(data.saved),
        save_error: data.saveError || '',
        feedback: data.feedback || '',
        started_at: startedAt,
        finished_at: finishedAt,
        ok: true
      });

      completed += 1;
      logLine(`完成 ${participantId}，记录编号：${data.recordId}，数据库保存：${data.saved ? '成功' : '失败'}`);
    } catch (error) {
      failed += 1;
      completed += 1;
      batchResults.push({
        draft_id: draftId,
        source_type: task.draft.source_type || '',
        participant_id: participantId,
        material_code: task.condition,
        error: error.message,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
        ok: false
      });
      logLine(`失败 ${participantId}：${error.message}`);
    }

    el('batchCounter').textContent = `${completed}/${tasks.length}`;
    setMeta(`已完成 ${completed}/${tasks.length}，失败 ${failed}。`);

    if (delayMs > 0 && completed < tasks.length) {
      await sleep(delayMs);
    }
  }

  el('runBatch').disabled = false;
  el('stopBatch').disabled = true;
  el('downloadJsonl').disabled = batchResults.length === 0;

  setMeta(`批量运行结束：共 ${batchResults.length} 条结果，失败 ${failed}。`);
  logLine('批量运行结束。建议下载 JSONL 结果并抽查 B/C/D 材料层级。');
}

function stopBatch() {
  shouldStop = true;
  setMeta('正在停止：当前这一条完成后会停下。');
}

function downloadResults() {
  const text = batchResults.map((item) => JSON.stringify(item)).join('\n');
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  downloadText(`batch_feedback_results_${stamp}.jsonl`, text);
}

function clearBatch() {
  shouldStop = false;
  batchResults = [];
  el('jsonlInput').value = '';
  el('batchLog').textContent = '尚未开始。';
  el('batchCounter').textContent = '0/0';
  el('downloadJsonl').disabled = true;
  setMeta('等待载入测试集合。');
}

el('loadSample').addEventListener('click', () => {
  loadSampleLibrary().catch((error) => setMeta(error.message));
});
el('runBatch').addEventListener('click', runBatch);
el('stopBatch').addEventListener('click', stopBatch);
el('downloadJsonl').addEventListener('click', downloadResults);
el('clearBatch').addEventListener('click', clearBatch);
