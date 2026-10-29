/* global Phaser, COIN_DASH, CoinDash */
// Bot rival: B toggles a second, orange player that chases the coin. Shares the coin with the human;
// scores separately (scene.botScore, scene.score stays the human's). A drone hit stuns the bot instead of
// ending the round. The round-end panel says who won. Stays on across R.
COIN_DASH.bot = { key: 'B', speed: 190, reactionMs: 350, aimError: 45, stunMs: 2000, color: 0xff9f43 };
let botOn = false;
const createWithoutBot = CoinDash.prototype.create;
const finishWithoutBot = CoinDash.prototype.finish;
CoinDash.prototype.create = function () {
  createWithoutBot.call(this);
  const b = COIN_DASH.bot;
  this.botScore = 0;
  this.bot = null;
  const hud = this.add.text(COIN_DASH.width - 18, COIN_DASH.height - 8, '', { font: '18px monospace', color: '#ff9f43' }).setOrigin(1, 1);
  let target = null, nextAim = 0, stunnedUntil = 0;
  const spawn = () => {
    const bot = this.bot = this.add.rectangle(60, COIN_DASH.height - 60, 24, 24, b.color);
    this.physics.add.existing(bot);
    bot.body.setCollideWorldBounds(true);
    this.physics.add.overlap(bot, this.coin, () => {
      if (this.finished) return;
      this.botScore++;
      this.placeCoin();
    });
    this.physics.add.overlap(bot, this.drones, () => {
      if (!this.finished && this.time.now > stunnedUntil + 500) stunnedUntil = this.time.now + b.stunMs; // ponytail: no dodging, a hit just stuns
    });
  };
  const toggle = () => {
    botOn = !botOn;
    if (botOn && !this.bot) spawn();
    else if (!botOn && this.bot) { this.bot.destroy(); this.bot = null; this.botScore = 0; }
  };
  this.input.keyboard.on('keydown-' + b.key, toggle);
  if (botOn) spawn();
  this.events.on('update', () => {
    hud.setText(this.bot ? `Bot: ${this.botScore}` : '');
    if (!this.bot || this.finished) return;
    const bot = this.bot, now = this.time.now;
    bot.alpha = now < stunnedUntil ? 0.4 : 1;
    if (now < stunnedUntil) { bot.body.setVelocity(0, 0); return; }
    if (now >= nextAim) { // look at the coin only every reactionMs, and aim a bit off, so the bot can be beaten
      nextAim = now + b.reactionMs;
      target = { x: this.coin.x + Phaser.Math.Between(-b.aimError, b.aimError), y: this.coin.y + Phaser.Math.Between(-b.aimError, b.aimError) };
    }
    const v = new Phaser.Math.Vector2(target.x - bot.x, target.y - bot.y);
    if (v.length() > 4) v.normalize().scale(b.speed);
    bot.body.setVelocity(v.x, v.y);
  });
};
CoinDash.prototype.finish = function (reason) {
  const wasFinished = this.finished;
  finishWithoutBot.call(this, reason);
  if (wasFinished || !this.bot) return;
  const verdict = this.score > this.botScore ? 'You win!' : this.score < this.botScore ? 'The bot wins!' : 'Tie!';
  this.add.text(COIN_DASH.width / 2, COIN_DASH.height / 2 + 100, `You ${this.score} – Bot ${this.botScore}: ${verdict}`,
    { font: 'bold 22px monospace', color: '#ff9f43' }).setOrigin(0.5);
};
