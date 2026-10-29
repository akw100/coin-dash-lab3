// Wraparound: holding ArrowRight at the right edge brings the player out at the left edge.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';

export async function wraparound(t) {
  await t.js(park);
  await t.js('{ const s = __scene(); s.player.body.reset(780, 250); }');
  await t.hold('ArrowRight', 300);
  const x = await t.js('__scene().player.x');
  t.assert(x < 150, `player did not wrap to the left edge (x ${x})`);
  await t.js('{ const s = __scene(); s.player.body.reset(400, 480); }');
  await t.hold('ArrowDown', 300);
  const y = await t.js('__scene().player.y');
  t.assert(y < 120, `player did not wrap to the top (y ${y})`);
  return `x → ${Math.round(x)}, y → ${Math.round(y)}`;
}
