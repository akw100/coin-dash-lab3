// Light mode: L switches the background and HUD to the light palette and back, and survives R.
const state = '({ light: __scene().lightMode, bg: __scene().cameras.main.backgroundColor.color, hud: __scene().hud.style.color })';

export async function lightmode(t) {
  const dark = await t.js(state);
  t.assert(dark.light === false, `game did not start in dark mode (${JSON.stringify(dark)})`);
  await t.press('KeyL');
  await t.sleep(100);
  const light = await t.js(state);
  t.assert(light.light === true && light.bg === await t.js("COIN_DASH.lightColors.background") && light.hud !== dark.hud,
    `L did not switch to light mode (${JSON.stringify(dark)} → ${JSON.stringify(light)})`);
  await t.press('KeyR');
  await t.sleep(300);
  const restarted = await t.js(state);
  t.assert(restarted.light === true && restarted.bg === light.bg, `light mode was lost on restart (${JSON.stringify(restarted)})`);
  await t.shot('lightmode-on');
  await t.press('KeyL');
  await t.sleep(100);
  const back = await t.js(state);
  t.assert(back.light === false && back.bg === dark.bg && back.hud === dark.hud, `second L did not restore dark mode (${JSON.stringify(back)})`);
  return `bg ${dark.bg.toString(16)} → ${light.bg.toString(16)} → ${back.bg.toString(16)}`;
}
