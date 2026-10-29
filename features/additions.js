/* global COIN_DASH, CoinDash, coinDashGame */
// Additions panel under the game: checkboxes turn features on/off (remembered) and a table lists every shortcut.
// A feature is switched off through its own config, which it reads again on every round start, so its file is untouched.
(() => {
  const c = COIN_DASH, F = 1e9; // a spawn interval nobody waits for
  const name = k => ({ SPACE: 'Space', TWO: '2' }[k] || k.replace(/^Key/, ''));
  // [config, label, what it does, config fields while off]; the chaser has no switch, so create() below hides it.
  const ADDITIONS = [
    ['magnet', 'Magnet', 'blue U pickup pulls coins to you', { spawnEveryMs: F }],
    ['shield', 'Shield', 'bubble pickup absorbs one drone hit', { spawnEveryMs: F }],
    ['clock', 'Clock', `green pickup, +${c.clock.addSeconds}s`, { spawnEveryMs: F }],
    ['timeBonus', 'Time bonus', `white pickup, +${c.timeBonus.addSeconds}s`, { spawnEveryMs: F }],
    ['doublePoints', 'Double points', 'purple pickup, coins worth x2', { spawnEveryMs: F }],
    ['bonusCoin', 'Bonus coin', `big orange coin worth ${c.bonusCoin.points}`, { spawnEveryMs: F }],
    ['combo', 'Combo', `quick pickups multiply up to x${c.combo.max}`, { windowMs: -1 }],
    ['lives', 'Lives', `${c.lives.count} drone hits per round`, { count: 1 }],
    ['walls', 'Walls', 'grey blocks in the arena', { blocks: [] }],
    ['chaser', 'Chaser drone', 'purple drone that hunts you', {}],
    ['countdown', 'Countdown', '3, 2, 1, GO! before each round', { seconds: 0 }],
    ['dash', 'Dash', `${name(c.dash.key)}: speed burst`, { key: 'OFF' }],
    ['teleport', 'Teleport', `${c.teleport.key}: jump ahead`, { key: 'OFF' }],
    ['slowMo', 'Slow-mo', `hold ${c.slowMo.key}: slow the drones`, { key: 'OFF' }],
    ['emp', 'EMP bomb', `${c.emp.key}: freeze drones, once a round`, { key: 'OFF' }],
    ['bot', 'Bot', `${c.bot.key}: a bot plays against you`, { key: 'OFF' }]
  ];
  const on = {};
  ADDITIONS.forEach(([id, , , off]) => { on[id] = {}; Object.keys(off).forEach(k => { on[id][k] = c[id][k]; }); });
  let disabled = {};
  try { disabled = JSON.parse(localStorage.getItem(c.additions.storageKey)) || {}; } catch (e) { /* ignore */ }
  const apply = () => ADDITIONS.forEach(([id, , , off]) => Object.assign(c[id], disabled[id] ? off : on[id]));
  apply();

  const createWithoutAdditions = CoinDash.prototype.create;
  CoinDash.prototype.create = function () {
    createWithoutAdditions.call(this);
    if (disabled.chaser && this.chaser) { this.drones.remove(this.chaser); this.chaser.setVisible(false).body.enable = false; }
  };

  // [keys, action, addition that owns them]
  const SHORTCUTS = [
    ['Arrows / WASD', 'move (on touch screens: hold where you want to go)'],
    ['R', 'restart the round'],
    [name(c.pauseKey), 'pause'],
    [c.helpOverlay.key, 'help overlay'],
    [c.sounds.key, 'mute sounds'],
    ['L', 'light mode'],
    ['T', 'neon theme'],
    ['G', 'glitter mode'],
    [c.halfMode.key, 'half-points mode: a hit halves your score instead of ending the round'],
    [c.autoContinue.key, 'auto-continue to the next round'],
    ['1 / 2 / 3', 'difficulty: easy / normal / hard'],
    [name(c.twoPlayer.key), 'two-player mode (P1 on WASD, P2 on arrows)'],
    ['Any key / click', 'hide the start banner'],
    ...ADDITIONS.filter(a => a[3].key).map(([id, label]) => [name(on[id].key), label.toLowerCase(), id])
  ];

  const css = document.createElement('style');
  css.textContent = `#additions { margin: 18px 0; font-size: 15px; }
#additions h2 { font-size: 16px; margin: 18px 0 8px; letter-spacing: .05em; }
#additions .toggles { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 6px 16px; }
#additions label { display: flex; gap: 8px; align-items: baseline; cursor: pointer; }
#additions small, #additions .off { opacity: .6; }
#additions table { border-collapse: collapse; }
#additions td { padding: 3px 14px 3px 0; vertical-align: top; }
#additions kbd { font: 13px monospace; padding: 1px 6px; border: 1px solid currentColor; border-radius: 4px; white-space: nowrap; }
#additions .clash { color: #ffb347; }`;
  document.head.append(css);
  const box = document.createElement('section');
  box.id = 'additions';
  box.innerHTML = '<h2>Additions</h2><p><small>Untick to play without it. The round restarts.</small></p><div class="toggles"></div>' +
    '<h2>Keyboard shortcuts</h2><table><tbody></tbody></table>';
  box.querySelector('.toggles').append(...ADDITIONS.map(([id, label, what]) => {
    const row = document.createElement('label');
    row.innerHTML = `<input type="checkbox" name="${id}"><span>${label} <small>${what}</small></span>`;
    const input = row.firstChild;
    input.checked = !disabled[id];
    input.addEventListener('change', () => {
      disabled[id] = !input.checked;
      try { localStorage.setItem(c.additions.storageKey, JSON.stringify(disabled)); } catch (e) { /* ignore */ }
      apply();
      renderShortcuts();
      input.blur(); // so Space dashes instead of ticking the box again
      coinDashGame.scene.getScene('CoinDash').scene.restart();
    });
    return row;
  }));
  function renderShortcuts() {
    const live = SHORTCUTS.filter(s => !disabled[s[2]]);
    const uses = {};
    live.forEach(([keys]) => keys.split(' / ').forEach(k => { uses[k] = (uses[k] || 0) + 1; }));
    box.querySelector('tbody').innerHTML = SHORTCUTS.map(([keys, action, id]) => {
      const off = disabled[id], clash = !off && keys.split(' / ').some(k => uses[k] > 1);
      return `<tr class="${off ? 'off' : clash ? 'clash' : ''}"><td>${keys.split(' / ').map(k => `<kbd>${k}</kbd>`).join(' / ')}</td>` +
        `<td>${action}${off ? ' (off)' : clash ? ' — shares its key with another shortcut' : ''}</td></tr>`;
    }).join('');
  }
  renderShortcuts();
  document.querySelector('main').append(box);
})();
