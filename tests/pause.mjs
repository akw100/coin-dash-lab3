// Pause (P): while paused the player, drones and the round timer stop and a PAUSED label is shown;
// P again resumes with the remaining time intact. Same pattern as tests/core.mjs.
const state = `(() => { const s = __scene(); return {
  paused: !!s.paused, px: s.player.x, drones: s.drones.getChildren().map(d => [d.x, d.y]),
  left: s.deadline - s.time.now, label: s.children.list.some(o => o.text === 'PAUSED') }; })()`;
const moved = (a, b) => a.some(([x, y], i) => Math.hypot(x - b[i][0], y - b[i][1]) > 2);

export async function pause(t) {
  await t.press('KeyP');
  await t.sleep(100);
  const a = await t.js(state);
  t.assert(a.paused && a.label, `P did not pause the game or show PAUSED (${JSON.stringify(a)})`);
  await t.hold('ArrowRight', 300);
  await t.sleep(300);
  const b = await t.js(state);
  t.assert(Math.abs(b.px - a.px) < 1, `the player moved while paused (x ${a.px} → ${b.px})`);
  t.assert(!moved(a.drones, b.drones), 'the drones moved while paused');
  t.assert(Math.abs(b.left - a.left) < 50, `the round timer ran while paused (${a.left}ms → ${b.left}ms left)`);
  return `${Math.round(b.left / 1000)}s left stayed put for 600ms`;
}

export async function resume(t) {
  await t.press('KeyP');
  await t.sleep(600);
  const a = await t.js(state);
  await t.press('KeyP');
  await t.sleep(100);
  const b = await t.js(state);
  t.assert(!b.paused && !b.label, `P did not resume (${JSON.stringify(b)})`);
  t.assert(a.left - b.left >= 0 && a.left - b.left < 300, `resuming changed the time left (${a.left}ms → ${b.left}ms)`);
  await t.hold('ArrowRight', 300);
  const c = await t.js(state);
  t.assert(c.px > b.px + 20, `the player did not move after resume (x ${b.px} → ${c.px})`);
  t.assert(moved(b.drones, c.drones), 'the drones did not move after resume');
  return `time left ${Math.round(a.left)}ms paused → ${Math.round(b.left)}ms resumed`;
}

export async function restartWhilePaused(t) {
  await t.press('KeyP');
  await t.sleep(100);
  await t.press('KeyR');
  await t.sleep(200);
  const a = await t.js(state);
  t.assert(!a.paused && !a.label, `R while paused did not start an unpaused round (${JSON.stringify(a)})`);
  await t.sleep(300);
  const b = await t.js(state);
  t.assert(moved(a.drones, b.drones), 'the drones did not move in the new round');
}
