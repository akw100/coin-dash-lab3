/* global Phaser, COIN_DASH, CoinDash */
// Two-player mode: V toggles (restarts). P1 = WASD, P2 (orange) = arrow keys, separate scores.
// A drone hit eliminates only that player; the round ends when both are out or time is up.
const createWithoutTwo = CoinDash.prototype.create;
const updateWithoutTwo = CoinDash.prototype.update;
const finishWithoutTwo = CoinDash.prototype.finish;
let twoOn = false; // survives R
CoinDash.prototype.create = function () {
  createWithoutTwo.call(this);
  const t = COIN_DASH.twoPlayer;
  this.twoPlayer = twoOn;
  this.input.keyboard.on('keydown-' + t.key, () => { twoOn = !twoOn; this.scene.restart(); });
  if (!twoOn) return;
  this.score2 = 0;
  this.out = [false, false];
  this.player.setPosition(COIN_DASH.width / 3, COIN_DASH.height / 2);
  this.player2 = this.add.rectangle(COIN_DASH.width * 2 / 3, COIN_DASH.height / 2, 24, 24, t.color);
  this.physics.add.existing(this.player2);
  this.player2.body.setCollideWorldBounds(true);
  this.hud2 = this.add.text(18, 46, '', { font: '16px monospace', color: '#ffffff' }).setDepth(50);
  this.physics.add.overlap(this.player2, this.coin, () => {
    if (this.finished || this.out[1]) return;
    this.score2++;
    this.placeCoin();
  });
  [this.player, this.player2].forEach((p, i) => this.physics.add.overlap(p, this.drones, () => {
    if (this.finished || this.out[i]) return;
    this.out[i] = true;
    p.setVisible(false).body.enable = false;
    if (this.out[0] && this.out[1]) { this.halfMode = false; this.finish('Both players are out!'); }
  }));
};
CoinDash.prototype.update = function () {
  updateWithoutTwo.call(this);
  if (!this.twoPlayer || this.finished) return;
  const k = this.keys, c = this.cursors, v = COIN_DASH.playerSpeed;
  const drive = (p, l, r, u, d) => p.body.setVelocity(
    (Number(r.isDown) - Number(l.isDown)) * v, (Number(d.isDown) - Number(u.isDown)) * v);
  drive(this.player, k.A, k.D, k.W, k.S);
  drive(this.player2, c.left, c.right, c.up, c.down);
  this.hud2.setText(`P1 (WASD): ${this.score}   P2 (arrows): ${this.score2}`);
};
CoinDash.prototype.finish = function (reason) {
  if (this.twoPlayer && !this.finished) {
    if (reason === 'A drone caught you!') return; // handled per player in create()
    reason += `\nP1 ${this.score} · P2 ${this.score2}`;
  }
  finishWithoutTwo.call(this, reason);
};
