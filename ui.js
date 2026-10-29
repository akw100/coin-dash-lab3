/* global COIN_DASH, CoinDash */
// UI polish: HUD panels, shadows + outlines, vignette, start banner, end-of-round card. Visuals only.
// Loaded last, so its create() wraps the others and the original HUD text (scene.hud) stays as the hidden source.
const createWithoutUi = CoinDash.prototype.create;
const finishWithoutUi = CoinDash.prototype.finish;
let titleShown = false;
CoinDash.prototype.create = function () {
  createWithoutUi.call(this);
  const c = COIN_DASH, u = c.ui, p = u.panel, font = u.font;
  const pal = () => (this.lightMode ? u.light : u.dark);
  this.hud.setVisible(false); // kept for the test contract / light mode, replaced by the panels below

  if (!this.textures.exists('vignette')) {
    const t = this.textures.createCanvas('vignette', c.width, c.height), g = t.context;
    const r = g.createRadialGradient(c.width / 2, c.height / 2, c.height * 0.35, c.width / 2, c.height / 2, c.width * 0.62);
    r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,0,1)');
    g.fillStyle = r; g.fillRect(0, 0, c.width, c.height); t.refresh();
  }
  this.children.list.find(o => o.type === 'Grid')?.setDepth(-2);
  const vignette = this.add.image(c.width / 2, c.height / 2, 'vignette').setDepth(50);

  // shadows follow the sprites; outlines are strokes on the sprites themselves
  const sprites = [this.player, this.coin, ...this.drones.getChildren()];
  const shadows = sprites.map(s => this.add.ellipse(s.x, s.y, s.width * 1.1, s.height * 0.7, 0x000000, u.shadow.alpha).setDepth(-1));
  sprites.forEach(s => s.setStrokeStyle(2, 0x000000, 0.5));

  const panels = this.add.graphics().setDepth(60);
  const label = (x, s) => this.add.text(x, p.y + 3, s, { fontFamily: font, fontSize: '10px', fontStyle: 'bold' }).setDepth(61);
  const value = (x, o) => this.add.text(x, p.y + 13, '', { fontFamily: font, fontSize: '17px', fontStyle: 'bold' }).setOrigin(o, 0).setDepth(61);
  const scoreX = p.x, timerX = c.width - p.x - p.w;
  const scoreLabel = label(scoreX + 12, 'COINS'), timerLabel = label(timerX + 12, 'TIME');
  const scoreText = value(scoreX + p.w - 12, 1), timerText = value(timerX + p.w - 12, 1);
  let drawnLight = null, lastScore = 0;
  const redraw = () => {
    const k = pal();
    panels.clear().fillStyle(k.panel, k.panelAlpha).lineStyle(1.5, k.stroke, 1);
    for (const x of [scoreX, timerX]) { panels.fillRoundedRect(x, p.y, p.w, p.h, p.radius); panels.strokeRoundedRect(x, p.y, p.w, p.h, p.radius); }
    scoreLabel.setColor(k.label); timerLabel.setColor(k.label);
    scoreText.setColor(k.text);
    vignette.setAlpha(k.vignette);
    sprites.forEach(s => s.setStrokeStyle(2, k.outline, 0.55));
    drawnLight = this.lightMode;
  };
  const tick = () => {
    if (drawnLight !== this.lightMode) redraw();
    const secs = this.finished ? 0 : Math.max(0, Math.ceil((this.deadline - this.time.now) / 1000));
    scoreText.setText(`${this.score}`);
    if (!this.finished) timerText.setText(`${secs}s`);
    timerText.setColor(secs <= u.urgentSeconds ? u.urgent : pal().text);
    if (this.score > lastScore) this.tweens.add({ targets: scoreText, scale: 1.3, duration: 120, yoyo: true });
    lastScore = this.score;
    sprites.forEach((s, i) => shadows[i].setPosition(s.x + u.shadow.dx, s.y + u.shadow.dy).setScale(s.scale));
  };
  this.events.on('postupdate', tick); // scene events survive R, so drop it on shutdown
  this.events.once('shutdown', () => this.events.off('postupdate', tick));
  redraw(); tick();
  this.ui = { panels, scoreText, timerText, vignette, shadows };

  if (!titleShown) {
    titleShown = true;
    const k = pal();
    const title = this.add.text(c.width / 2, c.height / 2 - 30, 'COIN DASH', { fontFamily: font, fontSize: '56px', fontStyle: 'bold', color: k.text,
      stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5).setDepth(70);
    const sub = this.add.text(c.width / 2, c.height / 2 + 22, `Collect coins · dodge drones · ${c.roundSeconds}s`,
      { fontFamily: font, fontSize: '18px', color: k.label }).setOrigin(0.5).setDepth(70);
    this.tweens.add({ targets: [title, sub], alpha: 0, delay: u.titleMs, duration: 600, onComplete: () => { title.destroy(); sub.destroy(); } });
  }
};
CoinDash.prototype.finish = function (reason) {
  const wasFinished = this.finished, before = this.children.list.length;
  finishWithoutUi.call(this, reason);
  if (wasFinished) return;
  this.children.list.slice(before).forEach(o => o.setVisible(false)); // the plain box + text from game.js
  const c = COIN_DASH, u = c.ui, k = this.lightMode ? u.light : u.dark, cx = c.width / 2, cy = c.height / 2;
  const card = this.add.graphics().setDepth(100).fillStyle(k.panel, 0.94).lineStyle(2, k.stroke, 1);
  card.fillRoundedRect(cx - 190, cy - 100, 380, 200, 18).strokeRoundedRect(cx - 190, cy - 100, 380, 200, 18);
  const t = (y, s, size, color) => this.add.text(cx, y, s, { fontFamily: u.font, fontSize: `${size}px`, fontStyle: size > 20 ? 'bold' : 'normal', color, align: 'center' }).setOrigin(0.5).setDepth(101);
  t(cy - 70, reason, 22, k.text); t(cy - 15, `${this.score}`, 64, '#ffd166'); t(cy + 30, this.score === 1 ? 'coin collected' : 'coins collected', 18, k.label);
  t(cy + 70, 'Press R to play again', 16, k.text);
};
