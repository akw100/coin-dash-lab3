const count = "__scene().children.list.filter(o => o.name === 'trail').length";

export async function trail(t) {
  await t.js('__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))');
  await t.hold('ArrowRight', 300);
  const during = await t.js(count);
  t.assert(during >= 3, `only ${during} trail squares after moving`);
  await t.sleep(1000);
  const after = await t.js(count);
  t.assert(after === 0, `${after} trail squares left after 1s idle`);
  return `${during} ghosts while moving, 0 after idle`;
}
