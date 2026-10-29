/* global COIN_DASH, CoinDash */
// Logo on the start overlay: a gold coin with speed lines above the title. Follows ui.overlayHidden to fade out
// (kept out of ui.overlay, whose length the ui test counts). The coin spins and bobs, the lines slide.
const createWithoutLogo = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutLogo.call(this);
  if (!this.ui || !this.ui.overlay) return;
  const c = COIN_DASH, l = c.logo, r = l.radius;
  const lines = this.add.graphics(), coin = this.add.graphics();
  for (const [w, col] of [[9, l.edge], [5, l.gold]]) { // dark underlay keeps the lines readable on light backgrounds
    lines.lineStyle(w, col, 1);
    l.lines.forEach((dy, i) => { const len = 70 - i % 2 * 25; lines.lineBetween(-r - 14 - len, dy, -r - 14, dy); });
  }
  coin.fillStyle(l.edge, 1).fillCircle(0, 0, r + 4);
  coin.fillStyle(l.rim, 1).fillCircle(0, 0, r);
  coin.fillStyle(l.gold, 1).fillCircle(0, 0, r - 7);
  coin.lineStyle(3, l.rim, 1).strokeCircle(0, 0, r - 15);
  coin.fillStyle(l.shine, 0.8).fillRect(-4, -14, 8, 28); // bright bar: reads as a coin stamp
  const logo = this.add.container(c.width / 2, l.y, [lines, coin]).setDepth(70);
  const loop = (targets, props) => this.tweens.add({ targets, yoyo: true, repeat: -1, ease: 'Sine.easeInOut', ...props });
  loop(coin, { scaleX: l.spinMin, duration: l.spinMs });
  loop(logo, { y: l.y - l.bob, duration: l.bobMs });
  loop(lines, { x: -l.slide, alpha: 0.6, duration: l.slideMs });
  this.ui.logo = logo;
  const fade = () => {
    if (!this.ui.overlayHidden) return;
    this.events.off('postupdate', fade);
    this.tweens.add({ targets: logo, alpha: 0, duration: 250, onComplete: () => logo.destroy() });
  };
  this.events.on('postupdate', fade);
  this.events.once('shutdown', () => this.events.off('postupdate', fade));
};
