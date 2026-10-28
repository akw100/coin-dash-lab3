#!/bin/sh
# Trial-merge feature branches into main in a throwaway worktree, then smoke-test the combined game.
# main, every other worktree and the remote stay untouched. Usage: tools/trymerge.sh feature/a [feature/b ...]
[ $# -gt 0 ] || { echo "usage: tools/trymerge.sh branch [branch ...]   (BASE=… if not main)"; exit 2; }
root=$(git rev-parse --show-toplevel) || exit 2
base=${BASE:-main}
for b in "$@"; do
  git -C "$root" rev-parse --verify --quiet "$b^{commit}" >/dev/null || { echo "no such branch: $b"; exit 2; }
done
tmp=$(mktemp -d "${TMPDIR:-/tmp}/trymerge.XXXXXX")
trap 'git -C "$root" worktree remove --force "$tmp" 2>/dev/null; rm -rf "$tmp"' EXIT INT TERM
git -C "$root" worktree add --quiet --detach "$tmp" "$base" || exit 2
for b in "$@"; do
  if ! git -C "$tmp" merge --quiet --no-edit "$b" >/dev/null 2>&1; then
    echo "CONFLICT merging $b into $base (after: ${merged:-nothing else}):"
    git -C "$tmp" diff --name-only --diff-filter=U | sed 's/^/  /'
    exit 1
  fi
  merged="${merged:+$merged, }$b"
done
echo "merged cleanly into $base: $merged"
node "$root/tools/smoke.mjs" "$tmp" --out "$root/reports/trymerge"
