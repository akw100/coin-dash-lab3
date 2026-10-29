/* global CoinDash */
// Restart safety: the scene's event emitter survives R, so any update/postupdate listener a feature adds
// in create() would keep running against destroyed objects (the intermittent drawImage-of-null crash).
// It wraps create at game boot, after every <script> has loaded, so it is the outermost wrapper and covers
// every feature, including ones listed after this file. It unhooks the listeners create added when the scene shuts down.
(() => {
  const game = window.coinDashGame;
  function wrap() {
    const createWithoutRestartSafe = CoinDash.prototype.create;
    CoinDash.prototype.create = window.coinDashRestartSafe = function () {
      const names = ['update', 'postupdate', 'preupdate'];
      const before = new Map(names.map(n => [n, this.events.listeners(n)]));
      createWithoutRestartSafe.call(this);
      const added = names.flatMap(n => this.events.listeners(n).filter(f => !before.get(n).includes(f)).map(f => [n, f]));
      this.events.once('shutdown', () => added.forEach(([n, f]) => this.events.off(n, f)));
    };
  }
  if (game.isBooted) wrap(); else game.events.once('boot', wrap);
})();
