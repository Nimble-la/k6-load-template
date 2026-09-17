/**
 * Ambient declarations: the remote k6 jslib module (no bundled types) and the
 * cross-module globals set at init / during a VU iteration. This file is a
 * script (no imports/exports) so every declaration is global.
 */

declare module "https://jslib.k6.io/k6-utils/1.1.0/index.js" {
    export function randomIntBetween(min: number, max: number): number;
    export function randomString(length: number): string;
    export function uuidv4(): string;
}

/** Scratch space for values shared within a VU iteration. */
declare var VARS: unknown[];
/** Minimum think-time between requests, in seconds. */
declare var PAUSE_MIN: number;
/** Maximum think-time between requests, in seconds. */
declare var PAUSE_MAX: number;
/** Bearer token captured at login and reused by later requests. */
declare var token: string;
