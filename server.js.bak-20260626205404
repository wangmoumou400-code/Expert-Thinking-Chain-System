import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateEvaluation } from './src/apiClient.js';
import { buildMessages, promptVersion } from './src/prompts.js';
import { renderFeedback } from './src/renderFeedback.js';
import { saveFeedbackRecord } from './src/storage.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(__dirname, 'public');

loadEnvFile(join(__dirname, '.env'));

const port = Number(process.env.PORT || 4300);

const conditionMap = {
  B: 'outcome_only',
  C: 'structured_feedback',
  D: 'cmc_reasoning_feedback'
};

const conditionLabel = {
  B: '结果性评分反馈',
  C: '常规结构化专家反馈',
  D: '专家CMC思维链反馈'
};

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, 'utf8');

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8'
  });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;

    if (size > 1024 * 1024) {
      throw new Error('提交内容过大，请减少文本长度。');
    }

    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function normalizeMaterialCode(code) {
  return String(code || '').trim().toUpperCase();
}

function makeRecordId(materialCode, participantId) {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const safeParticipant = String(participantId || 'unknown').replace(/[^\w-]/g, '_');
  return `${stamp}_${materialCode}_${safeParticipant}`;
}

async function handleFeedback(req, res) {
  const payload = await readBody(req);
  const materialCode = normalizeMaterialCode(payload.materialCode);
  const condition = conditionMap[materialCode];

  if (!condition) {
    sendJson(res, 400, {
      error: '本系统仅用于材料B、材料C、材料D。请检查材料编号。'
    });
    return;
  }

  if (!String(payload.draft || '').trim()) {
    sendJson(res, 400, {
      error: '请粘贴反馈前CPS内容或反馈前完整方案。'
    });
    return;
  }

  const messages = buildMessages({
    ...payload,
    materialCode,
    condition
  });

  const evaluationResult = await generateEvaluation(messages, {
    materialCode,
    draft: payload.draft
  });

  const displayedFeedback = renderFeedback(
    condition,
    evaluationResult.parsedJson
  );

  const recordId = makeRecordId(materialCode, payload.participantId);

  let saved = false;
  let saveError = '';

  try {
    const saveResult = await saveFeedbackRecord({
      participantId: payload.participantId,
      materialCode,
      condition,
      conditionLabel: conditionLabel[materialCode],
      model: evaluationResult.model,
      promptVersion,
      inputText: payload.draft || '',
      feedbackText: displayedFeedback,
      rawAiOutput: evaluationResult.rawText || '',
      parsedJson: evaluationResult.parsedJson || null,
      mock: Boolean(evaluationResult.mock)
    });

    saved = Boolean(saveResult.saved);
  } catch (error) {
    saveError = error.message || String(error);
    console.error('Supabase save error:', saveError);
  }

  sendJson(res, 200, {
    recordId,
    materialCode,
    condition,
    conditionLabel: conditionLabel[materialCode],
    model: evaluationResult.model,
    mock: Boolean(evaluationResult.mock),
    feedback: displayedFeedback,
    saved,
    saveError
  });
}

async function handleReadingComplete(req, res) {
  await readBody(req);
  sendJson(res, 200, { ok: true });
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  const safePath = normalize(pathname).replace(/^([/\\])+/, '');
  const filePath = join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const content = await readFile(filePath);
    res.writeHead(200, {
      'Content-Type': mime[extname(filePath)] || 'application/octet-stream'
    });
    res.end(content);
  } catch {
    res.writeHead(404, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/feedback') {
      await handleFeedback(req, res);
      return;
    }

    if (req.method === 'POST' && req.url === '/api/reading-complete') {
      await handleReadingComplete(req, res);
      return;
    }

    await serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, {
      error: error.message || String(error)
    });
  }
});

server.listen(port, () => {
  console.log(`CPS CMC expert feedback system: http://localhost:${port}`);
});
