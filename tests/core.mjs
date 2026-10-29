// Core behaviour every feature must keep. tools/smoke.mjs runs each exported function on a fresh page.
// A check gets t = { js, hold, press, sleep, assert, shot }; t.js runs an expression in the page, where
// __scene() is the play scene. Copy this pattern into tests/<feature>.mjs for a new feature.

// Drones parked in the bottom-left corner, so they cannot end the round in the middle of a check.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const touch = what => `{ const s = __scene(), o = ${what}; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }`;

export async function move(t) {
  await t.js(park);
  const x0 = await t.js('__scene().player.x');
  await t.hold('ArrowRight', 300);
  const x1 = await t.js('__scene().player.x');
  t.assert(x1 > x0 + 20, `ArrowRight did not move the player right (x ${x0} → ${x1})`);
  const y0 = await t.js('__scene().player.y');
  await t.hold('KeyW', 300);
  const y1 = await t.js('__scene().player.y');
  t.assert(y1 < y0 - 20, `W did not move the player up (y ${y0} → ${y1})`);
  return `ArrowRight +${Math.round(x1 - x0)}px, W ${Math.round(y1 - y0)}px`;
}

export async function coin(t) {
  await t.js(park);
  const before = await t.js('__scene().score');
  await t.js(touch('s.coin'));
  await t.sleep(200);
  const after = await t.js('__scene().score');
  t.assert(after > before, `touching the coin left the score at ${after}`);
  return `score ${before} → ${after}`;
}

export async function drone(t) {
  await t.js(park);
  await t.js('__scene().lives = 1'); // lives.js: the last life is the one that ends the round
  await t.js(touch('s.drones.getChildren()[0]'));
  await t.sleep(200);
  t.assert(await t.js('__scene().finished') === true, 'touching a drone did not end the round');
}

export async function timer(t) {
  await t.js(park);
  await t.js('__scene().deadline = __scene().time.now + 300');
  await t.sleep(700);
  t.assert(await t.js('__scene().finished') === true, 'the round did not end when time ran out');
}

export async function restart(t) {
  await t.js('{ const s = __scene(); s.score = 5; s.finish("test"); }');
  await t.press('KeyR');
  await t.sleep(300);
  const state = await t.js('({ score: __scene().score, finished: __scene().finished })');
  t.assert(state.score === 0 && !state.finished, `R did not start a new round (${JSON.stringify(state)})`);
}
