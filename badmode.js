/* global COIN_DASH, CoinDash, Phaser */
// Bad experience mode: X opts in (survives R). Ten annoyances, inspired by User Inyerface and dark patterns:
// 1 input lag, 2 inverted controls, 3 upside-down screen, 4 fake "buffering" freezes (the timer keeps going),
// 5 a shy coin that runs away, 6 decoy coins, 7 pop-up ads with a fleeing ×, 8 fake game-over screens,
// 9 a mosquito beep, 10 confirmshaming: leaving needs X pressed several times.
const createWithoutBad = CoinDash.prototype.create;
let badOn = false;
const badSfx = { ctx: null };
function mosquito() {
  if (window.coinDashSounds && window.coinDashSounds.muted) return; // M still works, we're not monsters
  try {
    const ctx = badSfx.ctx = badSfx.ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime;
    o.frequency.setValueAtTime(7000, t0);
    g.gain.setValueAtTime(0.04, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
    o.connect(g).connect(ctx.destination); o.start(t0); o.stop(t0 + 0.4);
  } catch (e) { /* no audio available */ }
}
CoinDash.prototype.create = function () {
  createWithoutBad.call(this);
  const b = COIN_DASH.badMode, c = COIN_DASH, cam = this.cameras.main;
  const font = '"Comic Sans MS", "Comic Sans", cursive';
  this.badMode = badOn;
  this.badInverted = false;
  const lag = [];
  let exitCount = 0, exitTimer = null, wasNear = false;
  const badge = this.add.text(c.width / 2, c.height - 8, '', { font: '13px monospace', color: '#ff9ff3' })
    .setOrigin(0.5, 1).setDepth(60).setScrollFactor(0);
  const refresh = () => badge.setText(badOn ? '😈 BAD MODE (X to leave)' : 'X: bad experience mode');
  refresh();
  const popup = (msg, ms, size = 22) => {
    const p = this.add.text(c.width / 2, c.height / 2 - 80, msg, { font: `bold ${size}px ${font}`, color: '#ff00ff',
      backgroundColor: '#ffff00', padding: { x: 10, y: 6 }, align: 'center' }).setOrigin(0.5).setDepth(90);
    this.time.delayedCall(ms, () => p.destroy());
  };

  // 10: confirmshaming. Turning it on is one key; leaving takes exitPresses presses in a row.
  this.input.keyboard.on('keydown-' + b.key, () => {
    if (!badOn) { badOn = this.badMode = true; refresh(); popup('Bad mode ON. Good luck 😈', 1500); return; }
    exitCount++;
    if (exitTimer) exitTimer.remove();
    exitTimer = this.time.delayedCall(2000, () => { exitCount = 0; });
    if (exitCount < b.exitPresses) { popup(`Leaving already? Quitters press X ${b.exitPresses - exitCount} more time(s)`, 1200, 18); return; }
    exitCount = 0;
    badOn = this.badMode = this.badInverted = false;
    cam.setRotation(0); refresh();
  });

  const active = () => this.badMode && !this.finished && !this.paused;
  const every = (ms, fn) => this.time.addEvent({ delay: ms, loop: true,
    callback: () => { if (active()) fn(); } });

  // 2: inverted controls, with a warning that shows up after it starts.
  every(b.invertEveryMs, () => {
    this.badInverted = true;
    this.time.delayedCall(600, () => this.badInverted && popup('controls inverted lol', 900, 16));
    this.time.delayedCall(b.invertMs, () => { this.badInverted = false; });
  });
  // 3: upside-down screen.
  every(b.flipEveryMs, () => {
    cam.setRotation(Math.PI);
    this.time.delayedCall(b.flipMs, () => cam.setRotation(0));
  });
  // 4: fake lag spike. Physics stops, the clock doesn't.
  every(b.freezeEveryMs, () => {
    this.physics.pause();
    const t = this.add.text(c.width / 2, c.height / 2, 'Buffering… ⏳', { font: `28px ${font}`, color: '#ffffff',
      backgroundColor: '#000000' }).setOrigin(0.5).setDepth(90);
    // ponytail: assumes nothing else paused physics during these 700ms (P is guarded via this.paused)
    this.time.delayedCall(b.freezeMs, () => { t.destroy(); if (!this.finished && !this.paused) this.physics.resume(); });
  });
  // 7: pop-up ad that blocks the view; the × runs away twice before it can be clicked.
  every(b.adEveryMs, () => {
    const x = Phaser.Math.Between(170, c.width - 170), y = Phaser.Math.Between(120, c.height - 120);
    const box = this.add.rectangle(x, y, 300, 160, 0xffffff).setStrokeStyle(4, 0xff0000).setDepth(80);
    const txt = this.add.text(x, y, '🎉 CONGRATULATIONS 🎉\nYou are visitor #1,000,000!\nYou WON a free iPhone*\n\n*not really',
      { font: `16px ${font}`, color: '#ff0000', align: 'center' }).setOrigin(0.5).setDepth(81);
    const close = this.add.text(x + 138, y - 70, '×', { font: '14px monospace', color: '#999999' })
      .setOrigin(0.5).setDepth(82).setInteractive();
    let dodges = 2;
    const done = () => [box, txt, close].forEach(o => o.destroy());
    close.on('pointerover', () => { if (dodges-- > 0) close.setPosition(x + Phaser.Math.Between(-140, 140), y + Phaser.Math.Between(-70, 70)); });
    close.on('pointerdown', done);
    this.time.delayedCall(b.adMs, () => box.active && done());
  });
  // 8: fake game over. Looks just like the real one, but the round goes on.
  every(b.fakeOverEveryMs, () => {
    const bg = this.add.rectangle(c.width / 2, c.height / 2, 460, 150, 0x0a1120, 0.95).setDepth(85);
    const t = this.add.text(c.width / 2, c.height / 2, `A drone caught you!\n${this.score} coins collected\nPress R to try again`,
      { font: '24px monospace', color: '#ffffff', align: 'center', lineSpacing: 12 }).setOrigin(0.5).setDepth(86);
    this.time.delayedCall(b.fakeOverMs, () => { t.setText('jk 😜 keep going'); });
    this.time.delayedCall(b.fakeOverMs + 600, () => { bg.destroy(); t.destroy(); });
  });
  // 9: mosquito beep.
  every(b.beepEveryMs, mosquito);

  // 6: decoy coins, same colour as the real one, worth nothing.
  const decoys = [];
  for (let i = 0; i < b.decoys; i++) {
    decoys.push(this.add.circle(Phaser.Math.Between(25, c.width - 25), Phaser.Math.Between(70, c.height - 25), 9, c.colors.coin).setVisible(false));
  }
  const moveAway = o => o.setPosition(Phaser.Math.Between(25, c.width - 25), Phaser.Math.Between(70, c.height - 25));

  this.events.on('postupdate', () => {
    decoys.forEach(d => d.setVisible(this.badMode && !this.finished).setFillStyle(this.coin.fillColor));
    if (!active()) { lag.length = 0; return; }
    const p = this.player;
    // 1 + 2: velocity from lagFrames ago, flipped while inverted.
    lag.push({ x: p.body.velocity.x, y: p.body.velocity.y });
    const v = lag.length > b.lagFrames ? lag.shift() : { x: 0, y: 0 };
    const k = this.badInverted ? -1 : 1;
    p.body.setVelocity(v.x * k, v.y * k);
    // 5: shy coin. Half the time it jumps away as you get close.
    const near = Phaser.Math.Distance.Between(p.x, p.y, this.coin.x, this.coin.y) < b.shyRadius;
    if (near && !wasNear && Math.random() < b.shyChance) this.placeCoin();
    wasNear = near;
    decoys.forEach(d => {
      if (Phaser.Math.Distance.Between(p.x, p.y, d.x, d.y) > 20) return;
      const t = this.add.text(d.x, d.y - 10, 'fake lol', { font: `bold 18px ${font}`, color: '#ff9ff3' }).setOrigin(0.5).setDepth(50);
      this.tweens.add({ targets: t, y: t.y - 40, alpha: 0, duration: 800, onComplete: () => t.destroy() });
      moveAway(d);
    });
  });
};
