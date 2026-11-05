#!/usr/bin/env node
// gmail-drafts.mjs: list, show, create, edit and trash Gmail drafts in registrar@ncllball.com.
// Uses the Gmail MCP's own sign-in (C:\Users\regis\.gmail-mcp). Never sends mail.
// "trash" moves a draft to Gmail's Trash (recoverable for 30 days); nothing is permanently deleted.
//
//   node scripts/gmail-drafts.mjs list [--q "subject:Registration"]
//   node scripts/gmail-drafts.mjs show <draftId>
//   node scripts/gmail-drafts.mjs create --json draft.json [--star]
//   node scripts/gmail-drafts.mjs update <draftId> --json draft.json [--star|--unstar] [--drop-attachments]
//   node scripts/gmail-drafts.mjs trash <draftId> [<draftId> ...]
//   node scripts/gmail-drafts.mjs star|unstar <draftId> [...]
//
// draft.json: { "to": [..], "cc": [..], "bcc": [..], "subject": "..", "text": "..", "html": "..",
//               "threadId": "..", "inReplyTo": "<Message-ID>" }
// On update, fields left out keep the draft's current values (to/cc/bcc/subject/thread);
// the body is replaced only if "text" or "html" is given.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DIR = path.join(os.homedir(), '.gmail-mcp');
const API = 'https://gmail.googleapis.com/gmail/v1/users/me';

let token;
async function getToken() {
  if (token) return token;
  const creds = JSON.parse(fs.readFileSync(path.join(DIR, 'credentials.json'), 'utf8'));
  if (creds.access_token && creds.expiry_date > Date.now() + 60_000) return (token = creds.access_token);
  const keys = JSON.parse(fs.readFileSync(path.join(DIR, 'gcp-oauth.keys.json'), 'utf8'));
  const k = keys.installed || keys.web;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: k.client_id, client_secret: k.client_secret,
      refresh_token: creds.refresh_token, grant_type: 'refresh_token' }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`token refresh failed: ${JSON.stringify(j)}`);
  return (token = j.access_token);
}

async function api(method, p, body) {
  const r = await fetch(API + p, {
    method,
    headers: { Authorization: `Bearer ${await getToken()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${p} -> ${r.status} ${t}`);
  return t ? JSON.parse(t) : {};
}

const hdr = (m, name) => (m.payload?.headers || []).find(h => h.name.toLowerCase() === name.toLowerCase())?.value || '';
const b64url = s => Buffer.from(s, 'utf8').toString('base64url');
const unb64 = s => Buffer.from(s || '', 'base64url').toString('utf8');
const splitAddrs = s => (s ? s.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(x => x.trim()).filter(Boolean) : []);

function walk(part, out = { text: '', html: '', attachments: [] }) {
  if (!part) return out;
  if (part.filename) out.attachments.push(part.filename);
  else if (part.mimeType === 'text/plain' && !out.text) out.text = unb64(part.body?.data);
  else if (part.mimeType === 'text/html' && !out.html) out.html = unb64(part.body?.data);
  for (const p of part.parts || []) walk(p, out);
  return out;
}

function encHeader(v) { return /[^\x20-\x7e]/.test(v) ? `=?UTF-8?B?${Buffer.from(v).toString('base64')}?=` : v; }

function buildMime(d) {
  const lines = [];
  if (d.to?.length) lines.push(`To: ${d.to.join(', ')}`);
  if (d.cc?.length) lines.push(`Cc: ${d.cc.join(', ')}`);
  if (d.bcc?.length) lines.push(`Bcc: ${d.bcc.join(', ')}`);
  lines.push(`Subject: ${encHeader(d.subject || '')}`);
  if (d.inReplyTo) lines.push(`In-Reply-To: ${d.inReplyTo}`, `References: ${d.references || d.inReplyTo}`);
  lines.push('MIME-Version: 1.0');
  const b64 = s => Buffer.from(s, 'utf8').toString('base64').replace(/.{76}/g, '$&\r\n');
  const textPart = s => ['Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', b64(s)];
  const htmlPart = s => ['Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '', b64(s)];
  if (d.html) {
    const B = 'ncll_' + Date.now().toString(36);
    lines.push(`Content-Type: multipart/alternative; boundary="${B}"`, '',
      `--${B}`, ...textPart(d.text || d.html.replace(/<[^>]+>/g, '')), `--${B}`, ...htmlPart(d.html), `--${B}--`);
  } else {
    lines.push(...textPart(d.text || ''));
  }
  return b64url(lines.join('\r\n'));
}

async function getDraft(id, format = 'full') {
  return api('GET', `/drafts/${id}?format=${format}`);
}

function summarize(d) {
  const m = d.message;
  return {
    draftId: d.id,
    messageId: m.id,
    threadId: m.threadId,
    date: new Date(Number(m.internalDate)).toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
    starred: (m.labelIds || []).includes('STARRED'),
    to: hdr(m, 'To'),
    subject: hdr(m, 'Subject'),
  };
}

async function setStar(messageId, on) {
  await api('POST', `/messages/${messageId}/modify`, on ? { addLabelIds: ['STARRED'] } : { removeLabelIds: ['STARRED'] });
}

function args(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const n = argv[i + 1]; if (n && !n.startsWith('--')) { o[a.slice(2)] = n; i++; } else o[a.slice(2)] = true; }
    else o._.push(a);
  }
  return o;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const a = args(rest);
  switch (cmd) {
    case 'list': {
      const q = a.q ? `&q=${encodeURIComponent(a.q)}` : '';
      let page, all = [];
      do {
        const r = await api('GET', `/drafts?maxResults=100${q}${page ? `&pageToken=${page}` : ''}`);
        all.push(...(r.drafts || []));
        page = r.nextPageToken;
      } while (page);
      const rows = [];
      for (const d of all) rows.push(summarize(await getDraft(d.id, 'metadata')));
      rows.sort((x, y) => x.subject.localeCompare(y.subject) || new Date(y.date) - new Date(x.date));
      console.log(JSON.stringify(rows, null, 2));
      console.error(`${rows.length} draft(s)`);
      break;
    }
    case 'show': {
      const d = await getDraft(a._[0]);
      const body = walk(d.message.payload);
      console.log(JSON.stringify({ ...summarize(d), cc: hdr(d.message, 'Cc'), bcc: hdr(d.message, 'Bcc'),
        attachments: body.attachments, text: body.text, html: body.html || undefined }, null, 2));
      break;
    }
    case 'create': {
      const j = JSON.parse(fs.readFileSync(a.json, 'utf8'));
      const r = await api('POST', '/drafts', { message: { raw: buildMime(j), ...(j.threadId ? { threadId: j.threadId } : {}) } });
      if (a.star) await setStar(r.message.id, true);
      console.log(JSON.stringify(summarize(await getDraft(r.id, 'metadata')), null, 2));
      break;
    }
    case 'update': {
      const id = a._[0];
      const cur = await getDraft(id);
      const m = cur.message;
      const body = walk(m.payload);
      const j = a.json ? JSON.parse(fs.readFileSync(a.json, 'utf8')) : {};
      if (body.attachments.length && !a['drop-attachments'])
        throw new Error(`draft has attachments (${body.attachments.join(', ')}); updating would drop them. Pass --drop-attachments to proceed.`);
      const merged = {
        to: j.to ?? splitAddrs(hdr(m, 'To')),
        cc: j.cc ?? splitAddrs(hdr(m, 'Cc')),
        bcc: j.bcc ?? splitAddrs(hdr(m, 'Bcc')),
        subject: j.subject ?? hdr(m, 'Subject'),
        inReplyTo: j.inReplyTo ?? (hdr(m, 'In-Reply-To') || undefined),
        references: hdr(m, 'References') || undefined,
        text: 'text' in j || 'html' in j ? j.text : body.text,
        html: 'text' in j || 'html' in j ? j.html : body.html,
      };
      const wasStarred = (m.labelIds || []).includes('STARRED');
      const r = await api('PUT', `/drafts/${id}`, { id, message: { raw: buildMime(merged), threadId: j.threadId ?? m.threadId } });
      const star = a.star ? true : a.unstar ? false : wasStarred;
      if (star) await setStar(r.message.id, true);
      console.log(JSON.stringify(summarize(await getDraft(id, 'metadata')), null, 2));
      break;
    }
    case 'trash': {
      for (const id of a._) {
        const d = await getDraft(id, 'metadata');
        const s = summarize(d);
        await api('POST', `/messages/${d.message.id}/trash`);
        console.log(`trashed ${id}: "${s.subject}" (${s.date}) - recoverable from Trash for 30 days`);
      }
      break;
    }
    case 'star':
    case 'unstar': {
      for (const id of a._) {
        const d = await getDraft(id, 'metadata');
        await setStar(d.message.id, cmd === 'star');
        console.log(`${cmd}red ${id}: "${hdr(d.message, 'Subject')}"`);
      }
      break;
    }
    default:
      console.error('usage: list [--q query] | show <id> | create --json f [--star] | update <id> --json f [--star|--unstar] | trash <id..> | star|unstar <id..>');
      process.exit(1);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
