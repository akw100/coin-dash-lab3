// Logo: drawn on the start overlay, animated, gone after the first key press.
export async function logo(t) {
  t.assert(await t.js('!!__scene().ui.logo && __scene().ui.logo.alpha === 1'), 'logo missing on the start overlay');
  const sx = () => t.js('__scene().ui.logo.list[1].scaleX');
  const a = await sx();
  await t.sleep(350);
  t.assert(Math.abs(await sx() - a) > 0.1, 'logo coin is not animating');
  await t.shot('logo-start');
  await t.press('KeyD');
  await t.sleep(500);
  t.assert(await t.js('__scene().ui.overlayHidden && !__scene().ui.logo.scene'), 'logo still there after a key press');
}
