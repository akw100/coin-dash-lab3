// Countdown: frozen until GO, then the player moves and the clock runs. force=true because smoke skips it by default.
export async function frozenThenGo(t) {
  await t.js('(COIN_DASH.countdown.force = true, COIN_DASH.countdown.seconds = 1, __scene().scene.restart(), 1)');
  await t.sleep(200);
  const x0 = await t.js('__scene().player.x');
  await t.hold('ArrowRight', 300);
  t.assert(await t.js('__scene().player.x') === x0, 'player moved during the countdown');
  await t.shot('countdown-3');
  await t.sleep(1800);
  const x1 = await t.js('__scene().player.x');
  await t.hold('ArrowRight', 300);
  t.assert(await t.js('__scene().player.x') > x1 + 20, 'player cannot move after GO');
  const left = await t.js('(__scene().deadline - __scene().time.now) / 1000');
  t.assert(left > COIN_DASH_ROUND_MIN, `deadline did not start after GO (${left}s left)`);
}
const COIN_DASH_ROUND_MIN = 40;

export async function chainSkips(t) {
  await t.js("(localStorage.setItem(COIN_DASH.autoContinue.storageKey, '1'), COIN_DASH.countdown.force = true, __scene().scene.restart(), 1)");
  await t.sleep(200);
  t.assert(await t.js('__scene().countdownLeft') === 0, 'countdown shown while auto-continue is on');
  await t.js("(localStorage.removeItem(COIN_DASH.autoContinue.storageKey), 1)");
}
