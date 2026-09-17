---
name: document-functions
description: >-
  Document TypeScript functions with JSDoc in this k6 template's exact house
  style: a description, a blank line, then `@param name - description.` and
  `@returns`, written in English, with NO types in the JSDoc (types live in the
  TypeScript signature). Use this skill whenever the user asks to document
  functions, add JSDoc / docstrings / comments to functions, document a new
  request function, scenario or helper, or bring undocumented code in
  `scripts/`, `scenarios/`, `common/` or `config/` up to the project's
  documentation standard — even if they just say "document this".
---

# Document functions

This project documents every function with a JSDoc block in one consistent
style. Reproduce that style **exactly** so the codebase stays uniform, without
touching the function's behaviour. The reference is the code already written in
`common/utils.ts`, `scripts/login.ts` and `scripts/bookings.ts` — when in doubt,
open those and match what you see.

## The house style

A JSDoc block sits directly above the function, with the same indentation. It has
three parts, in order:

1. A short **description** of what the function does (one or two lines).
2. A **blank ` *` line**.
3. The **tags**: one `@param` per parameter, then a single `@returns`.

```ts
/**
 * Fetches the bookings list using the token captured at login.
 *
 * @returns Nothing.
 */
export function bookings(): void {
```

If a function takes no parameters, omit the `@param` lines (keep the description
and `@returns`). For a function that takes an options object, document the object
parameter once and let the `interface` carry the field docs.

## Rules (and why they matter)

- **No types in the JSDoc.** Write `@param response - The raw response.`, never
  `@param {Response} response`. This is a TypeScript project — the types already
  live in the signature; duplicating them just drifts out of sync.
- **`@param` format is `name - description.`** — a hyphen with a space on each
  side, a descriptive phrase, and a trailing period.
- **English, imperative or descriptive.** Short and direct; no first person, no
  filler.
- **One `@param` per parameter, in signature order**, and a single `@returns`.
  Describe what the return *means*. For `void` helpers, `@returns Nothing.` is
  fine.
- **Document behaviour, not implementation.**
- **Never change the code.** This skill only adds or fixes the comment block —
  no renames, reordering, or logic changes.

## Workflow

1. **Scope.** If the user named functions or a file, document those; otherwise
   scan `scripts/*.ts`, `scenarios/*.ts`, `common/*.ts` for functions with
   missing/stale/wrong-style JSDoc.
2. **Read the signature first** so `@param` names and order match exactly.
3. **Write the block** in the style above, directly above the function.
4. **Verify** with `npm run typecheck` — JSDoc is comments, so types should be
   unaffected; if typecheck fails you changed code you shouldn't have.
