// Glitter mode: G turns trail, rain and drone-shimmer emitters on, G again turns them off.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const state = `(() => { const k = __scene().glitter; return { on: k.on, all: k.emitters.every(e => e.emitting),
  none: k.emitters.every(e => !e.emitting), n: k.emitters.length, alive: k.emitters.reduce((a, e) => a + e.getAliveParticleCount(), 0) }; })()`;

export async function glitter(t) {
  await t.js(park);
  let s = await t.js(state);
  t.assert(s.none && !s.on, `glitter should start off (${JSON.stringify(s)})`);
  await t.press('KeyG');
  await t.sleep(600);
  s = await t.js(state);
  t.assert(s.on && s.all && s.n >= 5, `G did not activate every emitter (${JSON.stringify(s)})`);
  t.assert(s.alive > 0, 'no glitter particles alive');
  await t.shot('glitter-on');
  await t.press('KeyG');
  s = await t.js(state);
  t.assert(!s.on && s.none, `second G did not stop the emitters (${JSON.stringify(s)})`);
  return `${s.n} emitters toggled`;
}
