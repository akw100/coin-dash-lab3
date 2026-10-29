// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  droneSpeed: 105,
  droneCount: 3,
  highScoreKey: 'coinDash.best',
  timerBar: { y: 40, height: 6, warnSeconds: 10, colorStart: 0x4cd964, colorEnd: 0xff3b30 },
  hitFx: { shakeMs: 220, shakeIntensity: 0.012, flashMs: 160, flashColor: [255, 59, 48] },
  pauseKey: 'KeyP',
  teleport: { key: 'T', distance: 140, cooldownMs: 1500, flashColor: 0xffffff },
  doublePoints: { multiplier: 2, durationMs: 8000, spawnEveryMs: 10000, lifetimeMs: 7000, color: 0xb388ff },
  magnet: { radius: 180, pullSpeed: 220, durationMs: 5000, spawnEveryMs: 12000, lifetimeMs: 7000, color: 0x2e86ff },
  colors: { background: 0x101c31, player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a }
};
// Sparkly coins (sparkle.js): twinkle = stars around the coin, burst = stars on pickup.
window.COIN_DASH.sparkle = {
  colors: [0xffffff, 0xfff3b0, 0xffd166],
  lightColors: [0xd99a00, 0xb86e00, 0xf2b705], // used while light mode (L) is on
  twinkleEvery: 90,   // ms between twinkle stars
  twinkleRadius: 18,
  burstCount: 24,
  burstSpeed: 220,
  pulseMs: 450        // gold glow/shimmer half-period
};
// Glitter mode (glitter.js), toggled with G.
window.COIN_DASH.glitter = {
  colors: [0xffffff, 0xff9ff3, 0x9ad8ff, 0xfff3b0, 0xb8ff9a],
  trailEvery: 25,   // ms between trail specks behind the player
  rainEvery: 30,    // ms between falling specks
  droneEvery: 60    // ms between shimmer specks per drone
};

// Light mode (L toggles). Sprites are darkened so they stay visible on the light background.
COIN_DASH.lightColors = { background: 0xf4f1e8, grid: 0xc9cfd8, hud: '#1b2433',
  player: 0x138a72, coin: 0xd99a00, drone: 0xd7263d, page: '#e9e5da', pageText: '#1b2433' };

// UI (ui.js): HUD panels, end screen, shadows, vignette. `dark`/`light` swap with L (scene.lightMode).
COIN_DASH.ui = {
  font: 'ui-rounded, "SF Pro Rounded", "Segoe UI", system-ui, -apple-system, Roboto, sans-serif',
  panel: { x: 12, y: 4, w: 128, h: 36, radius: 10 },
  shadow: { dx: 3, dy: 5, alpha: 0.3 },
  titleMs: 2600,     // start banner stays this long, then fades (gameplay is never blocked)
  // timer colour from time left: normal, then amber, then red with a pulse (computed every frame from deadline)
  timer: { amberSeconds: 10, redSeconds: 5, pulseMs: 500,
    dark: { amber: '#ffb347', red: '#ff657a' }, light: { amber: '#b86e00', red: '#d7263d' } },
  dark:  { panel: 0x0a1120, panelAlpha: 0.78, stroke: 0x34445e, text: '#e5edf7', label: '#8fa3bf', outline: 0x0a1120, vignette: 0.55 },
  light: { panel: 0xffffff, panelAlpha: 0.85, stroke: 0xc9cfd8, text: '#1b2433', label: '#5b6778', outline: 0x1b2433, vignette: 0.12 }
};

// Shield pickup (shield.js): grab it to absorb the next drone hit.
window.COIN_DASH.shield = { spawnEveryMs: 12000, lifetimeMs: 7000, graceMs: 700, color: 0x4dd8ff, glow: 0xbff4ff };
// Clock pickup (clock.js): adds addSeconds to the round when grabbed.
window.COIN_DASH.clock = { addSeconds: 5, spawnEveryMs: 14000, lifetimeMs: 8000, color: 0x2ecc71 };

// Half-points mode (halfmode.js): H toggles; a hit halves the score instead of ending the round.
window.COIN_DASH.halfMode = { key: 'H', invulnMs: 1000, blinkMs: 100, color: '#ffd166' };
// Auto-continue (autocontinue.js): N toggles; after a round ends a countdown starts the next one.
COIN_DASH.autoContinue = { key: 'N', seconds: 3, storageKey: 'coinDashAutoContinue' };
// Two-player mode (twoplayer.js): 2 toggles; P2 uses the arrow keys.
window.COIN_DASH.twoPlayer = { key: 'TWO', color: 0xff9f43 };

// Logo (logo.js): gold coin with speed lines, drawn above the start title. Same shapes as logo.svg.
window.COIN_DASH.logo = { y: 118, radius: 44, gold: 0xffc933, rim: 0xb8860b, edge: 0x3b2a05, shine: 0xfff3b0, lines: [-22, 0, 22],
  spinMin: 0.25, spinMs: 700, bob: 6, bobMs: 900, slide: 10, slideMs: 250 };

// Chaser drone (chaser.js): a slower drone that steers toward the player.
COIN_DASH.chaser = { speed: 60, startX: 740, startY: 460, color: 0xb388ff };

// Dash (dash.js): Space gives a short speed burst in the move direction.
window.COIN_DASH.dash = { key: 'SPACE', multiplier: 3, durationMs: 150, cooldownMs: 1500, x: 12, y: 46, w: 128, h: 6, color: 0x71e8ce };

// Sounds (sounds.js): synthesised beeps, M mutes (remembered).
window.COIN_DASH.sounds = { key: 'M', storageKey: 'coinDashMuted', volume: 0.08 };
// Help overlay (helpoverlay.js): key toggles a controls/rules panel and pauses the game.
COIN_DASH.helpOverlay = { key: 'K', alpha: 0.85 };
// Neon theme (theme.js): T toggles it; choice stored under storageKey.
COIN_DASH.neon = { storageKey: 'coinDashNeon', background: 0x000000, grid: 0x3a0a3a, player: 0x39ff14, coin: 0x00ffff, drone: 0xff00ff };
// Player trail (features/playertrail.js): ghost squares left behind while moving.
COIN_DASH.trail = { everyMs: 40, fadeMs: 300, alpha: 0.5 };
// Countdown (countdown.js): "3, 2, 1, GO!" before each round; seconds 0 turns it off.
COIN_DASH.countdown = { seconds: 3, goMs: 500, color: '#ffd84d', force: false };
// Difficulty (difficulty.js): keys 1/2/3 pick a preset and restart the round.
COIN_DASH.difficulty = { storageKey: 'coinDashDifficulty', default: 'Normal',
  presets: { Easy: { key: '1', droneCount: 2, droneSpeed: 70 }, Normal: { key: '2', droneCount: 3, droneSpeed: 105 }, Hard: { key: '3', droneCount: 5, droneSpeed: 150 } } };
