#!/usr/bin/env bash
# PreToolUse(Bash) guard.
# Blocks any bash command that reads or modifies the project's `.env` file,
# which holds secrets (HOST/USERNAME/PWD). The `.env.example` template and vars
# like `.environment` are intentionally allowed.
#
# The hook receives the tool event as JSON on stdin. Exiting with code 2 blocks
# the tool call and feeds the stderr message back to Claude.
set -uo pipefail

input=$(cat)

# Extract the bash command from the event JSON.
if command -v jq >/dev/null 2>&1; then
    cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""')
else
    cmd="$input"
fi

# Match a ".env" token NOT followed by another filename char, so ".env", ".env"
# at end of line, "> .env" match, but ".env.example" and ".environment" do not.
if printf '%s' "$cmd" | grep -Eq '\.env([^.A-Za-z0-9]|$)'; then
    echo "Blocked: this command touches .env, which holds secrets. Use .env.example for templates; secrets should only be read by the app at runtime." >&2
    exit 2
fi

exit 0
