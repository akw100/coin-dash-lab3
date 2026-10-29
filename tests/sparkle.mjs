// Sparkly coins: glow + twinkle follow the coin, and collecting it fires a burst.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';

export async function sparkle(t) {
  await t.js(park);
  await t.sleep(400); // let a few twinkle stars spawn
  const s = await t.js(`(() => { const s = __scene(), k = s.sparkle; return k && {
    follows: k.twinkle.follow === s.coin, emitting: k.twinkle.emitting,
    pulsing: k.tweens.every(w => w.isPlaying()), alive: k.twinkle.getAliveParticleCount() }; })()`);
  t.assert(s, 'scene.sparkle is missing');
  t.assert(s.follows && s.emitting, `twinkle emitter does not follow the coin (${JSON.stringify(s)})`);
  t.assert(s.pulsing, 'glow/shimmer tweens are not playing');
  t.assert(s.alive > 0, 'no twinkle particles alive');
  await t.js('{ const s = __scene(); s.coin.setPosition(s.player.x, s.player.y); s.coin.body.reset(s.player.x, s.player.y); }');
  await t.sleep(120);
  const after = await t.js(`(() => { const s = __scene(), k = s.sparkle; return {
    burst: k.burst.getAliveParticleCount(), glowOnCoin: k.glow.x === s.coin.x && k.glow.y === s.coin.y }; })()`);
  t.assert(after.burst > 0, 'collecting the coin did not fire a sparkle burst');
  t.assert(after.glowOnCoin, 'glow did not follow the coin to its new spot');
  return `twinkle ${s.alive}, burst ${after.burst}`;
}

export async function sparkleRestart(t) {
  await t.js('__scene().finish("test")');
  await t.press('KeyR');
  await t.sleep(300);
  t.assert(await t.js('__scene().sparkle.twinkle.follow === __scene().coin'), 'sparkle not re-attached after restart');
}

export async function sparkleOnce(t) {
  const n = await t.js(`__scene().children.list.filter(o => o.type === 'ParticleEmitter' && o.follow === __scene().coin).length`);
  t.assert(n === 1, `${n} twinkle emitters follow the coin (expected 1)`);
}

export async function sparkleLight(t) {
  await t.js(park);
  await t.press('KeyL');
  await t.js('{ const s = __scene(); s.coin.setPosition(s.player.x, s.player.y); s.coin.body.reset(s.player.x, s.player.y); }');
  await t.sleep(120);
  const r = await t.js(`(() => { const s = __scene(), k = s.sparkle, light = COIN_DASH.sparkle.lightColors;
    const tints = k.burst.alive.map(p => p.tint);
    return { light: s.lightMode, glow: k.glow.fillColor === s.coin.fillColor, blend: k.glow.blendMode,
      n: tints.length, ok: tints.every(c => light.includes(c)) }; })()`);
  t.assert(r.light, 'L did not turn on light mode');
  t.assert(r.glow, 'glow does not match the light-mode coin colour');
  t.assert(r.blend === 0, `glow still uses ADD blending in light mode (${r.blend})`);
  t.assert(r.n > 0 && r.ok, `burst stars do not use the light-mode colours (${JSON.stringify(r)})`);
  await t.shot('sparkle-light');
  return `burst ${r.n} in light colours`;
}
