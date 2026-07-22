import type { Options } from "k6/options";
import { thresholds } from "./config/thresholds.ts";

// Scenarios must be re-exported so k6 can resolve each scenario's `exec` target.
export { scenario1 } from "./scenarios/scenario1.ts";

// Load the test profile (overridable with CONFIG_FILE) and use it as options.
const configFile = __ENV.CONFIG_FILE || "./config/profiles/load.json";
const testConfig = JSON.parse(open(configFile)) as Options;

// Apply the baseline SLOs, letting a profile override any threshold it sets.
export const options: Options = {
    ...testConfig,
    thresholds: { ...thresholds, ...testConfig.thresholds },
};

// Global scratch space and think-time bounds (seconds), overridable via env.
globalThis.VARS = [];
globalThis.PAUSE_MIN = Number(__ENV.PAUSE_MIN) || 5;
globalThis.PAUSE_MAX = Number(__ENV.PAUSE_MAX) || 10;

/** Fallback entry point when the loaded config defines no scenarios. */
export default function (): void {
    console.log("No scenarios found in the config file. Executing default function...");
}
