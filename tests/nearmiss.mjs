// Near miss: a drone brought close to the player and moved away again shows "Close call!"; a touch does not count.
const park = '__scene().drones.getChildren().forEach((d, i) => { d.body.reset(30 + i * 30, 480); d.body.stop(); })';
const place = gap => `{ const s = __scene(), d = s.drones.getChildren()[0], x = s.player.x + (d.width + s.player.width) / 2 + ${gap};
  d.setPosition(x, s.player.y); d.body.reset(x, s.player.y); d.body.stop(); 0; }`;
const popup = "__scene().children.list.some(o => o.text === COIN_DASH.nearMiss.text)";

export async function closeCall(t) {
  await t.js(park);
  await t.sleep(100);
  const before = await t.js('__scene().nearMisses');
  await t.js(place(8));
  await t.sleep(100);
  await t.js(park);
  await t.sleep(100);
  t.assert(await t.js(popup), 'no "Close call!" popup after a near miss');
  await t.shot('nearmiss');
  const after = await t.js('__scene().nearMisses');
  t.assert(after === before + 1, `nearMisses ${before} → ${after}, expected +1`);
  t.assert(await t.js('__scene().finished') === false, 'a near miss ended the round');
  return `nearMisses ${before} → ${after}`;
}

export async function farIsNothing(t) {
  await t.js(park);
  await t.sleep(100);
  const before = await t.js('__scene().nearMisses');
  await t.js(place(60));
  await t.sleep(100);
  await t.js(park);
  await t.sleep(100);
  t.assert(await t.js('__scene().nearMisses') === before, 'a drone 60px away counted as a near miss');
}
