// Player walking right into a wall stops at its left edge; coins never land inside a wall.
export async function wall(t) {
  await t.js('__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))');
  const b = await t.js('COIN_DASH.walls.blocks[0]');
  await t.js(`{ const p = __scene().player; p.setPosition(${b.x - b.w / 2 - 60}, ${b.y}); p.body.reset(${b.x - b.w / 2 - 60}, ${b.y}); }`);
  await t.hold('ArrowRight', 700);
  const x = await t.js('__scene().player.x');
  const edge = b.x - b.w / 2 - 12;
  t.assert(Math.abs(x - edge) < 3, `player at x=${x}, expected to stop at the wall edge ${edge}`);
  const bad = await t.js(`(() => { const s = __scene(); let n = 0; for (let i = 0; i < 300; i++) { s.placeCoin();
    if (COIN_DASH.walls.blocks.some(b => Math.abs(s.coin.x - b.x) < b.w / 2 && Math.abs(s.coin.y - b.y) < b.h / 2)) n++; } return n; })()`);
  t.assert(bad === 0, `${bad} coins spawned inside a wall`);
  return `stopped at x=${Math.round(x)}`;
}
