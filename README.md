# k6-load-template

AI-augmented **k6** load / stress test template, written in **TypeScript**. k6
v1.0+ runs TypeScript natively, so there is no build step — you run `main.ts`
directly. `@types/k6` provides the types and `tsc --noEmit` type-checks.

## Install k6

```bash
brew install k6
```

## Install dev dependencies (types + typecheck)

```bash
npm install
```

## Configuration

Config is provided through **environment variables** — nothing is committed.
k6 doesn't read `.env` files itself, so `npm test` runs k6 through **env-cmd**,
which loads `.env` into the environment; k6 then reads it via `__ENV` (see
`config/env.ts`). Create your `.env` from the template:

```bash
cp .env.example .env    # then fill in HOST / USERNAME / PWD
```

**Load profiles** (executors, stages, rates) live in `config/profiles/` and are
loaded as k6 `options` at startup. Baseline SLOs from `config/thresholds.ts` are
merged into every run (a profile can override them).

| Profile | Shape |
| --- | --- |
| `smoke` | 1 VU, 1 iteration — sanity check |
| `load` | ramp to steady expected load, hold, ramp down (default) |
| `stress` | ramp beyond normal to find the breaking point |
| `spike` | sudden burst of VUs, then back down |
| `soak` | steady load sustained for a long time (30m) |

## Run

```bash
npm test            # default profile (load), loads .env
npm run test:smoke  # sanity check
npm run test:load
npm run test:stress
npm run test:spike
npm run test:soak
```

Each `test:*` script selects its profile with `-e CONFIG_FILE=config/profiles/<name>.json`.

Without a `.env`, run k6 directly and pass the variables with `-e` (these also
override any `.env` value):

```bash
k6 run -e HOST=https://api.example.com -e USERNAME=admin -e PWD=secret main.ts
```

Optional variables (in `.env` or via `-e`):

- `PAUSE_MIN` / `PAUSE_MAX` — think-time bounds between requests, in seconds
  (default 5 / 10).
- `CONFIG_FILE` — path to a profile JSON (default `config/profiles/load.json`).

> ⚠️ Only run `stress` / `spike` / `soak` against infrastructure you own or a
> self-hosted target. Don't hammer shared public demo APIs.

## Type checking

```bash
npm run typecheck
```

## Structure

```
config/
  env.ts        # Env vars (HOST/USERNAME/PWD) read from __ENV — no secrets
  path.ts       # Endpoint routes
  types.ts      # Domain types
  thresholds.ts # Baseline SLOs merged into every run
  profiles/     # Load profiles: smoke / load / stress / spike / soak
common/
  utils.ts     # Reusable helpers (checkStatus)
scripts/       # Request functions (login, bookings, …)
scenarios/     # VU journeys composing the request functions
main.ts        # Entry point: loads the profile + re-exports scenarios
```
