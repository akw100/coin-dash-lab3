// Sad trombone: plays once on a loss, not when the player beats the bot, and M mutes it.
// Each check runs on a fresh page. coinDashSound.plays counts plays (headless Chrome makes no sound).
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const setup = async t => {
  await t.js(park);
  await t.js('localStorage.removeItem("coinDash.muted"); coinDashSound.muted = false; coinDashSound.plays = 0');
};
const plays = t => t.js('coinDashSound.plays');
const vsBot = async (t, you, bot) => {
  await setup(t);
  await t.press('KeyB'); await t.sleep(100);
  await t.js(`{ const s = __scene(); s.score = ${you}; s.botScore = ${bot}; s.finish("test"); }`);
};

export async function loss(t) {
  await setup(t);
  await t.js('__scene().finish("test")');
  await t.js('__scene().finish("again")');
  t.assert(await plays(t) === 1, `a loss played the sad sound ${await plays(t)} times, expected 1`);
}

export async function beatBot(t) {
  await vsBot(t, 3, 1);
  t.assert(await plays(t) === 0, 'sad sound played although the player beat the bot');
}

export async function botWins(t) {
  await vsBot(t, 1, 3);
  t.assert(await plays(t) === 1, 'sad sound did not play when the bot won');
}

export async function mute(t) {
  await setup(t);
  await t.press('KeyM'); await t.sleep(100);
  t.assert(await t.js('coinDashSound.muted') === true, 'M did not mute');
  await t.js('__scene().finish("test")');
  t.assert(await plays(t) === 0, 'sad sound played while muted');
}
