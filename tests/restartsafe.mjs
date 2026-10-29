// Restart safety: R must not leave the previous round's update listeners behind.
const count = "['update', 'postupdate'].reduce((n, e) => n + __scene().events.listenerCount(e), 0)";

export async function noLeak(t) {
  const n0 = await t.js(count);
  for (let i = 0; i < 3; i++) { await t.press('KeyR'); await t.sleep(300); }
  const n1 = await t.js(count);
  t.assert(n1 <= n0, `update listeners grew across restarts (${n0} → ${n1})`);
  return `${n0} listeners before and after 3 restarts`;
}

// Installed at boot, so it wraps every feature's create, even ones whose script comes after restartsafe.js.
export async function outermost(t) {
  t.assert(await t.js('CoinDash.prototype.create === window.coinDashRestartSafe'),
    'restartsafe.js is not the outermost create wrapper, so later features can still leak listeners');
}
