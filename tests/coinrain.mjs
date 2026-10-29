// Coin rain: no rain early in the round; in the last seconds coins fall, and catching one scores a point.
const park = '__scene().drones.getChildren().forEach((d, i) => { d.body.reset(30 + i * 30, 480); d.body.stop(); })';
const count = '__scene().rainCoins.countActive()';

export async function noRainEarly(t) {
  await t.js(park);
  await t.sleep(400);
  t.assert(await t.js(count) === 0, 'coins rained at the start of the round');
}

export async function rainAtEnd(t) {
  await t.js(park);
  await t.js('(__scene().deadline = __scene().time.now + 4000, 0)');
  await t.sleep(700);
  const n = await t.js(count);
  t.assert(n > 0, 'no coins rained in the last seconds');
  await t.shot('coinrain');
  const before = await t.js('__scene().score');
  await t.js('{ const s = __scene(), o = s.rainCoins.getChildren()[0]; o.body.stop(); o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); 0; }');
  await t.sleep(200);
  const after = await t.js('__scene().score');
  t.assert(await t.js('__scene().rainCaught') >= 1 && after > before, `catching a rain coin left score ${before} → ${after}`);
  return `${n} coins falling, score ${before} → ${after}`;
}
