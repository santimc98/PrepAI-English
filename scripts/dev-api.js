// scripts/dev-api.js
// Pequeño servidor Node (sin TS) para desarrollo local.
// Atiende POST /api/generate-exam y llama a Ollama (http://localhost:11434).

/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

const http = require('http');
const { URL } = require('url');
const path = require('path');

// Carga .env.local para que el server tenga EXAM_AI_* en local
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env.local'), override: true });
  console.log('[dev-api] model =', process.env.EXAM_AI_MODEL, ' base =', process.env.EXAM_AI_BASE_URL);
} catch (_) {}

// JSON schema for exam validation (currently unused but kept for future validation)
const _schema = {
  type: 'object',
  required: ['id', 'title', 'level', 'sections', 'items', 'createdAt'],
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    level: { enum: ['B1', 'B2', 'C1', 'C2'] },
    sections: { type: 'array', items: { enum: ['Reading', 'Use of English', 'Listening', 'Writing', 'Speaking'] } },
    items: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'type', 'prompt', 'section'],
        properties: {
          id: { type: 'string' },
          type: { enum: ['mcq', 'gap', 'open'] },
          prompt: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          answer: {},
          section: { enum: ['Reading', 'Use of English', 'Listening', 'Writing', 'Speaking'] },
          points: { type: 'number' },
        },
      },
    },
    createdAt: { type: 'number' },
  },
};

function send(res, code, data, headers = {}) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(code, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  });
  res.end(body);
}

function coerceSection(s) {
  const m = String(s || '').trim().toLowerCase();
  if (m.includes('use')) return 'Use of English';
  if (m.startsWith('read')) return 'Reading';
  if (m.startsWith('listen')) return 'Listening';
  if (m.startsWith('writ')) return 'Writing';
  if (m.startsWith('speak')) return 'Speaking';
  return 'Reading';
}

function nowId(prefix = 'exam') {
  const t = Date.now();
  return `${prefix}-${t}-${Math.random().toString(36).slice(2, 8)}`;
}

function fallbackExam(level, sections) {
  const ts = Date.now();
  const secs = Array.isArray(sections) && sections.length ? sections : ['Reading', 'Use of English', 'Listening'];
  return {
    id: nowId('fallback'),
    title: `Simulacro ${level}`,
    level,
    sections: secs,
    createdAt: ts,
    items: [
      {
        id: `mcq-${ts}`,
        type: 'mcq',
        prompt: `[${level}] Choose the correct option to complete the sentence.`,
        options: ['A', 'B', 'C', 'D'],
        answer: 1,
        section: 'Reading',
        points: 1,
      },
      {
        id: `gap-${ts}`,
        type: 'gap',
        prompt: `[${level}] Fill the gap with the correct form of the word in brackets.`,
        answer: 'example',
        section: 'Use of English',
        points: 1,
      },
    ],
  };
}

// --- Utils para parsear JSON robusto ---
function stripCodeFences(s) {
  return String(s || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '');
}

function _extractFirstJsonObject(s) {
  // Devuelve el primer objeto JSON balanceado { ... } que encuentre
  const text = stripCodeFences(s);
  const start = text.indexOf('{');
  if (start === -1) throw new Error('No JSON object start');
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === '"') inStr = false;
    } else {
      if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          const slice = text.slice(start, i + 1);
          return JSON.parse(slice);
        }
      }
    }
  }
  throw new Error('Unterminated JSON object');
}

// --- Ollama (compat JSON, robusto) ---
async function callOllama({ level, sections }) {
  const base = (process.env.EXAM_AI_BASE_URL || 'http://localhost:11434').replace(/\/+$/, '');
  const model = process.env.EXAM_AI_MODEL || 'llama3.1:8b-instruct';
  const itemsPerSection = Number(process.env.EXAM_AI_ITEMS_PER_SECTION || 1);
  const timeoutMs = Number(process.env.EXAM_AI_TIMEOUT_MS || 120000);

  async function callWithTimeout(body) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      return res;
    } finally {
      clearTimeout(t);
    }
  }

  // 1) Prompt enfocado a JSON puro
  const system = [
    'You generate Cambridge-style English exam items.',
    'Return ONLY a valid JSON object, no markdown, no comments.',
    'Use EXACTLY the requested sections (same order).',
    `Generate exactly ${itemsPerSection} items per section.`,
    'For MCQ: include 4 options; set the correct option index as a NUMBER in "answer".',
    'For GAP: one blank and a SINGLE-WORD answer string in "answer".',
  ].join(' ');

  const user = { level, sections, itemsPerSection };

  // 2) Llamada ollama con format:"json" (más compatible)
  const res = await callWithTimeout({
    model,
    stream: false,
    format: 'json',
    options: {
      num_ctx: 2048,
      num_predict: Math.max(160, itemsPerSection * 140),
      temperature: 0.2,
      top_p: 0.9,
      repeat_penalty: 1.1,
    },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: JSON.stringify(user) },
    ],
  });

  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Ollama ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = await res.json().catch(() => null);
  const content = data?.message?.content;
  if (!content || typeof content !== 'string') throw new Error('Empty content from Ollama');

  // 3) Parser robusto: intenta JSON.parse, si falla extrae el primer objeto { ... }
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = (function extractFirstJsonObject(s) {
      const text = String(s || '').trim().replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/, '');
      const start = text.indexOf('{');
      if (start === -1) throw new Error('No JSON start');
      let depth = 0, inStr = false, esc = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (inStr) {
          if (esc) { esc = false; continue; }
          if (ch === '\\') { esc = true; continue; }
          if (ch === '"') inStr = false;
        } else {
          if (ch === '"') inStr = true;
          else if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) {
              return JSON.parse(text.slice(start, i + 1));
            }
          }
        }
      }
      throw new Error('Unterminated JSON object');
    })(content);
  }

  // 4) Normalización al shape Exam
  const secs = Array.isArray(sections) && sections.length ? sections : ['Reading','Use of English','Listening'];
  const validSections = new Set(['Reading','Use of English','Listening','Writing','Speaking']);
  const normalizeSection = (s) => {
    const c = String(s || '').trim();
    if (validSections.has(c)) return c;
    const m = c.toLowerCase();
    if (m.includes('use')) return 'Use of English';
    if (m.startsWith('read')) return 'Reading';
    if (m.startsWith('listen')) return 'Listening';
    if (m.startsWith('writ')) return 'Writing';
    if (m.startsWith('speak')) return 'Speaking';
    return secs[0] || 'Reading';
  };

  function normalizeAnswer(type, answer) {
    if (type === 'mcq') {
      if (typeof answer === 'number') return answer;
      if (answer && typeof answer.index === 'number') return answer.index;
      return 0;
    }
    if (type === 'gap') {
      if (typeof answer === 'string') return answer;
      if (answer && typeof answer.option === 'string') return answer.option;
      return '';
    }
    return answer;
  }

  const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
  const normalized = rawItems.map((it, idx) => {
    const type = (it.type === 'mcq' || it.type === 'gap' || it.type === 'open') ? it.type : 'open';
    const sec = normalizeSection(it.section);
    const coercedSec = secs.includes(sec) ? sec : (secs[0] || 'Reading');
    return {
      id: String(it.id ?? `it-${idx}-${Date.now()}`),
      type,
      prompt: String(it.prompt ?? 'Write a short answer.'),
      options: Array.isArray(it.options) ? it.options.map(String).slice(0, 6) : undefined,
      answer: normalizeAnswer(type, it.answer),
      section: coercedSec,
      points: typeof it.points === 'number' ? it.points : 1,
    };
  }).filter(it => secs.includes(it.section));

  // 5) Garantiza itemsPerSection por sección (relleno simple si falta)
  const bySec = new Map(secs.map(s => [s, []]));
  for (const it of normalized) {
    if (bySec.has(it.section) && bySec.get(it.section).length < itemsPerSection) {
      bySec.get(it.section).push(it);
    }
  }
  for (const s of secs) {
    const arr = bySec.get(s);
    while (arr.length < itemsPerSection) {
      const ts = Date.now();
      arr.push({
        id: `gap-${s}-${ts}`,
        type: 'gap',
        prompt: `[${level}] Fill the gap with the correct word.`,
        answer: '',
        section: s,
        points: 1,
      });
    }
  }

  const items = secs.flatMap(s => bySec.get(s));
  if (!items.length) throw new Error('No items generated by Ollama');

  return {
    id: String(parsed.id ?? `ollama-${Date.now()}`),
    title: String(parsed.title ?? `Mock ${level}`),
    level,
    sections: secs,
    items,
    createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now(),
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'POST' && url.pathname === '/api/generate-exam') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', async () => {
        try {
          const json = body ? JSON.parse(body) : {};
          const valid = new Set(['B1', 'B2', 'C1', 'C2']);
          const lvl = valid.has(json.level) ? json.level : 'B2';
          const secs = Array.isArray(json.sections) && json.sections.length
            ? json.sections.map(coerceSection)
            : ['Reading', 'Use of English', 'Listening'];

          const exam = await callOllama({ level: lvl, sections: secs }).catch((e) => {
            console.warn('[dev-api] provider failed, fallback:', e.message || e);
            return fallbackExam(lvl, secs);
          });

          return send(res, 200, exam);
        } catch (e) {
          console.error('[dev-api] bad request', e);
          return send(res, 400, { error: 'bad_request', message: String(e?.message || e) });
        }
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/healthz') {
      return send(res, 200, { ok: true });
    }

    return send(res, 404, { error: 'not_found' });
  } catch (e) {
    console.error('[dev-api] fatal', e);
    return send(res, 500, { error: 'internal_error', message: String(e?.message || e) });
  }
});

const PORT = Number(process.env.DEV_API_PORT || 8787);
server.listen(PORT, () => {
  console.log(`[dev-api] listening on http://localhost:${PORT}`);
});
