/* global CoinDash, COIN_DASH */
// Sad trombone on a loss (player hit, time out, or bot wins). Muted by M (see sounds.js).
// window.coinDashSound.plays counts played sounds so tests can check without real audio.
const S = COIN_DASH.sound;
// M and the saved setting belong to sounds.js (coin beeps); the sad sound follows its mute state.
const sound = window.coinDashSound = { plays: 0, get muted() { return !!(window.coinDashSounds && window.coinDashSounds.muted); } };
let ctx = null;
const unlock = () => {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch (e) { /* no audio */ }
};
document.addEventListener('keydown', unlock);
document.addEventListener('pointerdown', unlock);

function sadTrombone() {
  if (sound.muted) return;
  sound.plays++;
  if (!ctx || ctx.state !== 'running') return; // ponytail: no gesture yet = silent
  let t = ctx.currentTime + 0.05;
  S.notes.forEach(([hz, len], i) => {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(hz * 1.04, t);
    osc.frequency.exponentialRampToValueAtTime(hz, t + 0.08);
    if (i === S.notes.length - 1) { // last note: slide down and wobble
      osc.frequency.exponentialRampToValueAtTime(hz * 0.94, t + len);
      const lfo = ctx.createOscillator(), depth = ctx.createGain();
      lfo.frequency.value = S.vibratoHz; depth.gain.value = S.vibratoCents;
      lfo.connect(depth); depth.connect(osc.detune);
      lfo.start(t); lfo.stop(t + len);
    }
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(S.volume, t + 0.04);
    gain.gain.setValueAtTime(S.volume, t + len * 0.7);
    gain.gain.linearRampToValueAtTime(0.0001, t + len);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + len);
    t += len;
  });
}
window.coinDashSound.play = sadTrombone;

const finishWithoutSound = CoinDash.prototype.finish;
CoinDash.prototype.finish = function (reason) {
  const wasFinished = this.finished;
  finishWithoutSound.call(this, reason);
  if (wasFinished) return;
  // with the bot on, only a bot win is a loss; without it, every round end is
  if (!this.bot || this.score < this.botScore) sadTrombone();
};
