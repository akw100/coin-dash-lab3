// Board-game makeover: printed board behind the play, token follows the coin, board steps aside in neon mode.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';

export async function board(t) {
  await t.js(park);
  await t.sleep(200);
  await t.shot('board-start');
  const s = await t.js('({ shown: __scene().board.board.visible, tex: __scene().board.board.texture.key, dx: __scene().board.token.x - __scene().coin.x })');
  t.assert(s.shown && s.tex === 'board-dark' && s.dx === 0, `board or token wrong at start (${JSON.stringify(s)})`);
  await t.press('KeyL');
  await t.sleep(150);
  t.assert(await t.js('__scene().board.board.texture.key') === 'board-light', 'L did not switch to the light board');
  await t.press('KeyL');
  await t.press('KeyT');
  await t.sleep(150);
  t.assert(await t.js('__scene().board.board.visible') === false, 'neon mode (T) still shows the printed board');
  await t.press('KeyT');
}

export async function endPad(t) {
  await t.js(park);
  await t.js('{ const s = __scene(); s.score = 7; s.finish("Time is up!"); }');
  await t.sleep(500);
  t.assert(await t.js('__scene().board.end[1].text') === 'FINAL SCORE', 'end card ribbon missing');
  await t.shot('board-end');
}
