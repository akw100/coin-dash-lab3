// Two-player mode: 2 starts it; arrows move only P2, WASD only P1; a drone hit eliminates one player.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';

export async function twoplayer(t) {
  await t.press('KeyV');
  await t.sleep(300);
  t.assert(await t.js('!!__scene().player2'), 'KeyV did not start two-player mode');
  await t.js(park);
  const pos = () => t.js('({ a: __scene().player.x, b: __scene().player2.x })');
  const p0 = await pos();
  await t.hold('ArrowRight', 300);
  const p1 = await pos();
  t.assert(p1.b > p0.b + 20 && Math.abs(p1.a - p0.a) < 15, `arrows should move only P2 (${JSON.stringify([p0, p1])})`);
  await t.hold('KeyD', 300);
  const p2 = await pos();
  t.assert(p2.a > p1.a + 20 && Math.abs(p2.b - p1.b) < 15, `WASD should move only P1 (${JSON.stringify([p1, p2])})`);
  await t.shot('two-player');
  await t.js('{ const s = __scene(), d = s.drones.getChildren()[0]; d.body.reset(s.player.x, s.player.y); }');
  await t.sleep(200);
  t.assert(await t.js('JSON.stringify(__scene().out)') === '[true,false]' && !(await t.js('__scene().finished')),
    'a drone hit should eliminate only P1');
  return 'P1/P2 move independently, drone hit eliminates one';
}
