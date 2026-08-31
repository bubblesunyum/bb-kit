#!/bin/bash
# The gate: build, test, and smoke the app behind a single exit code, so an
# agent can prove its own work without a human reading a screen.
#
#   scripts/verify.sh           # build + tests
#   scripts/verify.sh --full    # + slower checks and any smoke test
#   scripts/verify.sh --quick   # build only
#
# Output is deliberately tiny. A build tool prints tens of thousands of lines
# and an agent that pipes that into its context has spent a chunk of the day's
# tokens to learn one bit — did it pass. Full logs land in /tmp/bbk-verify/
# and are worth reading only when something fails.
#
# Everything outside the PROJECT STEPS block is harness scaffolding. The steps
# themselves are in that block; keep any new one going through `step`, which
# swallows the log and reports one line.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
LOGS=/tmp/bbk-verify
mkdir -p "$LOGS"

mode="${1:---default}"
failed=0
started=$SECONDS

# Everything interesting in a build log is on a line saying "error:" — the rest
# is compile invocations. Keep the first few, deduplicated, and say where the
# whole thing is. Widen the pattern if your toolchain words failures differently.
report() {
  local name="$1" log="$2" status="$3"
  if [ "$status" -eq 0 ]; then
    echo "  ok    $name"
  else
    failed=1
    echo "  FAIL  $name"
    grep -E "(error|failed):" "$log" | sed -e 's/^/        /' | sort -u | head -8
    echo "        full log: $log"
  fi
}

step() {
  local name="$1"; shift
  local log="$LOGS/${name// /-}.log"
  "$@" > "$log" 2>&1
  report "$name" "$log" $?
}

echo "verify: $ROOT"

# The knowledge layer gets the same treatment as the code. A doc that quietly
# stopped being true is worse than a missing one, and it can't be caught by
# reviewing a diff — the stale file isn't in the diff, the thing it describes is.
# Runs first because it takes a second and needs no build.
if context_out="$(scripts/context.py check 2>&1)"; then
  echo "$context_out"
else
  failed=1
  echo "$context_out"
fi

# The reviewers exist twice — .claude/agents/ for Claude Code, .opencode/agent/
# generated from it — and the generated half drifts silently, because nothing
# about editing the source makes opencode complain. Checked rather than
# regenerated: a gate that quietly fixed this would pass every time and never
# say the two had parted company.
if agents_out="$(scripts/opencode-agents.py check 2>&1)"; then
  echo "$agents_out"
else
  failed=1
  echo "$agents_out"
fi

# ── PROJECT STEPS ─────────────────────────────────────────────────────────
# The repo is scaffolded by plan Step 0 (Next.js + Tailwind v4 + Vitest +
# Storybook). Until package.json exists there is nothing to build, so the gate
# says so rather than failing — a red gate on an empty repo trains everyone to
# ignore it. Delete this guard once Step 0 lands.

if [ ! -f package.json ]; then
  echo "  skip  build   (no package.json yet — plan Step 0 scaffolds it)"
  echo "  skip  tests   (no package.json yet)"
else
  # `npm run` on a missing script exits non-zero, which would read as a real
  # failure. Ask package.json what it actually has.
  has_script() { node -e "process.exit(require('./package.json').scripts?.['$1']?0:1)" 2>/dev/null; }

  has_script typecheck && step "typecheck" npm run typecheck
  step "build" npm run build

  if [ "$mode" != "--quick" ]; then
    step "tests" npm test -- --run

    # "ok" alone can't tell a green suite from one that ran nothing. Vitest
    # prints "Tests  N passed"; repoint this if the runner changes.
    if [ -f "$LOGS/tests.log" ]; then
      grep -oE "Tests[[:space:]]+[0-9]+ passed[^)]*" "$LOGS/tests.log" | tail -1 | sed -e 's/^/        /'
    fi
  fi

  if [ "$mode" = "--full" ]; then
    # The slow half: Storybook has to actually build, because it is the only
    # surface the owner of this kit ever sees — a kit whose Storybook is broken
    # has shipped nothing. Playwright screenshots join this once components
    # settle (plan §7.4).
    has_script build-storybook && step "storybook" npm run build-storybook
    has_script "test:e2e" && step "e2e" npm run test:e2e
  fi
fi

# ── END PROJECT STEPS ─────────────────────────────────────────────────────

# What the gate proved, as a git tree. Comparing a commit's timestamp against the
# gate's can only ever say "you committed after you verified", which is the
# order the loop prescribes — so it marked every fresh commit unverified. The
# tree says the thing actually worth knowing: whether the content in that commit
# is the content the gate ran against.
if [ "$failed" -eq 0 ]; then
  idx="$LOGS/index"
  rm -f "$idx"
  GIT_INDEX_FILE="$idx" git read-tree HEAD 2>/dev/null &&
    GIT_INDEX_FILE="$idx" git add -A 2>/dev/null &&
    GIT_INDEX_FILE="$idx" git write-tree 2>/dev/null > "$LOGS/tree"
  rm -f "$idx"
fi

# How long the gate takes is worth watching: it's the tax on every change, and
# when it grows past the patience of whoever's waiting, it stops getting run.
echo $((SECONDS - started)) > "$LOGS/elapsed"

[ "$failed" -eq 0 ] && echo "verify: passed" || echo "verify: FAILED"
exit "$failed"
