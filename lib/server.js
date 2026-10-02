// Shared helpers for the Cloudflare Pages Functions in /functions.

// The quiz creates its own tables the first time it runs, so nobody has to
// paste SQL into the Cloudflare dashboard. Same schema as schema.sql.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    result TEXT NOT NULL,
    runner_up_1 TEXT,
    runner_up_2 TEXT,
    answers TEXT,
    source TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS results_result ON results(result)`,
  `CREATE TABLE IF NOT EXISTS signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    email TEXT NOT NULL,
    kid_name TEXT NOT NULL DEFAULT '',
    result TEXT,
    runner_up_1 TEXT,
    runner_up_2 TEXT,
    answers TEXT,
    opt_in_clubs INTEGER NOT NULL DEFAULT 0,
    opt_in_news INTEGER NOT NULL DEFAULT 0,
    source TEXT,
    UNIQUE(email, kid_name)
  )`
];

let schemaReady = false;

export async function db(env) {
  if (!env.DB) {
    throw new HttpError(503, "Database not connected. See README: 'Connect the D1 database'.");
  }
  if (!schemaReady) {
    await env.DB.batch(SCHEMA.map((sql) => env.DB.prepare(sql)));
    schemaReady = true;
  }
  return env.DB;
}

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

export function handle(fn) {
  return async (context) => {
    try {
      return await fn(context);
    } catch (e) {
      if (e instanceof HttpError) return json({ ok: false, error: e.message }, e.status);
      console.error(e);
      return json({ ok: false, error: "Something went wrong" }, 500);
    }
  };
}

export async function readJson(request) {
  const len = Number(request.headers.get("content-length") || 0);
  if (len > 8000) throw new HttpError(413, "Too large");
  const text = await request.text();
  if (text.length > 8000) throw new HttpError(413, "Too large");
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object") throw new Error();
    return data;
  } catch {
    throw new HttpError(400, "Bad request");
  }
}

// Short, safe text from the browser: trimmed, limited length, no control characters.
export function clean(value, max = 80) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}

const ID = /^[a-z0-9-]{1,30}$/;
export function cleanId(value) {
  const v = clean(value, 30).toLowerCase();
  return ID.test(v) ? v : "";
}

// Answers arrive as { questionId: answerId }. Keep only simple ids.
export function cleanAnswers(value) {
  const out = {};
  if (value && typeof value === "object") {
    for (const k of Object.keys(value).slice(0, 12)) {
      const key = cleanId(k);
      const val = cleanId(value[k]);
      if (key && val) out[key] = val;
    }
  }
  return JSON.stringify(out);
}

// Only allow logged-in admin requests. The password lives in the
// ADMIN_PASSWORD secret in Cloudflare (never in this repo).
export async function requireAdmin(request, env) {
  const expected = env.ADMIN_PASSWORD;
  if (!expected) throw new HttpError(503, "ADMIN_PASSWORD is not set in Cloudflare. See README.");
  const header = request.headers.get("authorization") || "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!(await sameText(given, expected))) {
    // Small delay makes password guessing slower.
    await new Promise((r) => setTimeout(r, 400));
    throw new HttpError(401, "Wrong password");
  }
}

// Compares two strings in constant time (hash both, compare the hashes).
async function sameText(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(a)),
    crypto.subtle.digest("SHA-256", enc.encode(b))
  ]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

// CSV with a BOM so Excel opens emojis and accents correctly.
export function toCsv(columns, rows) {
  const esc = (v) => {
    let s = v === null || v === undefined ? "" : String(v);
    // Stop spreadsheet apps treating a value as a formula.
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [columns.map(esc).join(",")];
  for (const row of rows) lines.push(columns.map((c) => esc(row[c])).join(","));
  return "﻿" + lines.join("\r\n") + "\r\n";
}
