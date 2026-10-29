// Slow-mo: holding Q slows drones to 40% and drains energy; releasing restores speed.
const speed = '__scene().drones.getChildren()[0].body.speed';
export async function slowmo(t) {
  const base = await t.js(speed);
  const e0 = await t.js('__scene().slowEnergy');
  const hold = t.hold('KeyQ', 800);
  await t.sleep(400);
  const slow = await t.js(speed), e1 = await t.js('__scene().slowEnergy');
  await t.shot('slowmo-active');
  await hold;
  t.assert(Math.abs(slow / base - 0.4) < 0.05, `drone speed ${base} → ${slow}, expected 40%`);
  t.assert(e1 < e0 - 0.2, `energy did not drop (${e0} → ${e1})`);
  await t.sleep(100);
  const back = await t.js(speed);
  t.assert(Math.abs(back / base - 1) < 0.05, `speed not restored (${base} → ${back})`);
  return `speed ${Math.round(base)} → ${Math.round(slow)} → ${Math.round(back)}, energy ${e0} → ${e1.toFixed(2)}`;
}
