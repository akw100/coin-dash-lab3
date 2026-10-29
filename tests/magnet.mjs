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
