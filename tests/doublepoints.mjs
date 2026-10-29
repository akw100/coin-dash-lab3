// Double points: the pickup turns the mode on, coins are worth 2 while it runs and 1 after it expires.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const touch = what => `{ const s = __scene(), o = ${what}; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }`;
const grabCoin = async t => {
  await t.js('__scene().lastCoinAt = -Infinity'); // keep combo.js out of this check
  const before = await t.js('__scene().score');
  await t.js(touch('s.coin'));
  await t.sleep(200);
  return (await t.js('__scene().score')) - before;
};

export async function doublepoints(t) {
  await t.js(park);
  t.assert(await grabCoin(t) === 1, 'a coin was not worth 1 before the power-up');
  await t.js('__scene().spawnDouble()');
  await t.js(touch('__scene().doublePickup'));
  await t.sleep(200);
  t.assert(await t.js('__scene().doubleUntil > __scene().time.now'), 'double mode did not turn on');
  const during = await grabCoin(t);
  t.assert(during === 2, `a coin was worth ${during} during double mode, not 2`);
  await t.shot('doublepoints-active');
  await t.js('__scene().doubleUntil = 0');
  const after = await grabCoin(t);
  t.assert(after === 1, `a coin was worth ${after} after double mode expired, not 1`);
  return 'coin worth 1 → 2 → 1';
}
