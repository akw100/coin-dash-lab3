// Sounds: a coin pickup bumps the play counter; M mutes so it does not.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const touch = '{ const s = __scene(), o = s.coin; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }';

export async function coinSound(t) {
  await t.js(park);
  const a = await t.js('coinDashSounds.played');
  await t.js(touch);
  await t.sleep(300);
  const b = await t.js('coinDashSounds.played');
  t.assert(b > a, `coin did not play a sound (${a} → ${b})`);
}

export async function mute(t) {
  await t.js(park);
  await t.press('KeyM');
  await t.sleep(100);
  t.assert(await t.js('coinDashSounds.muted') === true, 'M did not mute');
  const a = await t.js('coinDashSounds.played');
  await t.js(touch);
  await t.sleep(300);
  const b = await t.js('coinDashSounds.played');
  t.assert(b === a, `sound counted while muted (${a} → ${b})`);
  await t.shot('sounds-muted');
}
