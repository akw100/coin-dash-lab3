// Keep tuning separate from game behaviour so features can be developed independently.
window.COIN_DASH = {
  width: 800,
  height: 500,
  roundSeconds: 45,
  playerSpeed: 240,
  droneSpeed: 105,
  droneCount: 3,
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
