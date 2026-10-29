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
