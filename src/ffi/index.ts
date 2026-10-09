import type { PolluxFfiDriver } from "./driver.js";

// biome-ignore lint/suspicious/noExplicitAny: Ambient runtime globals
declare const Bun: any;
// biome-ignore lint/suspicious/noExplicitAny: Ambient runtime globals
declare const Deno: any;

/**
 * Creates the appropriate FFI driver for the current JavaScript runtime.
 */
export async function createDriver(libraryPath: string): Promise<PolluxFfiDriver> {
  if (typeof Bun !== "undefined") {
    const { BunFfiDriver } = await import("./bun.js");
    return new BunFfiDriver(libraryPath);
  }

  if (typeof Deno !== "undefined") {
    const { DenoFfiDriver } = await import("./deno.js");
    return new DenoFfiDriver(libraryPath);
  }

  const { NodeFfiDriver } = await import("./node.js");
  return new NodeFfiDriver(libraryPath);
}

/**
 * Synchronous variant when running under Bun or Node.js.
 */
export function createDriverSync(libraryPath: string): PolluxFfiDriver {
  if (typeof Bun !== "undefined") {
    const { BunFfiDriver } = require("./bun.js");
    return new BunFfiDriver(libraryPath);
  }

  if (typeof Deno !== "undefined") {
    throw new Error(
      "Synchronous driver creation is not supported under Deno; use createDriver() async instead.",
    );
  }

  const { NodeFfiDriver } = require("./node.js");
  return new NodeFfiDriver(libraryPath);
}

export type { PolluxFfiDriver } from "./driver.js";
