// Help overlay (H): visible while open, game frozen; hidden again, movement works.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';

export async function toggle(t) {
  await t.js(park);
  await t.press('KeyH');
  await t.sleep(100);
  t.assert(await t.js('__scene().helpOverlay.visible') === true, 'H did not show the overlay');
  await t.shot('helpoverlay-open');
  const x0 = await t.js('__scene().player.x');
  await t.hold('ArrowRight', 300);
  t.assert(await t.js('__scene().player.x') === x0, 'player moved while help was open');
  await t.press('KeyH');
  await t.sleep(100);
  t.assert(await t.js('__scene().helpOverlay.visible') === false, 'second H did not hide the overlay');
  await t.hold('ArrowRight', 300);
  t.assert(await t.js('__scene().player.x') > x0 + 20, 'player did not move after closing help');
}

export async function deadline(t) {
  const d0 = await t.js('__scene().deadline');
  await t.press('KeyH');
  await t.sleep(1000);
  await t.press('KeyH');
  const d1 = await t.js('__scene().deadline');
  t.assert(d1 - d0 > 900, `deadline not shifted (${d1 - d0}ms)`);
}
