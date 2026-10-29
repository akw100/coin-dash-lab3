// Restarting (R) must not pile up per-frame listeners on the scene's event emitter, which outlives restarts.
const count = '(() => { const e = __scene().events; return e.listenerCount("update") + e.listenerCount("postupdate"); })()';

export async function restartleak(t) {
  await t.press('KeyR');
  await t.sleep(200);
  const before = await t.js(count);
  for (let i = 0; i < 5; i++) { await t.press('KeyR'); await t.sleep(150); }
  const after = await t.js(count);
  t.assert(after === before, `5 restarts grew update/postupdate listeners ${before} → ${after}`);
  return `${after} listeners after 5 restarts`;
}
