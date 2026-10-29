// Lives: a drone hit costs one life without ending the round; a touch during immunity costs nothing; the last life ends it.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const touch = what => `{ const s = __scene(), o = ${what}; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }`;

export async function lives(t) {
  await t.js(park);
  t.assert(await t.js('__scene().lives') === 3, 'round did not start with 3 lives');
  await t.js(touch('__scene().drones.getChildren()[0]'));
  await t.sleep(200);
  t.assert(await t.js('__scene().finished') === false, 'first hit ended the round');
  t.assert(await t.js('__scene().lives') === 2, `lives after a hit: ${await t.js('__scene().lives')}`);
  await t.js(touch('__scene().drones.getChildren()[0]'));
  await t.sleep(200);
  t.assert(await t.js('__scene().lives') === 2, 'a touch during immunity cost a life');
  await t.shot('lives');
  await t.js('__scene().livesUntil = 0; __scene().lives = 1');
  await t.js(touch('__scene().drones.getChildren()[0]'));
  await t.sleep(200);
  t.assert(await t.js('__scene().finished') === true, 'losing the last life did not end the round');
  return 'lives 3 → 2, immune, last life ends';
}
