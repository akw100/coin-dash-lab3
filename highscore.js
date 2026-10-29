/* global CoinDash, COIN_DASH */
// High score: the best score across reloads, kept in localStorage. Shows "Best: N" in the HUD next to
// the coin count and raises it at the end of a round that beats it. Wraps the scene instead of editing game.js.
(() => {
  const key = COIN_DASH.highScoreKey || 'coinDash.best';
  const load = () => { try { return Math.max(0, Number(localStorage.getItem(key)) || 0); } catch { return 0; } };
  const save = n => { try { localStorage.setItem(key, String(n)); } catch { /* storage blocked: keep it for this page only */ } };
  const { create, finish } = CoinDash.prototype;

  CoinDash.prototype.create = function () {
    create.call(this);
    this.best = load();
    // The HUD is one text line: slip "Best: N" in right after the coin count whenever it is set.
    const hud = this.hud, setText = hud.setText;
    hud.setText = text => setText.call(hud,
      String(text).replace(/^(Coins: \d+)(?:\s+Best: \d+)?/, `$1   Best: ${this.best}`));
  };

  CoinDash.prototype.finish = function (reason) {
    const wasFinished = this.finished;
    finish.call(this, reason);
    if (wasFinished || !this.finished || this.score <= this.best) return;
    this.best = this.score;
    save(this.best);
    this.hud.setText(this.hud.text); // update() has stopped, so refresh the HUD here
    const c = COIN_DASH;
    this.add.text(c.width / 2, c.height / 2 - 95, 'New best!',
      { font: '22px monospace', color: '#ffd166' }).setOrigin(0.5);
  };
})();
