import { sleep, group } from "k6";
import http from "k6/http";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { checkStatus } from "../common/utils.ts";
import { path } from "../config/path.ts";
import env from "../config/env.ts";
import type { LoginResponse } from "../config/types.ts";

/**
 * Authenticates against the auth endpoint and stores the returned token on
 * `globalThis.token` for later requests in the iteration.
 *
 * @returns Nothing.
 */
export function login(): void {
    group("POST - Login", () => {
        const payload = JSON.stringify({ username: env.USERNAME, password: env.PWD });

        const response = http.post(`${env.HOST}${path.auth}`, payload, {
            headers: { "Content-Type": "application/json" },
        });

        checkStatus({
            response,
            expectedStatus: 200,
            failOnError: true,
            printOnError: true,
        });

        const body = JSON.parse(response.body as string) as LoginResponse;
        globalThis.token = body.token;
    });

    sleep(randomIntBetween(globalThis.PAUSE_MIN, globalThis.PAUSE_MAX));
}
