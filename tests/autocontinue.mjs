// Auto-continue: with the option on a finished round restarts after the countdown; with it off it stays finished.
const end = '{ const s = __scene(); s.score = 5; s.finish("test"); }';

export async function on(t) {
  await t.js('__scene().autoContinue = true');
  await t.js(end);
  await t.sleep(500);
  t.assert(await t.js('__scene().finished') === true, 'round should still be finished during the countdown');
  await t.shot('autocontinue-countdown');
  const secs = await t.js('COIN_DASH.autoContinue.seconds');
  await t.sleep(secs * 1000);
  const st = await t.js('({ score: __scene().score, finished: __scene().finished })');
  t.assert(st.score === 0 && !st.finished, `no fresh round after countdown (${JSON.stringify(st)})`);
}

export async function skip(t) {
  await t.js('__scene().autoContinue = true');
  await t.js(end);
  await t.sleep(300);
  await t.press('KeyX');
  await t.sleep(300);
  t.assert(await t.js('__scene().finished') === false, 'a key press did not skip the countdown');
}

export async function off(t) {
  await t.js('__scene().autoContinue = false');
  await t.js(end);
  const secs = await t.js('COIN_DASH.autoContinue.seconds');
  await t.sleep(secs * 1000 + 500);
  t.assert(await t.js('__scene().finished') === true, 'round restarted with auto-continue off');
}

export async function toggle(t) {
  const before = await t.js('__scene().autoContinue');
  await t.press('KeyN');
  t.assert(await t.js('__scene().autoContinue') === !before, 'N did not toggle auto-continue');
}
