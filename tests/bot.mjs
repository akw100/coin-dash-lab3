// Bot rival: B adds it, it heads for the coin, can score without touching the human's score, and the round end names a winner.
const park = '__scene().drones.getChildren().forEach((d, i) => d.body.reset(30 + i * 30, 480))';

export async function bot(t) {
  await t.js(park);
  t.assert(await t.js('__scene().bot') === null, 'the bot existed before B was pressed');
  await t.press('KeyB');
  await t.sleep(100);
  t.assert(await t.js('!!__scene().bot'), 'B did not add the bot');
  await t.js('{ const s = __scene(); s.coin.setPosition(700, 100); s.coin.body.reset(700, 100); }');
  const dist = () => t.js('Math.hypot(__scene().coin.x - __scene().bot.x, __scene().coin.y - __scene().bot.y)');
  const d0 = await dist();
  await t.sleep(500);
  const d1 = await dist();
  t.assert(d1 < d0 - 30, `the bot did not move toward the coin (${Math.round(d0)} → ${Math.round(d1)})`);
  await t.js('{ const s = __scene(); s.bot.setPosition(s.coin.x, s.coin.y); s.bot.body.reset(s.coin.x, s.coin.y); }');
  await t.sleep(200);
  const st = await t.js('({ bot: __scene().botScore, you: __scene().score })');
  t.assert(st.bot >= 1 && st.you === 0, `the bot did not score on its own (${JSON.stringify(st)})`);
  await t.js('__scene().finish("test")');
  await t.sleep(200);
  await t.shot('bot-result');
  return `bot ${st.bot}, you ${st.you}, distance ${Math.round(d0)} → ${Math.round(d1)}`;
}
