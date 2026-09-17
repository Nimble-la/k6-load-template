import { check, fail } from "k6";
import type { RefinedResponse, ResponseType } from "k6/http";

/** Options for {@link checkStatus}. */
export interface CheckStatusOptions {
    response: RefinedResponse<ResponseType | undefined>;
    expectedStatus?: number;
    expectedContent?: string;
    failOnError?: boolean;
    printOnError?: boolean;
    dynamicIds?: string[];
}

/**
 * Asserts a response's status and/or body content with k6 `check`, optionally
 * logging the body and failing the iteration on mismatch. Dynamic id segments in
 * the URL are collapsed to `[id]` so checks aggregate under one name.
 *
 * @param options - The response and expectations (see {@link CheckStatusOptions}).
 * @returns Nothing.
 */
export function checkStatus(options: CheckStatusOptions): void {
    const { response, expectedStatus, expectedContent, failOnError, printOnError, dynamicIds } = options;

    if (expectedStatus === undefined && !expectedContent) {
        console.warn(`No expected status or content specified in checkStatus for URL ${response.url}`);
        return;
    }

    let url = response.url;
    if (dynamicIds) {
        for (const id of dynamicIds) {
            if (url.includes(id)) {
                url = url.replace(id, "[id]");
            }
        }
    }

    let statusOk = true;
    let contentOk = true;

    if (expectedStatus !== undefined) {
        statusOk = check(response, {
            [`${response.request.method} ${url} status ${expectedStatus}`]: (r) => r.status === expectedStatus,
        });
    }

    if (expectedContent) {
        contentOk = check(response, {
            [`"${expectedContent}" in ${url} response`]: (r) => String(r.body).includes(expectedContent),
        });
    }

    if (statusOk && contentOk) {
        return;
    }

    if (printOnError && response.body) {
        console.log(`Unexpected response: ${response.body}`);
    }

    if (failOnError) {
        if (!statusOk && !contentOk) {
            fail(`${response.request.method} ${url}: expected status ${expectedStatus} and "${expectedContent}" in body`);
        } else if (!statusOk) {
            fail(`Received unexpected status ${response.status} for ${url}, expected ${expectedStatus}`);
        } else {
            fail(`"${expectedContent}" not found in response for ${url}`);
        }
    }
}
