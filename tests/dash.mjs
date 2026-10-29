// Dash (Space): a burst moves much further than normal running, and a second Space during the cooldown does nothing.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const x = '__scene().player.x';

export async function dash(t) {
  await t.js(park);
  await t.js('__scene().player.body.reset(100, 250)');
  await t.hold('ArrowRight', 300);
  const plain = (await t.js(x)) - 100;
  await t.sleep(1700); // let the cooldown (none used yet) and any state settle
  await t.js('__scene().player.body.reset(100, 250)');
  const h = t.hold('ArrowRight', 300);
  await t.sleep(30);
  await t.press('Space');
  await h;
  const dashed = (await t.js(x)) - 100;
  t.assert(dashed > plain + 60, `dash did not go further (plain ${Math.round(plain)}, dash ${Math.round(dashed)})`);
  await t.shot('dash-cooldown-bar');
  await t.js('__scene().player.body.reset(100, 250)');
  const readyAt = await t.js('__scene().dashReadyAt');
  await t.press('Space');
  t.assert(await t.js('__scene().dashReadyAt') === readyAt, 'Space during cooldown restarted the dash');
  return `plain +${Math.round(plain)}px, dash +${Math.round(dashed)}px`;
}
