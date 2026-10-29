// Bad experience mode: X turns it on, inverted controls push the player the wrong way, the ad and
// fake game-over show up, and leaving takes three presses of X.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';

export async function badmode(t) {
  await t.js(park);
  t.assert(await t.js('__scene().badMode') === false, 'bad mode was on by default');
  await t.press('KeyX');
  t.assert(await t.js('__scene().badMode') === true, 'X did not turn bad mode on');
  await t.js('__scene().badInverted = true');
  const x0 = await t.js('__scene().player.x');
  await t.hold('ArrowRight', 500);
  const x1 = await t.js('__scene().player.x');
  t.assert(x1 < x0 - 20, `inverted ArrowRight did not move left (x ${x0} → ${x1})`);
  await t.js('Object.assign(COIN_DASH.badMode, { adEveryMs: 300, fakeOverEveryMs: 400, freezeEveryMs: 99999, flipEveryMs: 99999 })');
  await t.press('KeyR');
  await t.sleep(300);
  await t.js(park);
  t.assert(await t.js('__scene().badMode') === true, 'bad mode did not survive R');
  await t.sleep(700);
  await t.shot('bad-mode');
  await t.press('KeyX');
  t.assert(await t.js('__scene().badMode') === true, 'one press of X left bad mode');
  await t.press('KeyX');
  await t.press('KeyX');
  t.assert(await t.js('__scene().badMode') === false, 'three presses of X did not leave bad mode');
  return `inverted ${Math.round(x1 - x0)}px, exit after 3 presses`;
}
