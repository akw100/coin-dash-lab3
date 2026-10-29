// Round stats: after moving and finishing, the stats object has values > 0 and the stats text is shown.
export async function stats(t) {
  await t.js('__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))');
  await t.hold('ArrowRight', 400);
  await t.js('{ const s = __scene(); s.score = 3; s.finish("test"); }');
  await t.sleep(200);
  const st = await t.js('({ ...__scene().stats, text: __scene().statsText && __scene().statsText.text })');
  t.assert(st.distance > 0 && st.seconds > 0 && st.coinsPerMin > 0, `stats not > 0 (${JSON.stringify(st)})`);
  t.assert(st.text && st.text.includes('Distance'), 'stats text missing');
  await t.shot('roundstats');
}
