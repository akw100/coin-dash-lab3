#!/usr/bin/env node
// One page for every worktree of this repo: branch, commits vs main, uncommitted and untracked files,
// last smoke result, the exact review command, a Play link serving that worktree's game, and the graph.
// Usage: node tools/hub.mjs           → http://127.0.0.1:8000 (PORT=… to change, BASE=… if not main)
//        node tools/hub.mjs --print   → the same table in the terminal (also: curl 127.0.0.1:8000/api)
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const base = process.env.BASE ?? 'main';
const port = Number(process.env.PORT ?? 8000);
const git = (cwd, ...a) => { try { return execFileSync('git', ['-C', cwd, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
const ago = iso => { const m = Math.round((Date.now() - Date.parse(iso)) / 60000); return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`; };

// No caching, so a reload always shows the worktree's latest edit.
const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.txt': 'text/plain',
};

async function serveFile(root, urlPath, res) {
  let file;
  try { file = path.join(root, decodeURIComponent(urlPath.split('?')[0]).replace(/\/$/, '/index.html')); }
  catch { return res.writeHead(400).end('bad path'); }
  const rel = path.relative(root, file);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return res.writeHead(403).end('outside the game folder');
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
  } catch { res.writeHead(404).end('not found'); }
}

// Cheap: names and paths only, for serving files.
function worktrees() {
  const seen = new Set();
  return git(root, 'worktree', 'list', '--porcelain').split('\n\n').filter(Boolean).map(block => {
    const f = Object.fromEntries(block.split('\n').map(l => [l.split(' ')[0], l.slice(l.indexOf(' ') + 1)]));
    let name = path.basename(f.worktree);
    while (seen.has(name)) name += '-2';
    seen.add(name);
    return { name, path: f.worktree, branch: f.branch?.replace('refs/heads/', '') ?? 'detached', head: f.HEAD?.slice(0, 7), prunable: 'prunable' in f };
  }).filter(w => !w.prunable);
}

function details(w) {
  const start = git(w.path, 'merge-base', base, 'HEAD').slice(0, 7);
  const [behind, ahead] = git(w.path, 'rev-list', '--left-right', '--count', `${base}...HEAD`).split(/\s+/).map(Number);
  const status = git(w.path, 'status', '--porcelain').split('\n').filter(Boolean);
  let smoke = null;
  try { smoke = JSON.parse(readFileSync(path.join(w.path, 'reports', 'smoke', 'result.json'), 'utf8')); } catch {}
  return {
    ...w, start, ahead: ahead || 0, behind: behind || 0,
    last: git(w.path, 'log', '-1', '--format=%s · %cr'),
    changed: start ? git(w.path, 'diff', '--shortstat', start) : '',
    uncommitted: status.length, untracked: status.filter(l => l.startsWith('??')).map(l => l.slice(3)),
    smoke: smoke && {
      at: smoke.at, stale: smoke.head !== w.head, only: smoke.only,
      passed: smoke.results.filter(r => r.status === 'PASS').length,
      failed: smoke.results.filter(r => r.status === 'FAIL').map(r => `${r.name}: ${r.note}`),
    },
    review: start && `cd "${w.path}" && git status --short && git diff --stat ${start}`,
  };
}

const smokeText = s => !s ? 'not run' : `${s.failed.length ? `✗ ${s.failed.length} failed` : `✓ ${s.passed} passed`}${s.only ? ` (only ${s.only})` : ''} · ${ago(s.at)}${s.stale ? ' · STALE (older commit)' : ''}`;

if (process.argv.includes('--print')) {
  for (const w of worktrees().map(details)) {
    console.log(`${w.name}  [${w.branch}]  +${w.ahead}/-${w.behind} vs ${base}  ${w.changed || 'no changes'}${w.uncommitted ? `  ${w.uncommitted} uncommitted` : ''}  smoke: ${smokeText(w.smoke)}`);
    for (const f of w.smoke?.failed ?? []) console.log(`    FAIL ${f}`);
  }
  process.exit(0);
}

const page = list => `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="10">
<title>Coin Dash worktrees</title>
<style>
body{margin:0;padding:24px;background:#0a1120;color:#e5edf7;font:14px/1.45 system-ui,sans-serif}
h1{margin:0 0 4px;font-size:22px}h4{margin:0 0 4px;font-size:12px;color:#8da0b8;text-transform:uppercase;letter-spacing:.06em}
.muted{color:#8da0b8}a{color:#71e8ce}.wt{border:1px solid #24334b;border-radius:10px;padding:14px;margin:14px 0}
.wt header{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap;margin-bottom:10px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.play{margin-left:auto;padding:6px 14px;border-radius:6px;background:#71e8ce;color:#0a1120;font-weight:700;text-decoration:none}
.bad{color:#ff657a}.good{color:#7ee787}.warn{color:#ffd166}code{font-size:12px;color:#c9d5e3;word-break:break-all}
.review{margin-top:10px}button{font:inherit;font-size:12px;padding:2px 8px;margin-left:6px;cursor:pointer}
img{width:100%;max-width:240px;border-radius:4px;display:block;margin-top:6px}
pre{background:#101c31;padding:14px;border-radius:8px;overflow-x:auto;font-size:12px}
</style>
<h1>Coin Dash worktrees</h1><p class="muted">Compared with <b>${esc(base)}</b> · refreshes every 10 s · ${esc(root)}</p>
${list.map(w => `<section class="wt">
<header><b>${esc(w.name)}</b><span class="muted">${esc(w.branch)} @ ${esc(w.head)}</span>
<a class="play" href="/w/${encodeURIComponent(w.name)}/" target="_blank">Play</a></header>
<div class="grid">
<div><h4>Commits</h4>+${w.ahead} / −${w.behind} vs ${esc(base)}<br><span class="muted">${esc(w.last)}</span></div>
<div><h4>Changes since start</h4>${esc(w.changed || 'none')}${w.uncommitted ? `<br><span class="warn">${w.uncommitted} uncommitted</span>` : ''}${w.untracked.length ? `<br><span class="warn">untracked: ${esc(w.untracked.join(', '))}</span>` : ''}</div>
<div class="${!w.smoke ? 'muted' : w.smoke.failed.length ? 'bad' : w.smoke.stale ? 'warn' : 'good'}"><h4>Smoke test</h4>${esc(smokeText(w.smoke))}
${(w.smoke?.failed ?? []).map(f => `<br><small>${esc(f)}</small>`).join('')}
${w.smoke ? `<a href="/w/${encodeURIComponent(w.name)}/reports/smoke/boot.png" target="_blank"><img src="/w/${encodeURIComponent(w.name)}/reports/smoke/boot.png?${esc(w.smoke.at)}" alt="smoke screenshot"></a>` : ''}</div>
</div>
${w.review ? `<div class="review"><h4>Review in your terminal</h4><code>${esc(w.review)}</code><button data-cmd="${esc(w.review)}" onclick="navigator.clipboard.writeText(this.dataset.cmd);this.textContent='copied'">copy</button></div>` : ''}
</section>`).join('')}
<h2>History</h2><pre>${esc(git(root, 'log', '--graph', '--oneline', '--decorate', '--all', '-40'))}</pre>`;

const server = createServer((req, res) => {
  const u = new URL(req.url, 'http://hub');
  if (u.pathname === '/') return res.writeHead(200, { 'content-type': 'text/html', 'cache-control': 'no-store' }).end(page(worktrees().map(details)));
  if (u.pathname === '/api') return res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(worktrees().map(details), null, 2));
  const m = u.pathname.match(/^\/w\/([^/]+)(\/.*)?$/);
  const w = m && worktrees().find(x => x.name === decodeURIComponent(m[1]));
  if (!w) return res.writeHead(404).end('no such worktree');
  if (!m[2]) return res.writeHead(302, { location: `/w/${m[1]}/` }).end();
  serveFile(w.path, m[2], res);
});
server.on('error', e => { console.error(e.code === 'EADDRINUSE' ? `port ${port} is busy: PORT=${port + 1} node tools/hub.mjs` : e.message); process.exit(1); });
server.listen(port, '127.0.0.1', () => console.log(`Coin Dash hub: http://127.0.0.1:${port}`));
