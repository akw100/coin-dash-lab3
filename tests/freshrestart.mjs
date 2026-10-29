// Fresh restart (freshrestart.js): reloads the page on a new round for players, but stays inert under the
// automated harness (navigator.webdriver) so every other check can still restart the scene in place.
export async function inertUnderAutomation(t) {
  const s = await t.js('window.coinDashFreshRestart && { active: window.coinDashFreshRestart.active, reloads: window.coinDashFreshRestart.reloads }');
  t.assert(s && s.active === false, `fresh restart should be inactive under automation (${JSON.stringify(s)})`);
  await t.press('KeyR');
  await t.sleep(300);
  t.assert(await t.js('window.coinDashFreshRestart.reloads') === 0, 'the page was reloaded under automation');
}
