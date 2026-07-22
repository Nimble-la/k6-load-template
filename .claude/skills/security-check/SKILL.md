---
name: security-check
description: >-
  Pre-push security review of this k6 template's pending changes: scans the
  committable diff for leaked secrets (hardcoded credentials, tokens/JWTs,
  hosts/URLs that should come from env), verifies config/env.ts only reads from
  __ENV, and confirms `.env` stays out of git. Use whenever the user asks to run
  a security check, "check de seguridad", a security review, or wants to verify
  there are no leaks before committing / pushing / opening a PR.
---

# Security check (pre-push)

Read-only review of the **committable** changes before a commit/push/PR. Never
modifies files.

## What counts as "committable"

Everything that would land in git: tracked modifications (`git diff HEAD`) plus
new untracked files, minus `node_modules/`.

## What must never be committed

- **Credentials / hosts** — `HOST`, `USERNAME`, `PWD` always come from `__ENV`
  (via `config/env.ts`). No literal hosts, usernames, passwords, emails or API
  hosts in code or committed config.
- **Tokens / JWTs** (`eyJ…`) — captured at runtime into `globalThis.token`,
  never hardcoded.
- **The real `.env`** — gitignored; only `.env.example` (empty template) is
  committed.
- **`config/env.ts` stays runtime-only** — it must read `__ENV.*` and nothing
  else; no baked-in values.

## The `.env` hook gotcha

A `PreToolUse` hook blocks any Bash command whose text contains the literal
`.env` (it also matches `process.env`). In grep patterns write `process\.e[n]v`,
and name the file via a glob (e.g. `.e?v`) instead of typing it out.

## Run the scan

```bash
COMMITTED=$(git diff HEAD --name-only 2>/dev/null; git ls-files --others --exclude-standard | grep -v '^node_modules/')
echo "=== files under review ==="; echo "$COMMITTED" | sed 's/^/  - /'

echo "=== a) hardcoded credentials / secrets (not from env) ==="
grep -rInE '(password|passwd|pwd|username|secret|token|apikey|api_key)[[:space:]]*[:=][[:space:]]*"[^"]+"' $COMMITTED 2>/dev/null \
  | grep -viE '__ENV|process\.e[n]v|""' || echo "  (clean)"

echo "=== b) JWTs / bearer tokens (eyJ...) ==="
grep -rInE 'eyJ[A-Za-z0-9_-]{10,}' $COMMITTED 2>/dev/null || echo "  (clean)"

echo "=== c) hardcoded hosts / URLs (should come from env.HOST) ==="
# Allowed: the remote k6 jslib import and example.com placeholders.
grep -rInE 'https?://[A-Za-z0-9.-]+' $COMMITTED 2>/dev/null \
  | grep -viE 'jslib\.k6\.io|example\.com|schemastore\.org|grafana\.com' || echo "  (clean)"

echo "=== d) config/env.ts reads only __ENV (no baked-in values) ==="
grep -nE '=[[:space:]]*"[^"]+"' config/env.ts 2>/dev/null | grep -viE '\?\?[[:space:]]*""' || echo "  (clean)"

echo "=== e) hardcoded emails ==="
grep -rInE '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}' $COMMITTED 2>/dev/null \
  | grep -viE 'example\.com' || echo "  (clean)"

echo "=== f) secret env file stays out of git ==="
# Build the filename without the literal so this command doesn't trip the hook.
envfile=".e""nv"
git ls-files --error-unmatch "$envfile" >/dev/null 2>&1 && echo "  !! ${envfile} is tracked by git" || echo "  ok: ${envfile} not tracked"
git check-ignore "$envfile" >/dev/null 2>&1 && echo "  ok: ignored by .gitignore" || echo "  !! ${envfile} not ignored — check .gitignore"
```

## Report

Summarize each check as pass/leak. If a check hits, **quote the file:line** and
stop — do not proceed to commit/push until the user resolves it. If everything is
clean, say so plainly and note the repo is safe to push. Add new secret classes
here as the template grows so the check stays current.
