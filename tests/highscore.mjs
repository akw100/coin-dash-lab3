// High score: "Best: N" in the HUD, raised when a round beats it, kept in localStorage across reloads.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const clear = 'localStorage.removeItem(COIN_DASH.highScoreKey)';
const stored = 'localStorage.getItem(COIN_DASH.highScoreKey)';
const hud = '__scene().hud.text';

// Reload the page and wait for the game to boot again (the storage survives, the scene does not).
async function reload(t) {
  await t.js('location.reload()').catch(() => {});
  for (let i = 0; i < 80; i++) {
    await t.sleep(100);
    if (await t.js('!!(window.coinDashGame?.isRunning && __scene()?.hud)').catch(() => false)) return;
  }
  throw new Error('the game did not start again after a reload');
}

export async function persist(t) {
  await t.js(clear);
  await reload(t);
  await t.js(park);
  await t.sleep(200);
  let text = await t.js(hud);
  t.assert(/Best: 0\b/.test(text), `fresh page should show "Best: 0" in the HUD, got "${text}"`);
  await t.js('{ const s = __scene(); s.score = 7; s.finish("test"); }');
  await t.sleep(200);
  text = await t.js(hud);
  t.assert(/Best: 7\b/.test(text), `HUD did not update to "Best: 7" after a 7-coin round, got "${text}"`);
  t.assert(await t.js(stored) === '7', `localStorage did not store the best score of 7 (${await t.js(stored)})`);
  await t.shot('highscore.newbest');
  await reload(t);
  await t.js(park);
  await t.sleep(200);
  const best = await t.js('__scene().best');
  text = await t.js(hud);
  t.assert(best === 7 && /Best: 7\b/.test(text), `best did not survive a reload (best ${best}, HUD "${text}")`);
  return 'Best 0 → 7, still 7 after reload';
}

export async function keep(t) {
  await t.js(clear);
  await t.js('localStorage.setItem(COIN_DASH.highScoreKey, "9")');
  await reload(t);
  await t.js(park);
  await t.js('{ const s = __scene(); s.score = 3; s.finish("test"); }');
  await t.sleep(200);
  const best = await t.js('__scene().best'), text = await t.js(hud);
  t.assert(best === 9 && await t.js(stored) === '9' && /Best: 9\b/.test(text),
    `a 3-coin round lowered the best of 9 (best ${best}, stored ${await t.js(stored)}, HUD "${text}")`);
  await t.press('KeyR');
  await t.sleep(300);
  t.assert(await t.js('__scene().best') === 9, 'R did not carry the best score into the new round');
  return 'Best 9 kept after a 3-coin round and R';
}
