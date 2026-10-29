/* global COIN_DASH, CoinDash, Phaser */
// Board-game makeover: the arena is a printed game board, the HUD panels are playing cards, the coin is a gold
// token, the start title sits on a box-art starburst and the end card gets a ribbon and confetti. Visuals only.
(() => {
const b = COIN_DASH.board;
Object.assign(COIN_DASH.ui, { font: b.font, shadow: { dx: 4, dy: 6, alpha: 0.35 } });
Object.assign(COIN_DASH.ui.dark, { panel: 0xffffff, panelAlpha: 1, stroke: b.ink, text: '#1a1446', label: '#6b5fb0', outline: b.ink, vignette: 0.3 });
Object.assign(COIN_DASH.ui.light, { panel: 0xffffff, panelAlpha: 1, stroke: b.ink, text: '#1a1446', label: '#6b5fb0', outline: b.ink });
COIN_DASH.ui.timer.dark = { amber: '#c25e00', red: '#e0182d' };

// every feature's monospace text switches to the board font with an ink outline, so it reads on the board
const addText = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style) {
  const st = style ? { ...style } : style, font = st && (st.font || st.fontFamily);
  if (typeof font === 'string' && font.includes('monospace')) {
    const m = st.font && st.font.match(/(bold\s+)?(\d+px)/);
    if (m) { st.fontSize = m[2]; if (m[1]) st.fontStyle = 'bold'; }
    delete st.font; st.fontFamily = b.font;
    if (!st.stroke) Object.assign(st, { stroke: '#1a1446', strokeThickness: 4 });
  }
  return addText.call(this, x, y, text, st);
};

function drawBoard(scene, key, p) {
  const c = COIN_DASH, s = b.square, tk = b.track, top = 44;
  const t = scene.textures.createCanvas(key, c.width, c.height), g = t.context;
  g.fillStyle = p.base; g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = p.check;
  for (let y = top; y < c.height; y += s) for (let x = 0; x < c.width; x += s) if ((x + y - top) / s % 2) g.fillRect(x, y, s, s);
  g.save(); g.translate(c.width / 2, c.height / 2 + top / 2); g.rotate(-0.12); // centre art printed on the board
  g.fillStyle = p.emblem; g.font = `900 104px ${b.font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('COIN DASH', 0, 0); g.restore();
  // the coloured track round the board's edge, one square per grid cell
  const cells = [];
  for (let x = 0; x < c.width; x += s) cells.push([x, top, s, tk], [x, c.height - tk, s, tk]);
  for (let y = top; y < c.height; y += s) cells.push([0, y, tk, s], [c.width - tk, y, tk, s]);
  cells.forEach(([x, y, w, h], i) => { g.fillStyle = b.trackColors[(i >> 1) % b.trackColors.length]; g.fillRect(x, y, w, h); });
  g.strokeStyle = '#1a1446'; g.lineWidth = 3; g.strokeRect(tk, top + tk, c.width - 2 * tk, c.height - top - 2 * tk);
  g.fillStyle = '#1a1446'; g.fillRect(0, 0, c.width, top); // lid strip behind the HUD cards
  t.refresh();
}

function drawCard(g, x, y, w, h, pip) {
  g.fillStyle(0x000000, 0.3).fillRoundedRect(x + 2, y + 4, w, h, 7);
  g.fillStyle(0xffffff, 1).fillRoundedRect(x, y, w, h, 7).lineStyle(2.5, b.ink, 1).strokeRoundedRect(x, y, w, h, 7);
  g.lineStyle(1, pip.color, 0.6).strokeRoundedRect(x + 4, y + 4, w - 8, h - 8, 4);
  const px = x + 17, py = y + h / 2;
  g.fillStyle(pip.color, 1).lineStyle(1.5, b.ink, 1);
  if (pip.shape === 'diamond') g.fillPoints([{ x: px, y: py - 9 }, { x: px + 7, y: py }, { x: px, y: py + 9 }, { x: px - 7, y: py }], true).strokePoints([{ x: px, y: py - 9 }, { x: px + 7, y: py }, { x: px, y: py + 9 }, { x: px - 7, y: py }], true);
  else g.fillTriangle(px - 6, py - 9, px + 6, py - 9, px, py).fillTriangle(px - 6, py + 9, px + 6, py + 9, px, py)
    .strokeTriangle(px - 6, py - 9, px + 6, py - 9, px, py).strokeTriangle(px - 6, py + 9, px + 6, py + 9, px, py);
}

const createWithoutBoard = CoinDash.prototype.create;
CoinDash.prototype.create = function () {
  createWithoutBoard.call(this);
  const c = COIN_DASH, u = c.ui, p = u.panel;
  if (!this.textures.exists('board-dark')) { drawBoard(this, 'board-dark', b.dark); drawBoard(this, 'board-light', b.light); }
  const board = this.add.image(c.width / 2, c.height / 2, 'board-dark').setDepth(-1.5);

  // playing-card HUD: ui.js keeps its texts, its flat panels hide under the cards; labels shift right of the pip
  const cards = this.add.graphics().setDepth(60.5);
  if (this.ui) {
    this.ui.panels.setVisible(false);
    this.children.list.filter(o => o.type === 'Text' && (o.text === 'COINS' || o.text === 'TIME')).forEach(o => o.setX(o.x + 18).setDepth(61));
    drawCard(cards, p.x, p.y, p.w, p.h, { shape: 'diamond', color: b.pips.coins });
    drawCard(cards, c.width - p.x - p.w, p.y, p.w, p.h, { shape: 'hourglass', color: b.pips.time });
  }

  // the coin as a chunky gold token, mirroring the hitbox's position, alpha (coin hop blink) and scale
  const token = this.add.graphics().setDepth(this.coin.depth + 0.5);
  token.fillStyle(b.ink, 1).fillCircle(0, 0, 13).fillStyle(b.goldRim, 1).fillCircle(0, 0, 11)
    .fillStyle(b.gold, 1).fillCircle(0, 0, 8).lineStyle(1.5, b.goldRim, 1).strokeCircle(0, 0, 5)
    .fillStyle(0xffffff, 0.75).fillRect(-1.5, -5, 3, 10);

  let mode;
  const tick = () => {
    const m = this.neonMode ? 'neon' : this.lightMode ? 'light' : 'dark';
    if (m !== mode) { mode = m; board.setVisible(m !== 'neon'); if (m !== 'neon') board.setTexture(`board-${m}`); }
    token.setPosition(this.coin.x, this.coin.y).setAlpha(this.coin.alpha).setScale(this.coin.scale)
      .setVisible(this.coin.visible && m !== 'neon');
  };
  this.events.on('postupdate', tick);
  this.events.once('shutdown', () => this.events.off('postupdate', tick));
  tick();
  this.board = { board, cards, token };

  // box-lid title: yellow lettering on a turning starburst with a ribbon under it; fades with the overlay
  if (this.ui && this.ui.overlay && !this.ui.overlayHidden) {
    const [title, sub] = this.ui.overlay, cx = c.width / 2;
    title.setStyle({ fontFamily: b.font, fontSize: '76px', fontStyle: 'bold', color: '#ffc928', stroke: '#1a1446', strokeThickness: 12 })
      .setShadow(0, 8, '#1a1446', 0, true, true).setAngle(-3);
    sub.setStyle({ fontFamily: b.font, fontSize: '18px', fontStyle: 'bold', color: '#ffffff' }).setY(sub.y + 26);
    const pts = [];
    for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, r = i % 2 ? 0.8 : 1; pts.push({ x: Math.cos(a) * 250 * r, y: Math.sin(a) * 110 * r }); }
    const burst = this.add.graphics({ x: cx, y: title.y }).setDepth(69).fillStyle(b.burst, 1).fillPoints(pts, true).lineStyle(5, b.ink, 1).strokePoints(pts, true);
    const rw = sub.width + 40, ribbon = this.add.graphics({ x: cx, y: sub.y }).setDepth(69.5)
      .fillStyle(b.ink, 1).fillRoundedRect(-rw / 2, -16, rw, 32, 16).lineStyle(3, 0xffc928, 1).strokeRoundedRect(-rw / 2, -16, rw, 32, 16);
    this.tweens.add({ targets: burst, angle: 360, duration: 24000, repeat: -1 });
    this.tweens.add({ targets: burst, scale: 1.06, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const fade = () => {
      if (!this.ui.overlayHidden) return;
      this.events.off('postupdate', fade);
      this.tweens.add({ targets: [burst, ribbon], alpha: 0, duration: 250, onComplete: () => { burst.destroy(); ribbon.destroy(); } });
    };
    this.events.on('postupdate', fade);
    this.events.once('shutdown', () => this.events.off('postupdate', fade));
  }
};

const finishWithoutBoard = CoinDash.prototype.finish;
CoinDash.prototype.finish = function (reason) {
  const wasFinished = this.finished, before = this.children.list.length;
  finishWithoutBoard.call(this, reason);
  if (wasFinished) return;
  const c = COIN_DASH, cx = c.width / 2, cy = c.height / 2;
  const added = this.children.list.slice(before).filter(o => o.type === 'Text' && o.visible);
  const big = added.find(o => o.text === `${this.score}` && parseInt(o.style.fontSize, 10) >= 60);
  if (big) big.setColor('#ffc928').setStroke('#1a1446', 10).setShadow(0, 5, '#1a1446', 0, true, true);
  // score-pad ribbon across the card's top edge
  const ribbon = this.add.graphics().setDepth(100.5).fillStyle(b.burst, 1).fillRoundedRect(cx - 120, cy - 126, 240, 34, 8)
    .lineStyle(3, b.ink, 1).strokeRoundedRect(cx - 120, cy - 126, 240, 34, 8);
  const label = this.add.text(cx, cy - 109, 'FINAL SCORE', { fontFamily: b.font, fontSize: '17px', fontStyle: 'bold', color: '#ffffff' })
    .setOrigin(0.5).setDepth(101);
  this.board.end = [ribbon, label];
  if (this.score <= 0) return;
  // confetti in the track colours, only when there is something to celebrate
  for (let i = 0; i < b.confetti; i++) {
    const col = Phaser.Display.Color.HexStringToColor(b.trackColors[i % b.trackColors.length]).color;
    const bit = this.add.rectangle(Phaser.Math.Between(20, c.width - 20), -10, 8, 13, col).setDepth(102).setAngle(Phaser.Math.Between(0, 180));
    this.tweens.add({ targets: bit, y: c.height + 20, x: bit.x + Phaser.Math.Between(-60, 60), angle: bit.angle + Phaser.Math.Between(180, 540),
      duration: Phaser.Math.Between(1200, 2200), delay: Phaser.Math.Between(0, 400), ease: 'Quad.easeIn', onComplete: () => bit.destroy() });
  }
};
})();
