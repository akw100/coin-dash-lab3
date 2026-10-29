// Combo: two coins picked up quickly are worth 1 then 2.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const touch = what => `{ const s = __scene(), o = ${what}; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }`;

export async function combo(t) {
  await t.js(park);
  const s0 = await t.js('__scene().score');
  await t.js(touch('s.coin'));
  await t.sleep(200);
  const s1 = await t.js('__scene().score');
  await t.js(touch('s.coin'));
  await t.sleep(200);
  const s2 = await t.js('__scene().score');
  t.assert(s1 - s0 === 1, `first coin was worth ${s1 - s0}, expected 1`);
  t.assert(s2 - s1 === 2, `second quick coin was worth ${s2 - s1}, expected 2`);
  await t.shot('combo');
  return `score ${s0} → ${s1} → ${s2}`;
}
