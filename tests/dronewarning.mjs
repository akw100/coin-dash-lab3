// Drone warning: the flag is on when a drone is within 90px of the player and off when it is far.
const place = (x, y) => `{ const s = __scene(), d = s.drones.getChildren()[0]; d.body.reset(${x}, ${y}); d.body.setVelocity(0, 0); null; }`;
const park = '__scene().drones.getChildren().forEach((d, i) => { d.body.reset(30 + i * 30, 480); d.body.setVelocity(0, 0); }); null';

export async function dronewarning(t) {
  await t.js(park);
  await t.sleep(100);
  t.assert(await t.js('__scene().droneWarning') === false, 'warning was on with all drones far away');
  const [px, py] = await t.js('[__scene().player.x, __scene().player.y]');
  await t.js(place(px + 60, py));
  await t.sleep(150);
  t.assert(await t.js('__scene().droneWarning') === true, 'warning was off with a drone 60px away');
  await t.shot('drone-warning');
  await t.js(park);
  await t.sleep(150);
  t.assert(await t.js('__scene().droneWarning') === false, 'warning stayed on after the drone moved away');
}
