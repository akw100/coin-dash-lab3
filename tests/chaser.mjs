// The chaser drone closes in on the player, and touching it ends the round.
const park = '__scene().drones.getChildren().forEach((d, i) => { if (d !== __scene().chaser) d.body.reset(30 + i * 30, 480); })';
const dist = '(() => { const s = __scene(); return Math.hypot(s.chaser.x - s.player.x, s.chaser.y - s.player.y); })()';

export async function chases(t) {
  await t.js(park);
  await t.js('__scene().chaser.body.reset(700, 450)');
  const d0 = await t.js(dist);
  let d1 = d0;
  for (let i = 0; i < 10 && d1 > d0 - 30; i++) { await t.sleep(500); d1 = await t.js(dist); }
  t.assert(d1 < d0 - 30, `chaser did not close in on the player (${d0} → ${d1})`);
  await t.shot('chaser');
  return `distance ${Math.round(d0)} → ${Math.round(d1)}`;
}

export async function ends(t) {
  await t.js(park);
  await t.js('{ const s = __scene(); s.chaser.body.reset(s.player.x, s.player.y); }');
  await t.sleep(200);
  t.assert(await t.js('__scene().finished') === true, 'touching the chaser did not end the round');
}
