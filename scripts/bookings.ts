import { sleep, group } from "k6";
import http from "k6/http";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { checkStatus } from "../common/utils.ts";
import { path } from "../config/path.ts";
import env from "../config/env.ts";

/**
 * Fetches the bookings list using the token captured at login.
 *
 * @returns Nothing.
 */
export function bookings(): void {
    group("GET - Bookings", () => {
        const response = http.get(`${env.HOST}${path.bookings}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${globalThis.token}`,
            },
        });

        checkStatus({
            response,
            expectedStatus: 200,
            failOnError: true,
            printOnError: true,
        });
    });

    sleep(randomIntBetween(globalThis.PAUSE_MIN, globalThis.PAUSE_MAX));
}
