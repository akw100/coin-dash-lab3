// Timer bar (timerbar.js): a bar that shrinks with the time left and turns red in the last seconds.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';

export async function shrinks(t) {
  await t.js(park);
  t.assert(await t.js('!!__scene().timerBar'), 'the scene has no timerBar');
  const w0 = await t.js('__scene().timerBar.width');
  await t.sleep(800);
  const w1 = await t.js('__scene().timerBar.width');
  t.assert(w1 < w0 - 2, `the bar did not shrink (width ${w0} → ${w1})`);
  t.assert(await t.js('__scene().timerBar.fillColor === COIN_DASH.timerBar.colorStart'),
    'the bar is not the start colour early in the round');
  return `width ${Math.round(w0)} → ${Math.round(w1)}`;
}

export async function reddens(t) {
  await t.js(park);
  await t.js('__scene().deadline = __scene().time.now + 3000');
  await t.sleep(150);
  t.assert(await t.js('__scene().timerBar.fillColor === COIN_DASH.timerBar.colorEnd'),
    'the bar did not turn red in the last seconds');
  await t.shot('timerbar-red');
}

export async function restart(t) {
  await t.js('{ const s = __scene(); s.finish("test"); }');
  await t.press('KeyR');
  await t.sleep(300);
  const w = await t.js('__scene().timerBar && __scene().timerBar.width');
  t.assert(w > COIN_DASH_WIDTH_MIN, `after R the bar is missing or empty (width ${w})`);
}
const COIN_DASH_WIDTH_MIN = 700;
