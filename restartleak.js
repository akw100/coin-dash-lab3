/* global CoinDash */
// Restart leak fix: scene.events outlives R, so per-frame listeners that features add in create() would pile up
// with every restart and slow the game down. Any update/postupdate listener added during create() is dropped on shutdown.
// ponytail: wraps create() as loaded so far, so keep this the last feature script; a later feature's create() isn't covered.
const createWithoutLeakFix = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  const names = ['preupdate', 'update', 'postupdate'];
  const before = new Set(names.flatMap(n => this.events.listeners(n)));
  createWithoutLeakFix.apply(this, arguments);
  const added = names.map(n => [n, this.events.listeners(n).filter(fn => !before.has(fn))]);
  this.events.once('shutdown', () => added.forEach(([n, fns]) => fns.forEach(fn => this.events.off(n, fn))));
};
