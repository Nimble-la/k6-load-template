---
name: add-scenario
description: >-
  Scaffold a new k6 scenario (and the request functions it needs) following this
  template's layer architecture. Use whenever the user wants to add a load-test
  scenario, a new VU journey, or a request function for an endpoint to the k6
  template — e.g. "add a scenario for X", "test endpoint Y under load", "add a
  request for Z". Follows config → common → scripts → scenarios → main.
---

# Add a k6 scenario

Scaffold a new scenario end-to-end following this project's layers (see
`CLAUDE.md`). Do not call `http` directly from a scenario, do not hardcode hosts
or credentials, and keep everything typed.

## Layer flow (in order)

1. **Route.** If the endpoint is new, add it to `config/path.ts`.
2. **Types.** Model the request/response bodies in `config/types.ts`
   (`interface`/`type`).
3. **Request function.** Add `scripts/<name>.ts` exporting one function per
   operation. It must:
   - wrap the call in `group("METHOD - Name", () => { ... })`,
   - use `http` from `k6/http`,
   - read `env` (from `config/env.ts`) and `path` (from `config/path.ts`),
   - assert with `checkStatus` from `common/utils.ts`,
   - `sleep(randomIntBetween(globalThis.PAUSE_MIN, globalThis.PAUSE_MAX))` at the
     end for think-time,
   - import every local module with an explicit **`.ts`** extension.
4. **Scenario.** Add `scenarios/<name>.ts` exporting a function that composes the
   request functions in the order a VU would call them.
5. **Wire it up.**
   - Re-export the scenario from `main.ts`
     (`export { <name> } from "./scenarios/<name>.ts";`).
   - Reference it by name in a profile's `exec` in `config/profiles/*.json` (or a
     new profile JSON), inside a k6 executor block.
6. **Verify.** `npm run typecheck`, then a light run to confirm it executes:
   `CONFIG_FILE=<small-profile>.json npm test` (or `k6 run -e CONFIG_FILE=… main.ts`).
7. **README.** Document the new scenario/profile in `README.md` (mandatory for a
   new scenario — see `CLAUDE.md`).

## Reference shape

A request function (mirror the style of `scripts/login.ts` / `scripts/bookings.ts`):

```ts
import { sleep, group } from "k6";
import http from "k6/http";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { checkStatus } from "../common/utils.ts";
import { path } from "../config/path.ts";
import env from "../config/env.ts";

/**
 * <what it does>.
 *
 * @returns Nothing.
 */
export function <name>(): void {
    group("GET - <Name>", () => {
        const response = http.get(`${env.HOST}${path.<route>}`, {
            headers: { Authorization: `Bearer ${globalThis.token}` },
        });
        checkStatus({ response, expectedStatus: 200, failOnError: true, printOnError: true });
    });
    sleep(randomIntBetween(globalThis.PAUSE_MIN, globalThis.PAUSE_MAX));
}
```

A profile entry that runs a scenario (in a `config/profiles/*.json`):

```json
"my_scenario": {
  "executor": "constant-arrival-rate",
  "rate": 24, "timeUnit": "1s", "duration": "1m",
  "preAllocatedVus": 200, "maxVus": 300,
  "exec": "<scenarioName>"
}
```

## Rules

- Keep the layers separate; scenarios orchestrate, request functions do the HTTP.
- Type request/response bodies in `config/types.ts`; no `any`.
- No hardcoded host/credentials/tokens — read from `env`.
- Document new functions with the `document-functions` skill.
