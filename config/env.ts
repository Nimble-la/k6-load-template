import type { Env } from "./types.ts";

/**
 * Runtime configuration, read from k6 environment variables so no secrets are
 * committed. Provide them when running, e.g.:
 *
 *   k6 run -e HOST=https://api.example.com -e USERNAME=admin -e PWD=secret main.ts
 *
 * or export them in your shell before `npm test`.
 */
const env: Env = {
    HOST: __ENV.HOST ?? "",
    USERNAME: __ENV.USERNAME ?? "",
    PWD: __ENV.PWD ?? "",
};

export default env;
