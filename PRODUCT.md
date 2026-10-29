# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Classmates and the instructor watching the pair demo the game on a laptop screen at the end of Lab 3. They see it cold, for a minute or two, while someone plays.

## Product Purpose
Coin Dash is a 45-second browser arcade round: collect coins, dodge drones. Success for the demo is that the room gets the game at a glance and finds it fun and striking to watch.

## Positioning
A tiny starter game grown by many parallel AI-built features (power-ups, levels, combos, lives, avatar wardrobe, themes), each a separate script layered on one Phaser scene.

## Capabilities and Constraints
- Phaser 3.90, plain `<script>` tags, opens as a file. No build, no network: no CDN, web fonts or fetches; system font stacks only.
- 800×500 canvas, scaled to fit. Keyboard play (arrows/WASD, R restart) plus many feature keys (P, L, T, M, K, G, B, H, N, C, 1/2/3, Space).
- Existing toggles must keep working: light mode (L), neon theme (T), avatar wardrobe panel under the game.
- Test contract: `window.coinDashGame`, scene `player`, `coin`, `drones`, `score`, `finished`, `deadline`, `finish()`; smoke tests via `node tools/smoke.mjs`.

## Brand Commitments
Name "Coin Dash". The current coin-with-speed-lines logo may be redrawn or replaced.

## Evidence on Hand
No image, audio or font assets; everything is drawn in code. Team: Yehuda Arbiv and Itay Nissan (README).

## Product Principles
- Readable at a glance from across a room.
- Every feature's visuals keep working; the makeover reskins, never removes.
- Small, mergeable diffs: new files over edits to shared ones.
