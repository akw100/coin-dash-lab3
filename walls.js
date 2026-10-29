/* global Phaser, COIN_DASH, CoinDash */
// Walls: static grey blocks. Player is blocked, drones bounce off, coins never spawn inside one.
// Only the coin position is re-rolled (the placeCoin chain is not re-run: other features hook it).
const createWithoutWalls = CoinDash.prototype.create;
const placeCoinWithoutWalls = CoinDash.prototype.placeCoin;
function clearOfWalls(scene) {
  const inside = () => COIN_DASH.walls.blocks.some(b =>
    Math.abs(scene.coin.x - b.x) < b.w / 2 + 9 && Math.abs(scene.coin.y - b.y) < b.h / 2 + 9);
  let guard = 0;
  while (inside() && guard++ < 100) {
    const x = Phaser.Math.Between(25, COIN_DASH.width - 25), y = Phaser.Math.Between(70, COIN_DASH.height - 25);
    scene.coin.setPosition(x, y);
    scene.coin.body.reset(x, y);
  }
}
CoinDash.prototype.create = function () {
  createWithoutWalls.call(this);
  const w = COIN_DASH.walls;
  this.walls = this.physics.add.staticGroup();
  w.blocks.forEach(b => this.walls.add(this.add.rectangle(b.x, b.y, b.w, b.h, w.color)));
  this.physics.add.collider(this.player, this.walls);
  this.physics.add.collider(this.drones, this.walls);
  clearOfWalls(this); // the first coin was placed before the walls existed
};
CoinDash.prototype.placeCoin = function () {
  placeCoinWithoutWalls.call(this);
  if (this.walls) clearOfWalls(this);
};
