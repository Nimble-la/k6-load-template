import type { Options } from "k6/options";

/**
 * Baseline SLOs applied to every run. main.ts merges these with any thresholds
 * a profile defines (the profile's values win on conflict). Tune per your
 * service's targets.
 */
export const thresholds: Options["thresholds"] = {
    // Less than 1% of requests may fail.
    http_req_failed: ["rate<0.01"],
    // 95% under 500ms, 99% under 1s.
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    // At least 99% of checks must pass.
    checks: ["rate>0.99"],
};
