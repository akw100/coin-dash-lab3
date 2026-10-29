// Shortcuts: ? shows the help overlay, Esc hides it, P pauses the timer, R restarts, and no key is listed twice.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const shown = () => `document.querySelector('[role=dialog]').style.display !== 'none'`;

export async function help(t) {
  t.assert(await t.js(shown()) === false, 'help overlay is visible at start');
  await t.js("window.dispatchEvent(new KeyboardEvent('keydown', { key: '?', code: 'Slash', shiftKey: true }))");
  t.assert(await t.js(shown()) === true, '? did not show the help overlay');
  await t.shot('shortcuts-help');
  await t.press('Escape');
  t.assert(await t.js(shown()) === false, 'Esc did not hide the help overlay');
  const keys = await t.js('COIN_DASH.shortcuts.flatMap(r => r.keys.split(" / ").flatMap(k => k.startsWith("Arrows") || k.includes(" ") ? k.split(" ") : [k]))');
  const dup = keys.filter((k, i) => keys.indexOf(k) !== i);
  t.assert(dup.length === 0, `keys listed twice: ${dup}`);
}

export async function pause(t) {
  await t.js(park);
  await t.press('KeyP');
  const left = () => t.js("{ const s = coinDashGame.scene.getScene('CoinDash'); s.deadline - s.time.now; }");
  const a = await left();
  await t.sleep(600);
  const b = await left();
  t.assert(Math.abs(a - b) < 50, `timer kept running while paused (${a} → ${b})`);
  t.assert(await t.js("coinDashGame.scene.getScene('CoinDash').sys.isPaused()") === true, 'P did not pause');
  await t.press('Space');
  await t.sleep(600);
  t.assert(await left() < b - 300, 'Space did not resume the timer');
}

export async function restart(t) {
  await t.js(park);
  await t.js('__scene().score = 5');
  await t.press('KeyP');
  await t.press('KeyR');
  await t.sleep(300);
  const s = await t.js('({ score: __scene().score, paused: coinDashGame.scene.getScene("CoinDash").sys.isPaused() })');
  t.assert(s.score === 0 && !s.paused, `R did not restart a paused round (${JSON.stringify(s)})`);
}
