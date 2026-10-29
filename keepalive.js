/* global COIN_DASH */
// Keepalive: one uncaught exception inside any feature's frame listener stops Phaser's RequestAnimationFrame
// loop for good (Phaser only asks for the next frame after the current step finishes), which players see as
// the game "getting stuck". This watchdog notices that frames stopped while the game should be running and
// restarts the loop; the original error still reaches the console so the real bug can be fixed.
// Tunables in COIN_DASH.keepalive. Exposes window.coinDashKeepalive = { restarts, lastError } for tests.
(() => {
  const game = window.coinDashGame;
  const state = { restarts: 0, lastError: null };
  window.coinDashKeepalive = state;
  window.addEventListener('error', e => { state.lastError = String(e.message || e.error || e).slice(0, 200); });

  let lastFrame = -1, stalledTicks = 0;
  setInterval(() => {
    const k = COIN_DASH.keepalive || { intervalMs: 400, stalledTicks: 2 };
    const loop = game.loop;
    if (!game.isRunning || !loop || !loop.running || document.hidden) { stalledTicks = 0; lastFrame = loop ? loop.frame : -1; return; }
    if (loop.frame === lastFrame) stalledTicks++; else stalledTicks = 0;
    lastFrame = loop.frame;
    if (stalledTicks < k.stalledTicks) return;
    stalledTicks = 0;
    try {
      loop.raf.stop();
      loop.raf.start(loop.step.bind(loop), loop.forceSetTimeOut, loop.fps);
      state.restarts++;
      console.warn(`Coin Dash keepalive: frame loop had stopped (${state.lastError || 'no error captured'}); restarted it (#${state.restarts}).`);
    } catch (err) { console.warn('Coin Dash keepalive: could not restart the loop', err); }
  }, (COIN_DASH.keepalive && COIN_DASH.keepalive.intervalMs) || 400);
})();
