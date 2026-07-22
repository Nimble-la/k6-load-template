/** DOMAIN TYPES */

/** Runtime configuration read from k6 environment variables (see `env.ts`). */
export interface Env {
    HOST: string;
    USERNAME: string;
    PWD: string;
}

/** Body returned by the auth endpoint. */
export interface LoginResponse {
    token: string;
}
