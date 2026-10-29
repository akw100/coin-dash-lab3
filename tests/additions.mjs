// Additions panel: unticking a feature switches it off for the next round, ticking it brings it back; shortcuts are listed.
const box = name => `document.querySelector('#additions input[name=${name}]').click()`;
const chaserIn = '__scene().drones.getChildren().includes(__scene().chaser)';

export async function additions(t) {
  try {
    const rows = await t.js('document.querySelectorAll("#additions tbody tr").length');
    t.assert(rows >= 18, `only ${rows} shortcuts listed`);
    const spawn = await t.js('COIN_DASH.magnet.spawnEveryMs');
    t.assert(await t.js(chaserIn), 'chaser missing before unticking it');
    await t.js(box('magnet'));
    await t.js(box('chaser'));
    await t.js(box('slowMo'));
    await t.sleep(300);
    t.assert(await t.js('COIN_DASH.magnet.spawnEveryMs') > 1e8, 'magnet still spawns after unticking it');
    t.assert(!await t.js(chaserIn), 'chaser still hunts after unticking it');
    t.assert(!await t.js('__scene().finished'), 'round did not restart cleanly');
    t.assert(await t.js('document.querySelector("#additions tr.off") !== null'), 'off shortcuts are not marked');
    await t.js(box('magnet'));
    await t.js(box('chaser'));
    await t.js(box('slowMo'));
    await t.sleep(300);
    t.assert(await t.js('COIN_DASH.magnet.spawnEveryMs') === spawn, 'magnet spawn interval not restored');
    t.assert(await t.js(chaserIn), 'chaser not back after ticking it');
    return `${rows} shortcuts; magnet, chaser and slow-mo toggled off and on`;
  } finally {
    await t.js('localStorage.removeItem(COIN_DASH.additions.storageKey)'); // the smoke profile is shared by later checks
  }
}
