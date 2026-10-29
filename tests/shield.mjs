// Shield: a drone hit while shielded does nothing and uses the shield up; the next hit ends the round.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const touch = what => `{ const s = __scene(), o = ${what}; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }`;

export async function shield(t) {
  await t.js(park);
  await t.js('__scene().spawnShield()');
  await t.js(touch('__scene().shieldPickup'));
  await t.sleep(200);
  t.assert(await t.js('__scene().shielded') === true, 'grabbing the shield did not turn it on');
  await t.shot('shield-active');
  await t.js(touch('__scene().drones.getChildren()[0]'));
  await t.sleep(200);
  t.assert(await t.js('__scene().finished') === false, 'a drone hit ended the round despite the shield');
  t.assert(await t.js('__scene().shielded') === false, 'the shield was not used up by the hit');
  await t.js(park);
  await t.sleep(900);
  await t.js('__scene().lives = 1'); // lives.js: the last life is the one that ends the round
  await t.js(touch('__scene().drones.getChildren()[0]'));
  await t.sleep(200);
  t.assert(await t.js('__scene().finished') === true, 'the second drone hit did not end the round');
  return 'shield absorbed one hit, second hit ended the round';
}
