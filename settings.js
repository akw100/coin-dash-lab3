// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  droneSpeed: 105,
  droneCount: 3,
  teleport: { key: 'T', distance: 140, cooldownMs: 1500, flashColor: 0xffffff },
  colors: { background: 0x101c31, player: 0x71e8ce, coin: 0xffd166, drone: 0xff657a }
};
// Sparkly coins (sparkle.js): twinkle = stars around the coin, burst = stars on pickup.
window.COIN_DASH.sparkle = {
  colors: [0xffffff, 0xfff3b0, 0xffd166],
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
