// Speed boost: touching the diamond multiplies speed for a while, then it expires.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';

export async function speedboost(t) {
  await t.js(park);
  await t.js('__scene().spawnBoost()');
  await t.js('{ const s = __scene(), o = s.boostPickup; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }');
  await t.sleep(200);
  t.assert(await t.js('__scene().boosted') === true, 'touching the diamond did not boost the player');
  const base = await t.js('COIN_DASH.playerSpeed');
  const mult = await t.js('COIN_DASH.speedBoost.multiplier');
  await t.js('__scene().boostUntil = __scene().time.now + 60000');
  const v = await t.js('(() => { const s = __scene(); s.cursors.right.isDown = true; s.update(); s.cursors.right.isDown = false; return Math.hypot(s.player.body.velocity.x, s.player.body.velocity.y); })()');
  t.assert(Math.abs(v - base * mult) < 1, `boosted speed ${v}, expected ${base * mult}`);
  await t.shot('speedboost-active');
  await t.js('__scene().boostUntil = __scene().time.now + 200');
  await t.sleep(500);
  t.assert(await t.js('__scene().boosted') === false, 'boost did not expire');
  return `speed ${v}`;
}
