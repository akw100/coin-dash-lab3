// EMP bomb: B freezes drones for freezeMs, only once per round; they move again afterwards.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const vel = '__scene().drones.getChildren().map(d => Math.hypot(d.body.velocity.x, d.body.velocity.y))';

export async function emp(t) {
  await t.js(park);
  await t.js('__scene().drones.getChildren().forEach(d => d.body.setVelocity(60, 0))');
  await t.press('KeyE');
  await t.sleep(150);
  t.assert(await t.js('__scene().empUsed') === true, 'B did not use the EMP');
  t.assert((await t.js(vel)).every(v => v === 0), 'drones not frozen: ' + JSON.stringify(await t.js(vel)));
  await t.shot('emp-frozen');
  await t.press('KeyE');
  await t.sleep(100);
  t.assert((await t.js(vel)).every(v => v === 0), 'second B changed the frozen drones');
  await t.sleep(await t.js('COIN_DASH.emp.freezeMs') + 200);
  t.assert((await t.js(vel)).every(v => v > 0), 'drones did not move again after the freeze');
  await t.press('KeyE');
  await t.sleep(100);
  t.assert((await t.js(vel)).every(v => v > 0), 'second B re-froze the drones');
}
