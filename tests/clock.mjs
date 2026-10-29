// Clock pickup: grabbing it pushes the deadline later by the configured seconds.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';

export async function clock(t) {
  await t.js(park);
  await t.js('__scene().spawnClock()');
  const add = await t.js('COIN_DASH.clock.addSeconds * 1000');
  const before = await t.js('__scene().deadline');
  await t.js('{ const s = __scene(), o = s.clockPickup; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }');
  await t.sleep(200);
  const after = await t.js('__scene().deadline');
  t.assert(after - before === add, `deadline moved ${after - before}ms, expected ${add}`);
  await t.shot('clock-grabbed');
  return `deadline +${after - before}ms`;
}
