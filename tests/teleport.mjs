// Teleport (T): the player jumps in the direction they're moving, and the cooldown blocks an immediate second jump.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const pos = '({ x: __scene().player.x, y: __scene().player.y })';

export async function teleport(t) {
  await t.js(park);
  await t.js('{ const s = __scene(); s.player.body.reset(300, 250); s.teleportDir.set(1, 0); }');
  const a = await t.js(pos);
  await t.press('KeyT');
  await t.sleep(100);
  const b = await t.js(pos);
  t.assert(b.x - a.x >= 100, `T did not teleport the player right (x ${a.x} → ${b.x})`);
  await t.shot('teleport-flash');
  await t.press('KeyT');
  await t.sleep(100);
  const c = await t.js(pos);
  t.assert(Math.abs(c.x - b.x) < 5, `cooldown did not block a second teleport (x ${b.x} → ${c.x})`);
  return `x ${Math.round(a.x)} → ${Math.round(b.x)}, second T blocked`;
}
