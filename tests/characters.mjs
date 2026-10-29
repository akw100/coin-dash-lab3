// Characters (characters.js): an animated hero is drawn over the player and a wobbling, pulsing star over each
// drone; the physics rectangles stay in place but are drawn with alpha 0, so only the characters show.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const state = `(() => { const s = __scene(), c = s.characters; return c && {
  drones: c.drones.length, droneCount: s.drones.getChildren().length,
  px: c.player.x, py: c.player.y, x: s.player.x, y: s.player.y, rotation: c.drones[0].rotation,
  shown: c.player.visible && c.player.alpha > 0 && c.drones.every(d => d.visible && d.alpha > 0),
  hidden: [s.player, ...s.drones.getChildren()].every(r => r.fillAlpha === 0 || r.alpha === 0) }; })()`;

export async function characters(t) {
  await t.js(park);
  const a = await t.js(state);
  t.assert(a, 'scene.characters is missing');
  t.assert(a.drones === a.droneCount, `expected ${a.droneCount} drone characters (one per drone), found ${a.drones}`);
  await t.hold('ArrowRight', 300);
  const b = await t.js(state);
  t.assert(Math.abs(b.px - b.x) <= 4 && Math.abs(b.py - b.y) <= 4,
    `the hero is not on the player (hero ${b.px},${b.py} vs player ${b.x},${b.y})`);
  await t.sleep(300);
  const c = await t.js(state);
  t.assert(c.rotation !== b.rotation, `drone character is not wobbling (rotation ${b.rotation} → ${c.rotation})`);
  t.assert(c.hidden, 'the player or drone rectangles are still drawn (fill alpha not 0)');
  t.assert(c.shown, 'a character is not visible');
  await t.shot('characters');
  return `${c.drones} drone stars, hero ${Math.round(b.px - b.x)},${Math.round(b.py - b.y)} px off the player`;
}
