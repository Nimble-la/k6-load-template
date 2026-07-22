# CLAUDE.md

Guide for working in this repository. This project is a **k6 load / stress test
template**, written in **TypeScript** and executed by **k6 v1.0+**, which runs
TypeScript natively (no build step). The goal of this file is that any new
functionality (scenarios, request functions, helpers) is written following the
template's conventions **exactly**.

> **Philosophy:** small, typed, layered. k6 transpiles the `.ts` directly;
> `@types/k6` provides the types and `tsc --noEmit` is the type safety net.

---

## Stack and commands

- **TypeScript** (ESM, `"type": "module"`), types from **`@types/k6`**.
- **k6** — the load-test runtime (installed via `brew install k6`, **not** an npm
  package). Runs `main.ts` directly.
- **env-cmd** — loads `.env` into the environment before k6 runs (k6 doesn't read
  `.env` itself; it reads the process env via `__ENV`).

Commands:

- `npm test` — `env-cmd k6 run main.ts` (loads `.env`, runs the profile).
- `npm run typecheck` — `tsc --noEmit`.

> No build step: k6 executes the `.ts` files directly.

### Environment variables

Config comes from the environment, never committed. `env-cmd` loads `.env` (copy
`.env.example`), k6 exposes it as `__ENV`, and [config/env.ts](config/env.ts)
maps it to a typed object. Required: `HOST`, `USERNAME`, `PWD`. Optional:
`PAUSE_MIN`, `PAUSE_MAX`, `CONFIG_FILE`. Pass `-e VAR=value` to k6 to override.

---

## Project structure

```
config/
  env.ts        # Typed env read from __ENV (no secrets)
  path.ts       # Endpoint routes
  types.ts      # Domain types (request/response bodies)
  thresholds.ts # Baseline SLOs merged into every run
  profiles/     # Load profiles (smoke/load/stress/spike/soak) — pick via CONFIG_FILE
common/
  utils.ts     # Reusable helpers (checkStatus)
scripts/       # Request functions, one per operation (login, bookings, …)
scenarios/     # VU journeys that compose request functions
main.ts        # Entry point: loads the profile + re-exports the scenarios
globals.d.ts   # Ambient types (remote jslib module + globals)
```

### Responsibility of each layer

1. **`config/*`** — Static config. Routes in `path.ts`, types in `types.ts`, env
   in `env.ts` (from `__ENV` only). Load profiles are JSON under `profiles/`
   (`smoke`/`load`/`stress`/`spike`/`soak`); baseline SLOs live in `thresholds.ts`
   and are merged into every run by `main.ts`.
2. **`common/utils.ts`** — Generic, domain-agnostic helpers. `checkStatus`
   asserts a response's status/content with k6 `check`, and `fail`s the iteration
   when `failOnError` is set.
3. **`scripts/*`** — One request function per API operation. Each wraps the call
   in a k6 `group(...)`, uses `http` for the request, `checkStatus` for the
   assertion, and reads `env` + `path`. They mutate shared state (e.g.
   `globalThis.token`) as needed within an iteration.
4. **`scenarios/*`** — VU journeys that call request functions in order. Each
   exported scenario is referenced by name from a profile's `exec`.
5. **`main.ts`** — Loads the profile JSON as `options`, re-exports every scenario
   (so k6 can resolve each `exec` target), and sets the global think-time bounds.

---

## Code conventions (MANDATORY)

- **Everything in TypeScript.** Type everything you can; prefer `unknown` over
  `any`. 4-space indent, double quotes, semicolons.
- **Local imports use an explicit `.ts` extension** (e.g.
  `import { path } from "../config/path.ts";`). k6 requires it — extensionless
  local imports fail to resolve.
- **Never hardcode config or secrets.** Host, credentials and routes come from
  `env`/`path`, which read `__ENV` / `config`. No literal hosts, emails,
  passwords or tokens in code.
- **Assertions go through `checkStatus`** (from `common/utils.ts`), not raw
  `check` scattered in request functions.
- **Document functions with JSDoc** in the house style (description, blank line,
  `@param name - description.`, `@returns`; no types in the JSDoc — see the
  `document-functions` skill).
- Keep the section banners where present (`/** DOMAIN TYPES */`, etc.).

---

## How to add a new scenario / endpoint (recipe)

1. **Route.** Add the endpoint to [config/path.ts](config/path.ts).
2. **Types.** Model the request/response in [config/types.ts](config/types.ts).
3. **Request function.** Add `scripts/<name>.ts` exporting a function that wraps
   the call in a `group(...)`, uses `http`, asserts with `checkStatus`, and reads
   `env`/`path`. Import local modules with the `.ts` extension.
4. **Scenario.** Compose the request function(s) in a `scenarios/<name>.ts`
   export (or add to an existing scenario).
5. **Wire it.** Re-export the scenario from [main.ts](main.ts) and reference it by
   name in a profile's `exec` (in [config/profiles/](config/profiles/)).
6. **Verify.** `npm run typecheck`, then a light run (`CONFIG_FILE` pointing at a
   small profile) to confirm it executes.
7. **README.** If you added a scenario or a load profile, document it (see below).

The `add-scenario` skill / `/add-scenario` command scaffold this for you.

---

## Keeping the README in sync (MANDATORY)

Whenever you make a **structural change**, update `README.md` in the **same**
change so it always reflects the current state. This includes: **a new scenario
or load profile** (document how to run it), and any new/removed dependency,
`package.json` script, env var, config file, or change to the layers / `.claude/`
tooling. Adding a request function to an existing scenario doesn't by itself need
a README change; a new scenario or profile does.

---

## Rules for the agent

- Respect the layer separation: `config` → `common` → `scripts` → `scenarios` →
  `main`. Do not mix responsibilities.
- Do not add dependencies without justification; k6 ships its APIs (`k6`,
  `k6/http`, …) and the jslib is imported remotely.
- Never hardcode secrets/hosts; everything sensitive comes from `__ENV`.
- After any structural change, update `README.md` in the same change.
- Run `npm run typecheck` before considering a change done.
