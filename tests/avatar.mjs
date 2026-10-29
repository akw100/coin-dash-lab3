// Avatar wardrobe: clicking a chip changes the look and the drawn avatar hides the plain square; C rolls a random look.
const pick = (k, v) => `document.querySelector('#wardrobe [data-k=${k}][data-v=${v}]').click()`;

export async function wardrobe(t) {
  for (const [k, v] of [['body', 'cat'], ['color', 'rainbow'], ['face', 'shades'], ['hat', 'propeller'], ['aura', 'fire']]) await t.js(pick(k, v));
  await t.hold('ArrowRight', 300);
  const s = await t.js(`(() => { const s = __scene(); return { look: s.avatar, gfx: s.avatarGfx.active && s.avatarGfx.visible,
    hidden: s.player.fillAlpha === 0, aura: s.children.list.filter(o => o.name === 'avatarAura').length,
    on: document.querySelectorAll('#wardrobe button.on').length }; })()`);
  t.assert(s.look.body === 'cat' && s.look.hat === 'propeller', `chips did not set the look (${JSON.stringify(s.look)})`);
  t.assert(s.gfx && s.hidden, 'avatar graphics not drawn over a hidden hitbox');
  t.assert(s.aura > 0, 'fire aura spawned no particles');
  t.assert(s.on === 5, `expected 5 highlighted chips, got ${s.on}`);
  await t.shot('avatar-cat');
  return `${JSON.stringify(s.look)}, ${s.aura} aura particles`;
}

export async function randomKey(t) {
  const looks = new Set();
  for (let i = 0; i < 6; i++) { await t.press('KeyC'); looks.add(await t.js('JSON.stringify(__scene().avatar)')); }
  t.assert(looks.size > 1, 'C did not change the avatar');
  await t.press('KeyR');
  await t.sleep(200);
  t.assert(await t.js('__scene().avatarGfx.active'), 'avatar missing after restart');
  await t.shot('avatar-random');
  return `${looks.size} different looks from 6 presses`;
}
