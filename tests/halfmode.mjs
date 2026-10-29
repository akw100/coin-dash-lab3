// Half-points mode: with H on, a drone hit halves the score, the round goes on, and a second touch during
// the invulnerability window changes nothing.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const touch = what => `{ const s = __scene(), o = ${what}; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }`;

export async function halfmode(t) {
  await t.js(park);
  await t.press('KeyH');
  await t.js('__scene().score = 9');
  await t.js(touch('__scene().drones.getChildren()[0]'));
  await t.sleep(200);
  t.assert(await t.js('__scene().finished') === false, 'a drone hit ended the round in half mode');
  t.assert(await t.js('__scene().score') === 4, `score was not halved (${await t.js('__scene().score')})`);
  await t.shot('half-mode');
  await t.js(park);
  await t.js(touch('__scene().drones.getChildren()[0]'));
  await t.sleep(200);
  t.assert(await t.js('__scene().score') === 4, 'a second touch during invulnerability halved again');
  return 'score 9 → 4, no second halving';
}
