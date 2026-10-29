/* global CoinDash */
// Restart safety: the scene's event emitter survives R, so any update/postupdate listener a feature adds
// in create() would keep running against destroyed objects (the intermittent drawImage-of-null crash).
// Loaded last, this wraps every feature's create and unhooks the listeners it added when the scene shuts down.
const createWithoutRestartSafe = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  const names = ['update', 'postupdate', 'preupdate'];
  const before = new Map(names.map(n => [n, this.events.listeners(n)]));
  createWithoutRestartSafe.call(this);
  const added = names.flatMap(n => this.events.listeners(n).filter(f => !before.get(n).includes(f)).map(f => [n, f]));
  this.events.once('shutdown', () => added.forEach(([n, f]) => this.events.off(n, f)));
};
