// Time bonus: grabbing the white clock pushes the deadline later by addSeconds.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';

export async function timebonus(t) {
  await t.js(park);
  await t.js('__scene().spawnTimeBonus()');
  t.assert(await t.js('!!__scene().timeBonusPickup'), 'no time bonus pickup after spawn');
  const add = await t.js('COIN_DASH.timeBonus.addSeconds * 1000');
  const before = await t.js('__scene().deadline');
  await t.js('{ const s = __scene(), o = s.timeBonusPickup; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }');
  await t.sleep(200);
  const after = await t.js('__scene().deadline');
  t.assert(Math.abs(after - before - add) < 50, `deadline moved ${after - before}ms, expected ~${add}`);
  await t.shot('timebonus-grabbed');
  return `deadline +${after - before}ms`;
}
