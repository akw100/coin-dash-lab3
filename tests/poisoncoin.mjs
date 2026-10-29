// Poison coin: touching it takes penalty points off the score (never below 0) and removes it.
const park = '__scene().drones.getChildren().forEach((d, i) => { d.body.reset(30 + i * 30, 480); d.body.stop(); })';
const touch = '{ const s = __scene(), o = s.poisonCoin; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); 0; }';

export async function costsPoints(t) {
  await t.js(park);
  await t.js('(__scene().score = 10, __scene().spawnPoisonCoin(), 0)');
  t.assert(await t.js('!!__scene().poisonCoin'), 'spawnPoisonCoin() made no coin');
  await t.shot('poisoncoin');
  await t.js(touch);
  await t.sleep(200);
  const score = await t.js('__scene().score');
  t.assert(score === 10 - await t.js('COIN_DASH.poisonCoin.penalty'), `score after poison is ${score}, expected 10 - penalty`);
  t.assert(await t.js('__scene().poisonCoin === null'), 'the poison coin stayed after being touched');
  t.assert(await t.js('__scene().finished') === false, 'the poison coin ended the round');
  return `score 10 → ${score}`;
}

export async function neverNegative(t) {
  await t.js(park);
  await t.js('(__scene().score = 1, __scene().spawnPoisonCoin(), 0)');
  await t.js(touch);
  await t.sleep(200);
  const score = await t.js('__scene().score');
  t.assert(score === 0, `score went to ${score}, expected 0`);
}
