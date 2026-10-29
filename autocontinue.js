/* global COIN_DASH, CoinDash */
// Auto-continue: with the option on, a finished round counts down and restarts by itself; any key skips the wait.
const createWithoutAuto = CoinDash.prototype.create;
const finishWithoutAuto = CoinDash.prototype.finish;
const autoStore = {
  get: () => { try { return localStorage.getItem(COIN_DASH.autoContinue.storageKey) === '1'; } catch (e) { return false; } },
  set: v => { try { localStorage.setItem(COIN_DASH.autoContinue.storageKey, v ? '1' : '0'); } catch (e) { /* ignore */ } }
};
CoinDash.prototype.create = function () {
  createWithoutAuto.call(this);
  const k = COIN_DASH.autoContinue;
  this.autoContinue = autoStore.get();
  this.autoContinueText = null;
  const badge = this.add.text(COIN_DASH.width - 12, COIN_DASH.height - 10, '', { font: '14px monospace', color: '#8fa3bf' })
    .setOrigin(1, 1).setDepth(50);
  const refresh = () => badge.setText(`Auto-continue (${k.key}): ${this.autoContinue ? 'ON' : 'OFF'}`);
  refresh();
  this.input.keyboard.on('keydown', e => {
    if (e.key.toUpperCase() === k.key) {
      this.autoContinue = !this.autoContinue;
      autoStore.set(this.autoContinue);
      refresh();
      if (!this.autoContinue && this.autoContinueText) { // cancel a running countdown
        this.autoContinueText.destroy(); this.autoContinueText = null;
        if (this.autoContinueTimer) this.autoContinueTimer.remove();
      }
    } else if (this.autoContinueText && e.key.toUpperCase() !== 'R') this.scene.restart(); // R restarts on its own
  });
};
CoinDash.prototype.finish = function (reason) {
  const wasFinished = this.finished;
  finishWithoutAuto.call(this, reason);
  if (wasFinished || !this.autoContinue) return;
  const k = COIN_DASH.autoContinue;
  let left = k.seconds;
  const txt = this.autoContinueText = this.add.text(COIN_DASH.width / 2, COIN_DASH.height - 60,
    '', { font: '20px monospace', color: '#ffd84d' }).setOrigin(0.5).setDepth(60);
  const show = () => txt.setText(`Next game in ${left}…  (any key to start now)`);
  show();
  this.autoContinueTimer = this.time.addEvent({ delay: 1000, repeat: k.seconds - 1, callback: () => {
    if (--left > 0) show(); else this.scene.restart();
  } });
};
