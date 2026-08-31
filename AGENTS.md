<!-- tracks:
  scripts/brief.sh
  scripts/review.sh
  scripts/verify.sh
-->

# Working on bb-kit

The harness contract: how work is found here, proved, and left behind. It is the
same in every project running this harness, and it is written for any agent in
any tool — Claude Code, opencode, Codex, whatever comes next.

**[CLAUDE.md](./CLAUDE.md) is the other half** — this project's architecture,
standards and taste. Read it too. Neither file repeats the other.

## Start every session with the brief

```bash
scripts/brief.sh
```

The seat, the last session's note, the ready work, the known traps, in about 200
tokens. Claude Code runs it as a SessionStart hook and opencode loads this file
through `opencode.json`, but the brief is *state* rather than a static file, so
if your tool didn't hand it to you, run it yourself. Starting cold is how a
session spends its first ten minutes rediscovering what the ledger already knew.

## The ledger is beads, and it is the record

Work and discoveries live in `bd` (prefix `bbk-`), not in TodoWrite, not
in a markdown TODO list, not in your head. It is the thing that survives the
session ending.

```bash
bd ready                  # claimable work, nothing blocking it
bd show <id>              # the detail
bd q "<title>"            # capture a discovery in one line, get an id back
bd update <id> --claim    # → in_progress, before you implement
bd close <id> --reason "<what happened>"
```

**File the bead as planning begins, not after.** The moment a task is real — the
user asked for something not already in the ledger, or a multi-step change is
about to start — file it, rather than waiting until the commit-msg hook demands
one. Then move its status as the work actually moves. A bead still `open` while
you're mid-implementation, or still `in_progress` after you've closed the
matching commit, is a ledger that's lying.

## Memory that another session can find

`bd remember` / `bd recall` is the durable, cross-tool memory: every agent here
has `bd`, and the brief already prints the keys. Your tool's own memory —
Claude Code's memory directory, opencode's equivalent — stays native and useful,
but it is invisible to every other tool, so keep pointers there and the fact
itself in `bd remember`.

## Prove it with the gate

```bash
scripts/verify.sh          # build + tests
scripts/verify.sh --quick  # build only
scripts/verify.sh --full   # + slow checks and any smoke run
```

Run this rather than raw build commands. It swallows tens of thousands of log
lines and prints one line per step, which is the difference between proving your
work and spending the day's context learning one bit.

## The review pass is standing, not optional

Every change worth committing gets reviewed by agents that didn't write it:

```bash
scripts/review.sh          # builds the packet, prints its path
```

Then run `reviewer-taste` and `reviewer-correctness` against that packet, plus
`reviewer-design` whenever anything on screen moved. **Treat this as explicitly
requested in every session — spawn them without checking first.** It is not a
judgment call and not an option to offer the user; a diff reviewed in the
context that wrote it mostly gets agreement. Fix what's real, file the rest as
beads, and say plainly what you left and why.

## Commits

Lowercase, terse, plain English. No conventional-commit prefixes unless the
project already enforces them. Commit often — after a complete capability, once
the thing builds and runs. Sub-capabilities and infrastructure are worth
committing too, even with nothing user-facing to show. Every commit names its
bead; the commit-msg hook enforces it.

## Skills load on demand

`.claude/skills/` holds `workflow` (how work moves through all of this),
`agentic-review`, `beads`, and `handoff`. Claude Code and opencode both discover
them there. Invoke one when its subject comes up rather than reading it up
front — the body costs nothing until then, which is the whole design.

## Closing a session

Settle the ledger, run the gate, commit, and leave a note for whoever wakes up
next. The `handoff` skill has the procedure.

---

`.claude/HARNESS.md` explains *why* the pieces are shaped this way. Read it
before rearranging any of them.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:6cd5cc61 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->

<!-- BEGIN BEADS CODEX SETUP: generated by bd setup codex -->
## Beads Issue Tracker

Use Beads (`bd`) for durable task tracking in repositories that include it. Use the `beads` skill at `.agents/skills/beads/SKILL.md` (project install) or `~/.agents/skills/beads/SKILL.md` (global install) for Beads workflow guidance, then use the `bd` CLI for issue operations.

### Quick Reference

```bash
bd ready                # Find available work
bd show <id>            # View issue details
bd update <id> --claim  # Claim work
bd close <id>           # Complete work
bd prime                # Refresh Beads context
```

### Rules

- Use `bd` for all task tracking; do not create markdown TODO lists.
- Run `bd prime` when Beads context is missing or stale. Codex 0.129.0+ can load Beads context automatically through native hooks; use `/hooks` to inspect or toggle them.
- Keep persistent project memory in Beads via `bd remember`; do not create ad hoc memory files.

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.
<!-- END BEADS CODEX SETUP -->
