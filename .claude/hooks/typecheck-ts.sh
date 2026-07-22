#!/usr/bin/env bash
# PostToolUse(Edit|Write|MultiEdit) hook.
# When a TypeScript file is edited, run the project's typecheck so type errors
# surface immediately. k6 transpiles TS without type-checking it, so `tsc` is the
# project's real type safety net.
#
# The hook receives the tool event as JSON on stdin. On a failed typecheck it
# exits with code 2, feeding the errors back to Claude so they get fixed.
set -uo pipefail

input=$(cat)

# Extract the edited file path from the event JSON.
if command -v jq >/dev/null 2>&1; then
    file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_response.filePath // ""')
else
    file=$(printf '%s' "$input" | grep -oE '"file_path"[[:space:]]*:[[:space:]]*"[^"]+"' | head -1 | sed -E 's/.*"([^"]+)"$/\1/')
fi

# Only act on TypeScript files; ignore JSON, Markdown, etc.
case "$file" in
    *.ts) ;;
    *) exit 0 ;;
esac

# Run the project's typecheck. Surface failures to Claude via exit code 2.
out=$(npm --silent run typecheck 2>&1) || {
    echo "TypeScript typecheck failed after editing $file:" >&2
    echo "$out" >&2
    exit 2
}

exit 0
