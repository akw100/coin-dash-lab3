/* global Phaser, COIN_DASH, CoinDash */
// Walls: static grey blocks. Player is blocked, drones bounce off, coins never spawn inside one.
const createWithoutWalls = CoinDash.prototype.create;
const placeCoinWithoutWalls = CoinDash.prototype.placeCoin;
CoinDash.prototype.create = function () {
  createWithoutWalls.call(this);
  const w = COIN_DASH.walls;
  this.walls = this.physics.add.staticGroup();
  w.blocks.forEach(b => this.walls.add(this.add.rectangle(b.x, b.y, b.w, b.h, w.color)));
  this.physics.add.collider(this.player, this.walls);
  this.physics.add.collider(this.drones, this.walls);
  this.placeCoin(); // the first coin was placed before the walls existed
};
CoinDash.prototype.placeCoin = function () {
  do placeCoinWithoutWalls.call(this);
  while (this.walls && COIN_DASH.walls.blocks.some(b =>
    Math.abs(this.coin.x - b.x) < b.w / 2 + 9 && Math.abs(this.coin.y - b.y) < b.h / 2 + 9));
};
