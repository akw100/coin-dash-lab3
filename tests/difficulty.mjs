// Difficulty: Digit3 = Hard, Digit1 = Easy; drone count and speed follow the presets.
const state = '({ n: __scene().drones.getChildren().filter(d => d !== __scene().chaser).length, v: Math.round(Math.hypot(...[__scene().drones.getChildren()[0].body.velocity.x, __scene().drones.getChildren()[0].body.velocity.y])), d: __scene().difficulty })';

export async function levels(t) {
  for (const [code, name] of [['Digit3', 'Hard'], ['Digit1', 'Easy']]) {
    await t.press(code);
    await t.sleep(300);
    const p = await t.js(`COIN_DASH.difficulty.presets.${name}`);
    const s = await t.js(state);
    t.assert(s.d === name && s.n === p.droneCount && Math.abs(s.v - p.droneSpeed) <= 2, `${name}: got ${JSON.stringify(s)}, want ${JSON.stringify(p)}`);
    await t.shot('difficulty-' + name.toLowerCase());
  }
  // The preset is remembered in localStorage and the smoke profile is shared by every check in a run:
  // forget it so later checks (glitter counts one emitter per drone) start from the default drone count.
  await t.js('localStorage.removeItem(COIN_DASH.difficulty.storageKey)');
}
