/* global COIN_DASH, CoinDash */
// WebAudio beeps, no files. window.coinDashSounds.played counts sounds played (not muted) for tests.
const soundCreate = CoinDash.prototype.create;
const soundUpdate = CoinDash.prototype.update;
const soundFinish = CoinDash.prototype.finish;
const sfx = window.coinDashSounds = { played: 0, muted: false, ctx: null };
try { sfx.muted = localStorage.getItem(COIN_DASH.sounds.storageKey) === '1'; } catch (e) { /* ignore */ }
function play(notes, type) { // notes: [[freqHz, startSec, durSec], ...]
  if (sfx.muted) return;
  sfx.played++;
  try {
    const ctx = sfx.ctx = sfx.ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    notes.forEach(([f, at, dur]) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + at;
      o.type = type; o.frequency.setValueAtTime(f, t0);
      g.gain.setValueAtTime(COIN_DASH.sounds.volume, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0 + dur);
    });
  } catch (e) { /* no audio available */ }
}
CoinDash.prototype.create = function () {
  soundCreate.call(this);
  this.soundScore = 0;
  const k = COIN_DASH.sounds;
  const badge = this.add.text(COIN_DASH.width - 12, 12, '', { font: '14px monospace', color: '#8fa3bf' })
    .setOrigin(1, 0).setDepth(50);
  const refresh = () => badge.setText(sfx.muted ? `Sound (${k.key}): OFF` : `Sound (${k.key}): ON`);
  refresh();
  this.input.keyboard.on('keydown', e => {
    if (e.key.toUpperCase() !== k.key) return;
    sfx.muted = !sfx.muted;
    try { localStorage.setItem(k.storageKey, sfx.muted ? '1' : '0'); } catch (err) { /* ignore */ }
    refresh();
  });
};
CoinDash.prototype.update = function () {
  soundUpdate.call(this);
  if (this.score > this.soundScore) play([[660, 0, 0.08], [990, 0.07, 0.1]], 'square'); // rising blip
  this.soundScore = this.score;
};
CoinDash.prototype.finish = function (reason) {
  const was = this.finished;
  soundFinish.call(this, reason);
  if (was) return;
  if (this.score > this.soundScore) this.soundScore = this.score;
  if (reason === 'Time is up!') play([[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.2]], 'triangle');
  else play([[110, 0, 0.3]], 'sawtooth'); // low buzz
};
