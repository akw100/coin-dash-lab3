/* global COIN_DASH, CoinDash */
// Difficulty: keys 1/2/3 choose a preset (drone count + speed), remembered in localStorage, and restart the round.
const createWithoutDifficulty = CoinDash.prototype.create;
const diffStore = {
  get: () => { try { return localStorage.getItem(COIN_DASH.difficulty.storageKey); } catch (e) { return null; } },
  set: v => { try { localStorage.setItem(COIN_DASH.difficulty.storageKey, v); } catch (e) { /* ignore */ } }
};
CoinDash.prototype.create = function () {
  const d = COIN_DASH.difficulty;
  const saved = diffStore.get();
  this.difficulty = d.presets[saved] ? saved : d.default;
  // ponytail: presets overwrite the shared tunables, so game.js stays untouched.
  COIN_DASH.droneCount = d.presets[this.difficulty].droneCount;
  COIN_DASH.droneSpeed = d.presets[this.difficulty].droneSpeed;
  createWithoutDifficulty.call(this);
  this.add.text(COIN_DASH.width - 12, 12, `Difficulty: ${this.difficulty} (1/2/3)`, { font: '14px monospace', color: '#8fa3bf' })
    .setOrigin(1, 0).setDepth(50);
  this.input.keyboard.on('keydown', e => {
    const name = Object.keys(d.presets).find(n => 'Digit' + d.presets[n].key === e.code || d.presets[n].key === e.key);
    if (!name) return;
    diffStore.set(name);
    this.scene.restart();
  });
};
