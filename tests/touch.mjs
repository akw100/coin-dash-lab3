// Touch controls: holding a pointer moves the player toward it; a tap on a finished round restarts.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const point = (x, y, down) => `{ const p = __scene().input.activePointer; p.worldX = ${x}; p.worldY = ${y}; p.isDown = ${down}; }`;

export async function follow(t) {
  await t.js(park);
  const x0 = await t.js('__scene().player.x');
  const y0 = await t.js('__scene().player.y');
  const tx = x0 + 150, ty = y0 - 80;
  await t.js(point(tx, ty, true));
  let s;
  for (let i = 0; i < 20; i++) { // poll: a loaded machine runs frames slowly
    await t.sleep(250);
    s = await t.js('({ x: __scene().player.x, y: __scene().player.y })');
    if (Math.hypot(s.x - tx, s.y - ty) < 12) break;
  }
  t.assert(Math.hypot(s.x - tx, s.y - ty) < 12, `player did not reach the pointer (${s.x},${s.y} vs ${tx},${ty})`);
  await t.js(point(tx, ty, false));
  await t.shot('touch-follow');
}

export async function tap(t) {
  await t.js('{ const s = __scene(); s.score = 5; s.finish("test"); }');
  await t.js('__scene().input.emit("pointerdown", {})');
  await t.sleep(300);
  const st = await t.js('({ score: __scene().score, finished: __scene().finished })');
  t.assert(st.score === 0 && !st.finished, `tap did not restart (${JSON.stringify(st)})`);
}
