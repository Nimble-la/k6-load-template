import { login } from "../scripts/login.ts";
import { bookings } from "../scripts/bookings.ts";

/**
 * Example VU journey: log in once, then read the bookings list a few times.
 *
 * @returns Nothing.
 */
export function scenario1(): void {
    login();

    for (let i = 0; i < 5; i++) {
        bookings();
    }
}
