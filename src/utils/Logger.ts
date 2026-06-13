/**
 * Centralized logger for the TitanGrid widget.
 *
 * In development mode (`process.env.NODE_ENV !== 'production'`) all levels log
 * to the browser console. In production builds warnings and debug messages are
 * suppressed — only errors are emitted.
 *
 * Usage:
 *   import { Logger } from "./Logger";
 *   Logger.warn("Something went wrong", details);
 *   Logger.error("Fatal problem", error);
 */

const DEV = typeof process !== "undefined" && process.env && process.env.NODE_ENV !== "production";

export const Logger = {
    /** Always emitted (both dev & prod) */
    error(message: string, ...args: any[]) {
        console.error(`[TitanGrid] ${message}`, ...args);
    },

    /** Only emitted in development builds */
    warn(message: string, ...args: any[]) {
        if (DEV) {
            console.warn(`[TitanGrid] ${message}`, ...args);
        }
    },

    /** Only emitted in development builds */
    debug(message: string, ...args: any[]) {
        if (DEV) {
            console.log(`[TitanGrid] ${message}`, ...args);
        }
    }
};
