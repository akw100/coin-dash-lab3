// Magnet: grabbing the pickup pulls a nearby coin toward the player; without it the coin stays put.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const touch = what => `{ const s = __scene(), o = ${what}; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }`;
const dist = '(() => { const s = __scene(); return Math.hypot(s.coin.x - s.player.x, s.coin.y - s.player.y); })()';
const place = 'if (1) { const s = __scene(); s.coin.setPosition(s.player.x + 120, s.player.y); s.coin.body.reset(s.player.x + 120, s.player.y); }';

export async function magnet(t) {
  await t.js(park);
  await t.js(place);
  const idle0 = await t.js(dist);
  await t.sleep(300);
  t.assert(Math.abs(await t.js(dist) - idle0) < 1, 'the coin moved without a magnet');
  await t.js('__scene().spawnMagnet()');
  await t.js(touch('__scene().magnetPickup'));
  await t.sleep(100);
  t.assert(await t.js('__scene().magnetUntil > __scene().time.now'), 'magnet did not turn on');
  await t.js(place);
  const d0 = await t.js(dist);
  await t.sleep(300);
  const d1 = await t.js(dist);
  t.assert(d1 < d0 - 20, `the coin did not move toward the player (${d0} → ${d1})`);
  await t.shot('magnet-active');
  return `coin distance ${Math.round(d0)} → ${Math.round(d1)}`;
}

// Regression: after a restart the magnet used to leave a stale listener behind, which threw on the next
// activation and froze the whole game loop (no frames advanced). The loop must keep running.
export async function survivesRestart(t) {
  await t.js(park);
  await t.press('KeyR');
  await t.sleep(300);
  await t.js(park);
  await t.js('__scene().activateMagnet()');
  const f0 = await t.js('coinDashGame.loop.frame');
  await t.sleep(500);
  const f1 = await t.js('coinDashGame.loop.frame');
  t.assert(f1 > f0 + 5, `the game loop stalled after a restart with the magnet on (frames ${f0} → ${f1})`);
  t.assert(await t.js('__scene().magnetUntil > __scene().time.now'), 'magnet did not turn on after the restart');
  return `frames ${f0} → ${f1}`;
}
