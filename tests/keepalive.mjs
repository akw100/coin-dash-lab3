// Keepalive (keepalive.js): if the frame loop stops while the game is running, it is restarted within ~1 s.
// The stall is simulated by stopping the RAF loop directly (a thrown error would be recorded as a page error).
export async function restartsLoop(t) {
  t.assert(await t.js('!!window.coinDashKeepalive'), 'keepalive.js did not load');
  await t.js('coinDashGame.loop.raf.stop()');
  await t.sleep(250);
  const f0 = await t.js('coinDashGame.loop.frame');
  await t.sleep(250);
  t.assert(await t.js('coinDashGame.loop.frame') === f0, 'the loop did not stop when asked (test setup)');
  await t.sleep(1500);
  const f1 = await t.js('coinDashGame.loop.frame');
  t.assert(f1 > f0 + 10, `the loop was not restarted (frames ${f0} → ${f1})`);
  t.assert(await t.js('window.coinDashKeepalive.restarts') >= 1, 'keepalive did not count the restart');
  return `loop restarted, frames ${f0} → ${f1}`;
}
