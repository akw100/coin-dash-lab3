// Bonus coin: touching it gives +5 and removes it; left alone it disappears after its lifetime.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const touch = what => `{ const s = __scene(), o = ${what}; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }`;

export async function bonuscoin(t) {
  await t.js(park);
  await t.js('__scene().spawnBonusCoin()');
  t.assert(await t.js('!!__scene().bonusCoin'), 'bonus coin did not spawn');
  await t.shot('bonuscoin-visible');
  const before = await t.js('__scene().score');
  await t.js(touch('s.bonusCoin'));
  await t.sleep(200);
  const gain = (await t.js('__scene().score')) - before;
  t.assert(gain === 5, `bonus coin gave ${gain}, not 5`);
  t.assert(await t.js('!__scene().bonusCoin'), 'bonus coin stayed after pickup');
  await t.js('COIN_DASH.bonusCoin.lifetimeMs = 600; __scene().spawnBonusCoin()');
  for (let i = 0; i < 30 && await t.js('!!__scene().bonusCoin'); i++) await t.sleep(500); // game clock can lag under load
  t.assert(await t.js('!__scene().bonusCoin'), 'bonus coin did not vanish after its lifetime');
  return 'pickup +5, expires after its lifetime';
}
