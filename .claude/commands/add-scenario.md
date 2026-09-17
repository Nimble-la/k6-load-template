---
description: Scaffold a new k6 scenario (and its request functions) following the template's layer architecture.
argument-hint: <scenario description> (e.g. "browse then create a booking under load")
---

Scaffold a new k6 scenario for: **$ARGUMENTS**

Use the `add-scenario` skill and follow this project's layers exactly (see
`CLAUDE.md`). Do not call `http` directly from a scenario and do not hardcode
hosts or credentials.

1. **Route.** Add any new endpoint to `config/path.ts`.
2. **Types.** Model request/response bodies in `config/types.ts`.
3. **Request function(s).** Add `scripts/<name>.ts` — wrap in `group(...)`, use
   `http`, read `env`/`path`, assert with `checkStatus`, `sleep` for think-time,
   and import local modules with the `.ts` extension.
4. **Scenario.** Add `scenarios/<name>.ts` composing the request functions.
5. **Wire it.** Re-export the scenario from `main.ts` and reference it by name in
   a profile's `exec` in `config/profiles/*.json`.
6. **Verify.** Run `npm run typecheck`, then a light run to confirm it executes.
7. **README.** Document the new scenario/profile in `README.md`.

Document new functions with the `document-functions` skill.
