// Coin hop: an uncollected coin moves to a new place without scoring.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';

export async function coinhop(t) {
  await t.js(park);
  await t.js('COIN_DASH.coinHop.lifetimeMs = 500');
  await t.js('{ const s = __scene(); s.coinBorn = s.time.now; }');
  const a = await t.js('({ x: __scene().coin.x, y: __scene().coin.y, score: __scene().score })');
  await t.sleep(900);
  const b = await t.js('({ x: __scene().coin.x, y: __scene().coin.y, score: __scene().score })');
  t.assert(a.x !== b.x || a.y !== b.y, `coin stayed at ${a.x},${a.y}`);
  t.assert(a.score === b.score, `score changed ${a.score} → ${b.score}`);
  await t.shot('coinhop');
  return `coin ${a.x},${a.y} → ${b.x},${b.y}`;
}
