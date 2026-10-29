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
