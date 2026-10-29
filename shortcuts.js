/* global COIN_DASH */
// Keyboard shortcuts: P/Space pause, ?// help overlay (rows come from COIN_DASH.shortcuts), Esc closes it.
// R, L, T, G, B are handled by game.js and the feature scripts. Plain DOM, so it works while the scene is paused.
(() => {
  const css = (el, s) => Object.assign(el.style, s);
  const box = document.createElement('div');
  css(box, { position: 'fixed', inset: 0, display: 'none', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(10,17,32,.85)', zIndex: 10, font: '16px system-ui, sans-serif', color: '#e5edf7' });
  box.setAttribute('role', 'dialog');
  box.innerHTML = '<table style="border-spacing:18px 6px"><caption style="font-size:22px;margin-bottom:8px">Keyboard shortcuts</caption>'
    + COIN_DASH.shortcuts.map(r => `<tr><td><kbd>${r.keys}</kbd></td><td>${r.action}</td></tr>`).join('') + '</table>';
  const hint = document.createElement('div');
  hint.textContent = '? for shortcuts';
  css(hint, { position: 'fixed', right: '10px', bottom: '8px', font: '13px system-ui, sans-serif', color: '#8fa3bf', zIndex: 5 });
  document.body.append(box, hint);

  const scene = () => window.coinDashGame.scene.getScene('CoinDash');
  const togglePause = () => {
    const s = scene();
    if (s.finished) return;
    if (s.sys.isPaused()) s.scene.resume(); else s.scene.pause();
  };
  window.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '?' || e.code === 'Slash') box.style.display = box.style.display === 'none' ? 'flex' : 'none';
    else if (e.key === 'Escape') box.style.display = 'none';
    else if (e.code === 'KeyP' || (e.code === 'Space' && !e.repeat)) togglePause();
    else if (e.code === 'KeyR' && scene().sys.isPaused()) { scene().scene.resume(); scene().scene.restart(); }
    if (e.code === 'Space') e.preventDefault();
  });
})();
