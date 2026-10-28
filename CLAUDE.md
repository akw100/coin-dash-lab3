# Coin Dash: rules for agents working on a feature

A browser-only Phaser 3.90 game. `index.html` loads `vendor/phaser-3.90.0.min.js`, then `settings.js`
(tunables), then `game.js` (the scene). No build, no npm packages, no network: no CDN links, fetches or
new dependencies. Keep plain `<script>` tags (no `type="module"`), so `index.html` still works when opened
as a file. That is how the README runs it, and how the smoke test loads it.

## Building a feature

- Work only in your own worktree and branch. Never commit to, merge into or push `main` unless the human asks.
- Keep the diff small. Change only what the feature needs, and don't reformat or rename existing code.
  Tunables go in `settings.js`. Prefer new code in a new file over large edits to `game.js`: parallel features
  all touch `game.js`, and small edits merge without conflicts. Load it with one new `<script>` line at the end
  of the feature-scripts block in `index.html`, and don't edit the existing lines there. `.gitattributes` merges
  `index.html` by keeping both sides' lines, so an edit to an existing line would end up duplicated.
- Keep the test contract: `window.coinDashGame`, plus `player`, `coin`, `drones`, `score`, `finished`,
  `deadline` and `finish()` on the play scene. If the feature has to change one of them, update
  `tests/core.mjs` in the same commit and say so in your report.
- Add `tests/<feature>.mjs` with a check for the new behaviour, following the pattern in `tests/core.mjs`.
  Checks drive the page only through `t`, so no `fs`, network or `child_process` imports.
- Run `node tools/smoke.mjs` (or `--only <feature>` while iterating) until everything passes, then look at
  the screenshots in `reports/smoke/` and check that they show the feature.
- Commit with a message such as `Add pause key (P)`.
- Report back with: the worktree path, branch, start commit (`git merge-base main HEAD`), the output of
  `git diff --stat <start>`, the smoke result, and how a person tries the feature (which keys, what to look for).

## Integrating: when the human approves a feature

When the human says a feature is approved (or says "merge X"), do all of this without asking again:

1. `tools/trymerge.sh feature/x` merges the branch into `main` in a throwaway worktree and smoke-tests the result,
   leaving `main` untouched. If it reports a conflict or a failed check, stop: report which files or checks, and fix
   them on the feature branch first.
2. If it passes, merge for real in the main checkout (the first path in `git worktree list`): `git pull`, then
   `git merge --no-ff feature/x`, then `node tools/smoke.mjs`, then `git push`. If the push is refused, pull, re-run smoke, and push again.
3. Report the new `main` commit and the smoke result, and tell the human to play `main` once.

## Tools

- `node tools/hub.mjs` serves http://127.0.0.1:8000, with every worktree's branch, commits against `main`,
  uncommitted files, smoke result, a Play link and the history graph. `--print` shows the same table in the terminal.
- `node tools/smoke.mjs [dir]` drives headless Chrome over a pipe with no ports, so worktrees can run it in parallel.
  It exits with 1 on a failed check, a page error, a missing file or any request that leaves the laptop.
  Chrome cannot start inside the Codex sandbox, so Codex has to run this one command outside it (ask for approval).
