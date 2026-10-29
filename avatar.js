/* global Phaser, COIN_DASH */
// Avatar wardrobe: a panel under the game picks the player's body, colour, face, hat and aura; C rolls a random one.
// The player rectangle stays the hitbox (made see-through); a Graphics drawn every frame on top of it is the avatar.
(() => {
  const game = window.coinDashGame;
  const cfg = COIN_DASH.avatar;
  const look = { ...cfg.default };
  try { Object.assign(look, JSON.parse(localStorage.getItem(cfg.storageKey)) || {}); } catch (e) { /* storage blocked: defaults */ }
  const hue = (h, s = 1, v = 1) => Phaser.Display.Color.HSVToRGB(((h % 1) + 1) % 1, s, v).color;

  function colour(scene, t) {
    if (look.color === 'theme') return scene.player.fillColor;
    if (look.color === 'rainbow') return hue(t / 2000);
    if (look.color === 'disco') return hue(Math.floor(t / 110) * 0.37, 0.85);
    return cfg.colors[look.color];
  }

  function drawBody(g, c, t) {
    g.fillStyle(c, 1).lineStyle(2, 0x000000, 0.45);
    if (look.body === 'cube') { g.fillRoundedRect(-12, -12, 24, 24, 5).strokeRoundedRect(-12, -12, 24, 24, 5); return; }
    if (look.body === 'blob' || look.body === 'star') {
      const n = look.body === 'blob' ? 18 : 10, pts = [];
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2 - Math.PI / 2;
        const r = look.body === 'blob' ? 13 + Math.sin(t / 140 + i * 1.7) * 1.8 : (i % 2 ? 7.5 : 16);
        pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }
      g.fillPoints(pts, true).strokePoints(pts, true);
      return;
    }
    if (look.body === 'ghost') {
      g.fillCircle(0, -2, 12).fillRect(-12, -2, 24, 11);
      for (let i = 0; i < 4; i++) g.fillCircle(-9 + i * 6, 9 + Math.sin(t / 120 + i) * 1.5, 3);
      g.beginPath().arc(0, -2, 12, Math.PI, 0).strokePath();
      return;
    }
    if (look.body === 'ufo') {
      g.fillStyle(0xbfe9ff, 0.85).fillCircle(0, -3, 9);
      g.fillStyle(c, 1).fillEllipse(0, 4, 34, 12).strokeEllipse(0, 4, 34, 12);
      for (let i = 0; i < 5; i++) g.fillStyle(Math.floor(t / 150 + i) % 2 ? 0xffffff : 0xffe14d, 1).fillCircle(-12 + i * 6, 5, 1.6);
      return;
    }
    // cat
    g.fillTriangle(-12, -4, -11, -17, -2, -10).fillTriangle(12, -4, 11, -17, 2, -10);
    g.fillCircle(0, 0, 12).strokeCircle(0, 0, 12);
    g.lineStyle(1, 0x000000, 0.6).lineBetween(-14, 4, -7, 3).lineBetween(14, 4, 7, 3).lineBetween(-14, 7, -7, 5).lineBetween(14, 7, 7, 5);
  }

  function drawFace(g, lx, ly, t) {
    const y = look.body === 'ufo' ? -4 : -2;
    const eye = (x, r, px = lx, py = ly) => {
      g.fillStyle(0xffffff, 1).fillCircle(x, y, r);
      g.fillStyle(0x111111, 1).fillCircle(x + px * r * 0.4, y + py * r * 0.4, r * 0.5);
    };
    g.lineStyle(1.6, 0x111111, 1);
    if (look.face === 'shades') {
      g.fillStyle(0x111111, 1).fillRect(-10, y - 3, 20, 3).fillRoundedRect(-10, y - 2, 8, 6, 2).fillRoundedRect(2, y - 2, 8, 6, 2);
      g.fillStyle(0xffffff, 0.8).fillRect(-8, y - 1, 2, 1.5).fillRect(4, y - 1, 2, 1.5);
      g.lineBetween(-2, y + 9, 5, y + 7);
    } else if (look.face === 'cyclops') {
      eye(0, 6);
      g.beginPath().arc(0, y + 9, 3, 0, Math.PI).strokePath();
    } else if (look.face === 'derp') {
      eye(-5, 4.2, Math.sin(t / 90), Math.cos(t / 70));
      eye(5, 2.6, Math.cos(t / 110), Math.sin(t / 60));
      g.fillStyle(0xff6b8a, 1).fillRoundedRect(-1, y + 7, 5, 5, 2);
      g.lineBetween(-5, y + 7, 5, y + 7);
    } else {
      eye(-5, 3.5); eye(5, 3.5);
      if (look.face === 'angry') {
        g.lineStyle(2, 0x111111, 1).lineBetween(-9, y - 6, -2, y - 3).lineBetween(9, y - 6, 2, y - 3);
        g.lineBetween(-4, y + 9, 4, y + 9);
      } else g.beginPath().arc(0, y + 4, 5, 0.15 * Math.PI, 0.85 * Math.PI).strokePath();
    }
  }

  function drawHat(g, t) {
    const y = look.body === 'cat' || look.body === 'star' ? -15 : look.body === 'ufo' ? -11 : -12;
    g.lineStyle(1.5, 0x000000, 0.5);
    if (look.hat === 'crown') {
      const pts = [[-9, 0], [-9, -9], [-4.5, -4], [0, -11], [4.5, -4], [9, -9], [9, 0]].map(([x, h]) => ({ x, y: y + h }));
      g.fillStyle(0xffc933, 1).fillPoints(pts, true).strokePoints(pts, true);
      g.fillStyle(0xff3b6b, 1).fillCircle(0, y - 3, 1.8);
    } else if (look.hat === 'party') {
      g.fillStyle(0xff4fd8, 1).fillTriangle(-7, y + 1, 7, y + 1, 2, y - 16);
      g.fillStyle(0x4dd8ff, 1).fillTriangle(-3, y - 5, 4.5, y - 5, 2, y - 11);
      g.fillStyle(hue(t / 300), 1).fillCircle(2, y - 17, 3);
    } else if (look.hat === 'propeller') {
      g.fillStyle(0xff3b30, 1).beginPath().arc(0, y + 1, 8, Math.PI, 0).fillPath();
      g.fillStyle(0x333333, 1).fillRect(-0.8, y - 10, 1.6, 4);
      const w = 13 * Math.cos(t / 35);
      g.fillStyle(0x4dd8ff, 1).fillEllipse(-w / 2, y - 10, Math.abs(w), 3).fillStyle(0xffe14d, 1).fillEllipse(w / 2, y - 10, Math.abs(w), 3);
    } else if (look.hat === 'halo') {
      g.lineStyle(5, 0xfff3b0, 0.35 + 0.2 * Math.sin(t / 200)).strokeEllipse(0, y - 6, 22, 7);
      g.lineStyle(2, 0xffd84d, 1).strokeEllipse(0, y - 6, 20, 6);
    } else if (look.hat === 'horns') {
      g.fillStyle(0xd7263d, 1).fillTriangle(-10, y + 3, -4, y + 1, -12, y - 9).fillTriangle(10, y + 3, 4, y + 1, 12, y - 9);
    } else if (look.hat === 'wizard') {
      g.fillStyle(0x5b2bd9, 1).fillTriangle(-9, y + 1, 9, y + 1, 7 + Math.sin(t / 250) * 3, y - 20).fillRect(-12, y - 1, 24, 3);
      g.fillStyle(0xffe14d, 1).fillCircle(-1, y - 7, 1.8).fillCircle(3, y - 12, 1.2);
    }
  }

  function spark(scene) {
    const p = scene.player, a = look.aura;
    if (a === 'none' || scene.finished || !p.visible) return;
    const x = p.x + Phaser.Math.Between(-8, 8), y = p.y + Phaser.Math.Between(-8, 8);
    let o, to;
    if (a === 'fire') {
      o = scene.add.circle(x, y + 6, Phaser.Math.Between(3, 6), Phaser.Utils.Array.GetRandom([0xff3b30, 0xff8c1a, 0xffd84d]));
      to = { y: y - 26, scale: 0.1, alpha: 0 };
    } else if (a === 'sparkles') {
      o = scene.add.star(x, y, 4, 1.5, 5, hue(Math.random()));
      const ang = Math.random() * Math.PI * 2;
      to = { x: x + Math.cos(ang) * 30, y: y + Math.sin(ang) * 30, angle: 180, alpha: 0 };
    } else if (a === 'bubbles') {
      o = scene.add.circle(x, y, 3).setStrokeStyle(1.5, 0x9ad8ff, 0.9);
      to = { y: y - 30, x: x + Phaser.Math.Between(-8, 8), scale: 2.2, alpha: 0 };
    } else {
      o = scene.add.text(x, y, '♥', { fontSize: '14px', color: Phaser.Utils.Array.GetRandom(['#ff4f8b', '#ff9ff3', '#ff3b6b']) }).setOrigin(0.5);
      to = { y: y - 28, scale: 1.6, alpha: 0 };
    }
    o.setDepth(4).setName('avatarAura');
    scene.tweens.add({ targets: o, ...to, duration: cfg.auraMs, onComplete: () => o.destroy() });
  }

  function draw(scene) {
    const g = scene.avatarGfx, p = scene.player;
    if (!g || !g.active) return;
    const t = scene.time.now, v = p.body.velocity, s = COIN_DASH.playerSpeed;
    p.fillAlpha = 0; p.strokeAlpha = 0; // the rectangle stays as the hitbox; other features may recolour it, we hide it each frame
    const moving = v.lengthSq() > 1;
    const bob = moving ? 0 : Math.sin(t / 260) * 1.5;
    const stretch = moving ? 1 + 0.12 * Math.abs(Math.sin(t / 70)) : 1 + Math.sin(t / 260) * 0.04;
    g.clear().setPosition(p.x, p.y + bob).setAngle(p.angle).setAlpha(p.alpha).setVisible(p.visible)
      .setScale(2 - stretch, stretch);
    drawBody(g, colour(scene, t), t);
    drawFace(g, v.x / s, v.y / s, t);
    drawHat(g, t);
  }

  function setup(scene) {
    scene.avatar = look;
    scene.avatarGfx = scene.add.graphics().setDepth(5);
    scene.time.addEvent({ delay: cfg.auraEveryMs, loop: true, callback: () => spark(scene) });
    scene.input.keyboard.on('keydown-' + cfg.randomKey, () => randomize());
    draw(scene);
  }

  // ---- wardrobe panel (DOM, under the game) ----
  const panel = document.createElement('section');
  panel.id = 'wardrobe';
  panel.innerHTML = `<style>
    #wardrobe{margin:12px auto;max-width:800px;padding:10px 14px;border-radius:14px;background:#0a1120d9;color:#e5edf7;
      font:600 13px ui-rounded,system-ui,sans-serif;display:grid;gap:6px;border:1px solid #34445e}
    #wardrobe .row{display:flex;flex-wrap:wrap;gap:5px;align-items:center}
    #wardrobe b{width:52px;color:#8fa3bf;font-size:11px;letter-spacing:.08em}
    #wardrobe button{font:inherit;color:inherit;background:#1a2638;border:1px solid #34445e;border-radius:999px;padding:3px 10px;cursor:pointer}
    #wardrobe button:hover{transform:scale(1.08)}
    #wardrobe button.on{background:linear-gradient(90deg,#ff4fd8,#ffd84d,#4dd8ff);color:#111;border-color:transparent}
    #wardrobe .roll{margin-left:auto;font-size:15px}</style>`;
  const render = () => panel.querySelectorAll('button[data-k]').forEach(b => b.classList.toggle('on', look[b.dataset.k] === b.dataset.v));
  const save = () => { try { localStorage.setItem(cfg.storageKey, JSON.stringify(look)); } catch (e) { /* ignore */ } render(); };
  function randomize() {
    for (const k in cfg.options) look[k] = Phaser.Utils.Array.GetRandom(Object.keys(cfg.options[k]));
    save();
  }
  for (const [k, opts] of Object.entries(cfg.options)) {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<b>${k.toUpperCase()}</b>` + Object.entries(opts).map(([v, label]) => `<button data-k="${k}" data-v="${v}">${label}</button>`).join('');
    panel.append(row);
  }
  panel.lastElementChild.insertAdjacentHTML('beforeend', `<button class="roll" title="Random avatar (${cfg.randomKey})">🎲 Surprise me (${cfg.randomKey})</button>`);
  panel.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.k) { look[b.dataset.k] = b.dataset.v; save(); } else randomize();
    b.blur(); // so Space (dash) doesn't re-press the button
  });
  document.getElementById('game').after(panel);
  render();

  function hook() {
    const scene = game.scene.getScene('CoinDash');
    scene.events.on('create', setup); // fires again on every restart (R)
    scene.events.on('postupdate', () => draw(scene)); // registered once; draw() skips while the graphics is gone
    if (scene.player) setup(scene);
  }
  if (game.isBooted) hook(); else game.events.once('ready', hook);
})();
