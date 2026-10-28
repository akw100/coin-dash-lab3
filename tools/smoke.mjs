#!/usr/bin/env node
// Headless smoke test for Coin Dash. Boots the game in Chrome, runs every exported check in tests/*.mjs
// on a fresh page, fails on any page error or request that leaves the laptop, and saves a screenshot
// per check to reports/smoke/. Zero dependencies: Node 22+ and Chrome (CHROME=/path/to/chrome if not found).
// No ports: the game loads from file:// and Chrome is driven over a pipe, so parallel runs never collide.
// Chrome cannot start inside Codex's macOS sandbox (SIGABRT); there it has to run outside the sandbox.
// Usage: node tools/smoke.mjs [game-dir] [--only text] [--out dir]     (game-dir defaults to this checkout)
import { spawn, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); return i < 0 ? undefined : args.splice(i, 2)[1]; };
const only = flag('--only'), out = flag('--out');
const dir = path.resolve(args[0] ?? path.join(import.meta.dirname, '..'));
const shots = path.resolve(out ?? path.join(dir, 'reports', 'smoke'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

const chrome = process.env.CHROME ?? [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].find(existsSync);
if (!chrome) { console.error('Chrome not found; set CHROME=/path/to/chrome'); process.exit(2); }

const url = pathToFileURL(path.join(dir, 'index.html')).href;
const profile = await mkdtemp(path.join(tmpdir(), 'coin-dash-smoke-'));
// --allow-file-access-from-files lets Phaser's loader read asset files next to index.html, as it can over http.
const browser = spawn(chrome, ['--headless=new', '--remote-debugging-pipe', `--user-data-dir=${profile}`,
  '--allow-file-access-from-files', '--no-first-run', '--no-default-browser-check', '--mute-audio',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding'], { stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
process.on('exit', () => browser.kill());
setTimeout(() => { console.error('smoke: gave up after 120s'); process.exit(1); }, 120_000).unref();

// Chrome DevTools Protocol over fd 3/4, NUL-separated JSON: numbered requests, plus events we turn
// into problems for the current page.
let seq = 0, problems = [], session, log = '';
const pending = new Map();
browser.stderr.on('data', d => { log = (log + d).slice(-2000); });
browser.once('exit', (code, signal) => {
  if (!pending.size) return;
  console.error(`Chrome exited (${code ?? signal}). ${process.env.CODEX_SANDBOX
    ? 'It cannot run inside the Codex sandbox: re-run this command outside the sandbox (ask for approval).' : log}`);
  process.exit(2);
});
const [, , , toChrome, fromChrome] = browser.stdio;
let buffer = '';
fromChrome.setEncoding('utf8').on('data', d => {
  buffer += d;
  for (let i; (i = buffer.indexOf('\0')) >= 0; buffer = buffer.slice(i + 1)) onMessage(JSON.parse(buffer.slice(0, i)));
});
function onMessage(m) {
  const e = m.params;
  if (m.id) { const p = pending.get(m.id); pending.delete(m.id); return m.error ? p.fail(new Error(m.error.message)) : p.ok(m.result); }
  if (m.method === 'Runtime.exceptionThrown') problems.push(`page error: ${e.exceptionDetails.exception?.description ?? e.exceptionDetails.text}`);
  if (m.method === 'Runtime.consoleAPICalled' && e.type === 'error') problems.push(`console.error: ${e.args.map(a => a.value ?? a.description).join(' ')}`);
  if (m.method === 'Network.requestWillBeSent' && !/^(file|data|blob):/.test(e.request.url)) problems.push(`request leaves the laptop: ${e.request.url}`);
  if (m.method === 'Network.loadingFailed' && !e.canceled) problems.push(`failed to load a file: ${e.errorText}`);
}
const send = (method, params = {}) => new Promise((ok, fail) => {
  pending.set(++seq, { ok, fail });
  toChrome.write(JSON.stringify({ id: seq, method, params, ...(session && { sessionId: session }) }) + '\0');
});
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
({ sessionId: session } = await send('Target.attachToTarget', { targetId, flatten: true }));

for (const domain of ['Runtime', 'Network', 'Page']) await send(`${domain}.enable`);
await send('Emulation.setFocusEmulationEnabled', { enabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: 900, height: 800, deviceScaleFactor: 1, mobile: false });
// __scene() is the play scene: the active scene that has a player, else the first active one.
await send('Page.addScriptToEvaluateOnNewDocument', { source:
  'window.__scene = () => { const s = window.coinDashGame?.scene.getScenes(true) ?? []; return s.find(x => x.player) ?? s[0]; };' });

async function js(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description?.split('\n')[0] ?? r.exceptionDetails.text);
  return r.result.value;
}

const KEYS = { ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, Space: 32, Enter: 13, Escape: 27 };
async function key(type, code) {
  const char = /^(Key|Digit).$/.test(code) ? code.at(-1) : null;
  const keyCode = KEYS[code] ?? char?.charCodeAt(0);
  if (!keyCode) throw new Error(`unknown key ${code}: use ArrowLeft, KeyP, Digit1, Space, Enter or Escape`);
  const key = char ? char.toLowerCase() : code === 'Space' ? ' ' : code;
  await send('Input.dispatchKeyEvent', { type, code, key, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode });
}

async function shot(file) {
  const clip = await js(`(() => { const r = document.querySelector('canvas')?.getBoundingClientRect();
    return r && { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height, scale: 1 }; })()`).catch(() => null);
  const { data } = await send('Page.captureScreenshot', { format: 'png', ...(clip && { clip, captureBeyondViewport: true }) });
  await writeFile(file, Buffer.from(data, 'base64'));
  return file;
}

async function fresh() {
  problems = [];
  await send('Page.navigate', { url });
  const started = Date.now();
  while (!await js('!!(window.coinDashGame?.isRunning && __scene())').catch(() => false)) {
    if (Date.now() - started > 8000) throw new Error('game did not start within 8s (is window.coinDashGame still created?)');
    await sleep(50);
  }
  return Date.now() - started;
}

// What a check receives. A check throws (or fails t.assert) to fail, and may return a short note.
const t = {
  js, sleep,
  async hold(code, ms = 300) { await key('keyDown', code); await sleep(ms); await key('keyUp', code); },
  press: code => t.hold(code, 60),
  assert(ok, message) { if (!ok) throw new Error(message); },
  shot: name => shot(path.join(shots, `${name}.png`)),
};

const results = [];
const report = (status, name, note = '') => { results.push({ status, name, note }); console.log(`${status} ${name.padEnd(24)} ${note}`); };
await mkdir(shots, { recursive: true });
console.log(`Coin Dash smoke · ${dir}`);

let booted = false;
try {
  const ms = await fresh();
  const renderer = await js(`({ 1: 'Canvas', 2: 'WebGL' })[coinDashGame.renderer.type]`);
  await sleep(300);
  await shot(path.join(shots, 'boot.png'));
  booted = !problems.length;
  report(booted ? 'PASS' : 'FAIL', 'boot', booted ? `started in ${ms}ms, ${renderer}` : problems.join(' | '));
} catch (e) { report('FAIL', 'boot', [e.message, ...problems].join(' | ')); }

const testDir = path.join(dir, 'tests');
const files = booted && existsSync(testDir) ? (await readdir(testDir)).filter(f => f.endsWith('.mjs')).sort() : [];
for (const file of files) {
  let checks;
  try { checks = Object.entries(await import(pathToFileURL(path.join(testDir, file)))); }
  catch (e) { report('FAIL', file, `cannot load: ${e.message}`); continue; }
  for (const [fn, check] of checks) {
    const name = `${file.slice(0, -4)}.${fn}`;
    if (typeof check !== 'function' || (only && !name.includes(only))) continue;
    try {
      await fresh();
      const note = await check(t);
      await sleep(50); // let late page errors arrive
      if (problems.length) throw new Error(problems.join(' | '));
      report('PASS', name, note ?? '');
    } catch (e) { report('FAIL', name, e.message); }
    await shot(path.join(shots, `${name}.png`)).catch(() => {});
  }
}

const git = (...a) => { try { return execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
const failed = results.filter(r => r.status === 'FAIL').length;
await writeFile(path.join(shots, 'result.json'), JSON.stringify({
  at: new Date().toISOString(), head: git('rev-parse', '--short', 'HEAD'), dirty: !!git('status', '--porcelain'), only: only ?? null, results,
}, null, 2));
console.log(`${results.length - failed} passed, ${failed} failed · screenshots in ${path.relative(process.cwd(), shots) || '.'}`);
browser.kill();
await rm(profile, { recursive: true, force: true }).catch(() => {});
process.exit(failed ? 1 : 0);
