// Chase (chase.js): a moving drone within COIN_DASH.chase.range px of the player turns toward the player.
// Same pattern as tests/core.mjs: park the drones first so nothing else can end the round.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
// Drone 0 is put 200 px right of the player (inside the 320 px range) flying straight up. At droneSpeed 105 it
// covers at most 105 px in the 1000 ms wait, far short of the 200 px (minus 25 px of half-sizes) to the player,
// so the round cannot end; steering at 1.2/s bends its path left by roughly 55 px in that time (only ~22 px
// after 600 ms, too little to assert on), while an unsteered drone would keep x unchanged.
const droneX = '__scene().drones.getChildren()[0].x';

export async function chase(t) {
  await t.js(park);
  t.assert(await t.js('__scene().chase && __scene().chase.active') === true, 'chase.js did not mark the scene (scene.chase.active)');
  await t.js('{ const s = __scene(), d = s.drones.getChildren()[0]; d.body.reset(s.player.x + 200, s.player.y); d.body.setVelocity(0, -COIN_DASH.droneSpeed); }');
  const x0 = await t.js(droneX);
  await t.sleep(1000);
  const x1 = await t.js(droneX);
  t.assert(x0 - x1 >= 40, `the drone did not turn toward the player (x ${x0} → ${x1})`);
  t.assert(await t.js('__scene().finished') === false, 'the round ended during the chase check');
  await t.shot('chase');
  return `drone x ${Math.round(x0)} → ${Math.round(x1)} (${Math.round(x0 - x1)}px toward the player)`;
}
