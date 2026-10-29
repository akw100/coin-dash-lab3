// Hit feedback (hitfx.js): a drone hit shakes the camera and flashes; running out of time does not.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const touch = what => `{ const s = __scene(), o = ${what}; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }`;

export async function shake(t) {
  await t.js(park);
  await t.js(touch('s.drones.getChildren()[0]'));
  await t.sleep(80);
  t.assert(await t.js('__scene().finished') === true, 'the drone hit did not end the round');
  t.assert(await t.js('__scene().cameras.main.shakeEffect.isRunning') === true, 'no camera shake after a drone hit');
  t.assert(await t.js('__scene().hitFx.count') === 1, 'hitFx did not count the hit');
  await t.shot('hitfx-hit');
}

export async function timeup(t) {
  await t.js(park);
  await t.js('__scene().finish("Time is up!")');
  await t.sleep(80);
  t.assert(await t.js('__scene().cameras.main.shakeEffect.isRunning') === false, 'time running out must not shake the camera');
  t.assert(await t.js('__scene().hitFx.count') === 0, 'hitFx counted a hit that was not one');
}
