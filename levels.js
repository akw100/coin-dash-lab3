/* global COIN_DASH, CoinDash, Phaser */
// Levels: every coinsPerLevel coins -> banner, +1 drone (away from the player), all drones 10% faster.
// Count coins picked up, not score: combo, bonus coin and double points all inflate the score.
const placeCoinWithoutLevels = CoinDash.prototype.placeCoin;
CoinDash.prototype.placeCoin = function () {
  if (this.coin && this.player && Phaser.Math.Distance.Between(this.coin.x, this.coin.y, this.player.x, this.player.y) < 30) this.coinsTaken = (this.coinsTaken ?? 0) + 1;
  return placeCoinWithoutLevels.apply(this, arguments);
};
const createWithoutLevels = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutLevels.call(this);
  const L = COIN_DASH.levels, c = COIN_DASH;
  this.level = 1;
  this.coinsTaken = 0;
  const font = { font: 'bold 14px monospace', color: '#ffffff' };
  const hud = this.levelHud = this.add.text(c.width / 2, c.height - 8, 'Level 1', font).setOrigin(0.5, 1).setDepth(50);
  this.events.on('update', () => {
    if (this.finished) return;
    if (this.coinsTaken >= this.level * L.coinsPerLevel) {
      this.level++;
      hud.setText(`Level ${this.level}`);
      this.drones.getChildren().forEach(d => d.body.velocity.scale(L.speedUp));
      let x, y;
      do { x = Phaser.Math.Between(40, c.width - 40); y = Phaser.Math.Between(80, c.height - 40); }
      while (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < L.minSpawnDistance);
      const d = this.add.rectangle(x, y, 26, 26, c.colors.drone);
      this.drones.add(d);
      d.body.setCollideWorldBounds(true).setBounce(1, 1);
      const a = Math.random() * Math.PI * 2, v = c.droneSpeed * Math.pow(L.speedUp, this.level - 1);
      d.body.setVelocity(Math.cos(a) * v, Math.sin(a) * v);
      const b = this.add.text(c.width / 2, 110, `Level ${this.level}`,
        { font: 'bold 56px monospace', color: '#ffd166', stroke: '#0a1120', strokeThickness: 6 }).setOrigin(0.5).setDepth(60);
      this.tweens.add({ targets: b, alpha: 0, scale: 1.4, duration: L.bannerMs, onComplete: () => b.destroy() });
    }
  });
};
