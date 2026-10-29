// Animations: spinning drones, "+1" popup and HUD bounce on pickup, camera shake on a drone hit.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const touch = what => `{ const s = __scene(), o = ${what}; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }`;

export async function pickup(t) {
  await t.js(park);
  await t.js(touch('s.coin'));
  await t.sleep(150);
  const popups = await t.js(`__scene().children.list.filter(o => o.type === 'Text' && o.text === '+1').length`);
  t.assert(popups === 1, `expected one +1 popup after a pickup, found ${popups}`);
  const hudTweening = await t.js('__scene().tweens.isTweening(__scene().hud)');
  t.assert(hudTweening, 'the HUD did not bounce after a pickup');
  await t.shot('animations-popup');
  await t.sleep(800);
  t.assert(await t.js(`__scene().children.list.filter(o => o.text === '+1').length`) === 0, 'the popup was not removed');
}

export async function popupDouble(t) {
  await t.js(park);
  await t.js('__scene().activateDouble()');
  await t.js(touch('s.coin'));
  await t.sleep(150);
  const text = await t.js(`__scene().children.list.filter(o => o.type === 'Text' && /^\\+\\d+$/.test(o.text)).map(o => o.text)`);
  t.assert(text.length === 1 && text[0] === '+2', `expected a +2 popup while doubled, got ${JSON.stringify(text)}`);
}

export async function drones(t) {
  await t.js(park);
  const a = await t.js('__scene().drones.getChildren()[0].angle');
  await t.sleep(300);
  const b = await t.js('__scene().drones.getChildren()[0].angle');
  t.assert(a !== b, `drone is not rotating (angle ${a} → ${b})`);
}

export async function shake(t) {
  await t.js(park);
  await t.js(touch('s.drones.getChildren()[0]'));
  await t.sleep(100);
  t.assert(await t.js('__scene().cameras.main.shakeEffect.isRunning'), 'no screen shake after a drone hit');
  await t.shot('animations-shake');
}
