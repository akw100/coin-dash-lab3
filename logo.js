/* global COIN_DASH, CoinDash */
// Logo on the start overlay: a gold coin with speed lines above the title. Follows ui.overlayHidden to fade out
// (kept out of ui.overlay, whose length the ui test counts).
const createWithoutLogo = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutLogo.call(this);
  const overlay = this.ui && this.ui.overlay;
  if (!overlay) return;
  const c = COIN_DASH, l = c.logo, r = l.radius, cx = c.width / 2, cy = l.y;
  const g = this.add.graphics().setDepth(70);
  for (const [w, col] of [[9, l.edge], [5, l.gold]]) { // dark underlay keeps the lines readable on light backgrounds
    g.lineStyle(w, col, 1);
    l.lines.forEach((dy, i) => { const len = 70 - i % 2 * 25; g.lineBetween(cx - r - 14 - len, cy + dy, cx - r - 14, cy + dy); });
  }
  g.fillStyle(l.edge, 1).fillCircle(cx, cy, r + 4);
  g.fillStyle(l.rim, 1).fillCircle(cx, cy, r);
  g.fillStyle(l.gold, 1).fillCircle(cx, cy, r - 7);
  g.lineStyle(3, l.rim, 1).strokeCircle(cx, cy, r - 15);
  g.fillStyle(l.shine, 0.8).fillRect(cx - 4, cy - 14, 8, 28); // bright bar: reads as a coin stamp
  this.ui.logo = g;
  const fade = () => {
    if (!this.ui.overlayHidden) return;
    this.events.off('postupdate', fade);
    this.tweens.add({ targets: g, alpha: 0, duration: 250, onComplete: () => g.destroy() });
  };
  this.events.on('postupdate', fade);
  this.events.once('shutdown', () => this.events.off('postupdate', fade));
};
