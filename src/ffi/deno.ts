import { checkStatus } from "../errors.js";
import type { PolluxFfiDriver } from "./driver.js";

// biome-ignore lint/suspicious/noExplicitAny: Deno global is ambient across runtimes
declare const Deno: any;

/**
 * Native FFI driver implementation for Deno.
 */
export class DenoFfiDriver implements PolluxFfiDriver {
  public readonly name = "deno";
  // biome-ignore lint/suspicious/noExplicitAny: Deno dynamic library handle
  private lib: any;

  constructor(libraryPath: string) {
    if (typeof Deno === "undefined" || !Deno.dlopen) {
      throw new Error("Deno FFI is not available in this runtime environment");
    }

    this.lib = Deno.dlopen(libraryPath, {
      pollux_abi_version: {
        parameters: [],
        result: "pointer",
      },
      pollux_core_version: {
        parameters: [],
        result: "pointer",
      },
      pollux_engine_create: {
        parameters: ["buffer", "usize", "buffer"],
        result: "i32",
      },
      pollux_engine_evaluate: {
        parameters: ["pointer", "buffer", "usize", "buffer"],
        result: "i32",
      },
      pollux_string_free: {
        parameters: ["pointer"],
        result: "void",
      },
      pollux_engine_destroy: {
        parameters: ["pointer"],
        result: "void",
      },
    });
  }

  public abiVersion(): string {
    const ptr = this.lib.symbols.pollux_abi_version();
    if (!ptr) return "";
    return new Deno.UnsafePointerView(ptr).getCString();
  }

  public coreVersion(): string {
    const ptr = this.lib.symbols.pollux_core_version();
    if (!ptr) return "";
    return new Deno.UnsafePointerView(ptr).getCString();
  }

  public createEngine(manifestBytes: Uint8Array): unknown {
    const outEngine = new BigUint64Array(1);
    const status = this.lib.symbols.pollux_engine_create(
      manifestBytes,
      BigInt(manifestBytes.byteLength),
      outEngine,
    );

    checkStatus(status, "pollux_engine_create");
    const handleVal = outEngine[0] ?? 0n;
    return Deno.UnsafePointer.create(handleVal);
  }

  public evaluate(engineHandle: unknown, operationJsonBytes: Uint8Array): string {
    const outResult = new BigUint64Array(1);
    const status = this.lib.symbols.pollux_engine_evaluate(
      engineHandle,
      operationJsonBytes,
      BigInt(operationJsonBytes.byteLength),
      outResult,
    );

    checkStatus(status, "pollux_engine_evaluate");

    const rawPtr = outResult[0] ?? 0n;
    if (rawPtr === 0n) {
      return "";
    }

    const ptrObj = Deno.UnsafePointer.create(rawPtr);
    try {
      return new Deno.UnsafePointerView(ptrObj).getCString();
    } finally {
      this.lib.symbols.pollux_string_free(ptrObj);
    }
  }

  public destroyEngine(engineHandle: unknown): void {
    if (engineHandle) {
      this.lib.symbols.pollux_engine_destroy(engineHandle);
    }
  }

  public close(): void {
    if (this.lib) {
      this.lib.close();
      this.lib = null;
    }
  }
}
