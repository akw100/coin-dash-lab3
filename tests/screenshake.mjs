// Screen shake: a drone catch shakes the camera; time-up does not.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const touch = what => `{ const s = __scene(), o = ${what}; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }`;

export async function shakeOnDrone(t) {
  await t.js(park);
  t.assert(await t.js('__scene().cameras.main.shakeEffect.isRunning') === false, 'camera shaking before any hit');
  await t.js(touch('__scene().drones.getChildren()[0]'));
  await t.sleep(100);
  t.assert(await t.js('__scene().cameras.main.shakeEffect.isRunning') === true, 'drone hit did not shake the camera');
  await t.shot('screen-shake');
}

export async function noShakeOnTimeUp(t) {
  await t.js(park);
  await t.js("__scene().finish('Time is up!')");
  await t.sleep(100);
  t.assert(await t.js('__scene().cameras.main.shakeEffect.isRunning') === false, 'time-up shook the camera');
}
