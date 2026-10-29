// Neon theme: T switches the player to the neon colour and a second Y restores the default.
export async function theme(t) {
  const col = '__scene().player.fillColor';
  const def = await t.js(col);
  await t.press('KeyY');
  await t.sleep(100);
  const neon = await t.js(col);
  t.assert(neon === await t.js('COIN_DASH.neon.player') && neon !== def, `Y did not switch to neon (${def} → ${neon})`);
  await t.shot('theme-neon');
  await t.press('KeyY');
  await t.sleep(100);
  t.assert(await t.js(col) === def, 'second T did not restore the default player colour');
  return `player ${def.toString(16)} → ${neon.toString(16)} → ${def.toString(16)}`;
}
