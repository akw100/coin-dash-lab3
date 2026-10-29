/* global COIN_DASH, CoinDash */
// Help overlay: H shows controls and rules, pauses physics, and pushes the deadline back by the time it was open.
const createWithoutHelp = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutHelp.call(this);
  const c = COIN_DASH, k = c.helpOverlay;
  const box = this.add.container(0, 0).setDepth(1000).setVisible(false);
  box.add([
    this.add.rectangle(c.width / 2, c.height / 2, c.width, c.height, 0x0a1120, k.alpha),
    this.add.text(c.width / 2, c.height / 2, [
      'HELP', '',
      'Move: arrow keys / WASD',
      'Restart: R',
      `Help: ${k.key} (close to resume)`, '',
      `Collect coins. Dodge drones. ${c.roundSeconds}s per round.`
    ].join('\n'), { font: '22px monospace', color: '#ffffff', align: 'center', lineSpacing: 8 }).setOrigin(0.5)
  ]);
  this.helpOverlay = box;
  let openedAt = 0;
  this.input.keyboard.on('keydown-' + k.key, () => {
    if (this.finished) return;
    if (!box.visible) {
      openedAt = this.time.now;
      box.setVisible(true);
      this.physics.pause();
    } else {
      this.deadline += this.time.now - openedAt;
      box.setVisible(false);
      this.physics.resume();
    }
  });
};
