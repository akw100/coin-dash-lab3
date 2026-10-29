// Coin pickup burst: 12 yellow circles appear at the old coin spot, and are gone ~1s later.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';
const count = '__scene().children.list.filter(o => o.getData && o.getData("particle")).length';

export async function particles(t) {
  await t.js(park);
  await t.js('{ const s = __scene(); s.coin.setPosition(s.player.x, s.player.y); s.coin.body.reset(s.player.x, s.player.y); }');
  await t.sleep(100);
  const n = await t.js(count);
  t.assert(n === 12, `expected 12 burst circles right after pickup, got ${n}`);
  await t.shot('particles');
  await t.sleep(1000);
  const left = await t.js(count);
  t.assert(left === 0, `${left} burst circles still alive 1s later`);
  return `burst ${n} → ${left}`;
}
