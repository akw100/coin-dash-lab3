// UI polish: HUD panels track score and time, the end card appears.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const touch = what => `{ const s = __scene(), o = ${what}; o.setPosition(s.player.x, s.player.y); o.body.reset(s.player.x, s.player.y); }`;

export async function hud(t) {
  await t.js(park);
  const ui = await t.js('({ ok: !!__scene().ui, score: __scene().ui.scoreText.text, time: __scene().ui.timerText.text })');
  t.assert(ui.ok && ui.score === '0' && /^\d+s$/.test(ui.time), `HUD panels missing or wrong (${JSON.stringify(ui)})`);
  await t.js(touch('s.coin'));
  await t.sleep(200);
  t.assert(await t.js('__scene().ui.scoreText.text') === '1', 'score panel did not update after a pickup');
  await t.press('KeyL');
  await t.sleep(100);
  await t.shot('ui-light');
}

export async function endcard(t) {
  await t.js('__scene().finish("Time is up!")');
  await t.sleep(300);
  await t.shot('ui-end');
}

export async function timerColour(t) {
  await t.js(park);
  const colour = () => t.js('__scene().ui.timerText.style.color');
  const set = ms => t.js(`__scene().deadline = __scene().time.now + ${ms}`);
  const normal = await colour();
  await set(8000); await t.sleep(150);
  const amber = await colour();
  await set(3000); await t.sleep(150);
  const red = await colour();
  await set(30000); await t.sleep(150); // a clock pickup pushing the deadline later
  const back = await colour();
  t.assert(new Set([normal, amber, red]).size === 3, `timer colours not distinct (${normal}, ${amber}, ${red})`);
  t.assert(back === normal, `timer colour did not recover after deadline moved later (${back})`);
  await t.press('KeyL');
  await set(3000); await t.sleep(150);
  await t.shot('ui-timer-red-light');
  return `${normal} → ${amber} → ${red}`;
}
