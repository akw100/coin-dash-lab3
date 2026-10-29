// Levels: collecting coinsPerLevel coins raises the level and adds a drone.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';

export async function levels(t) {
  await t.js(park);
  const n0 = await t.js('__scene().drones.getChildren().length');
  const per = await t.js('COIN_DASH.levels.coinsPerLevel');
  for (let i = 0; i < per; i++) {
    await t.js('{ const s = __scene(); s.coin.setPosition(s.player.x, s.player.y); s.coin.body.reset(s.player.x, s.player.y); }');
    await t.sleep(150);
  }
  await t.js(park);
  const s = await t.js('({ level: __scene().level, n: __scene().drones.getChildren().length, score: __scene().score })');
  t.assert(s.level === 2, `level is ${s.level} after ${s.score} coins, expected 2`);
  t.assert(s.n === n0 + 1, `drones ${n0} → ${s.n}, expected +1`);
  await t.shot('levels');
  return `level ${s.level}, drones ${n0} → ${s.n}`;
}
