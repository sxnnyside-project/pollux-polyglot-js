import { checkStatus } from "../errors.js";
import type { PolluxFfiDriver } from "./driver.js";

// biome-ignore lint/suspicious/noExplicitAny: Bun runtime global
declare const Bun: any;

// biome-ignore lint/suspicious/noExplicitAny: Dynamic loading of bun:ffi prevents Node.js bundler crashes
function getBunFfi(): any {
  if (typeof Bun === "undefined") {
    throw new Error("Bun runtime required for BunFfiDriver");
  }
  // biome-ignore lint/suspicious/noExplicitAny: import.meta.require in Bun
  return (import.meta as any).require(String("bun:ffi"));
}

/**
 * Native FFI driver implementation for Bun.
 */
export class BunFfiDriver implements PolluxFfiDriver {
  public readonly name = "bun";
  // biome-ignore lint/suspicious/noExplicitAny: Bun dynamic library symbols
  private symbols: any;
  // biome-ignore lint/suspicious/noExplicitAny: Bun FFI module
  private ffi: any;

  constructor(libraryPath: string) {
    this.ffi = getBunFfi();
    const { dlopen, FFIType } = this.ffi;

    const lib = dlopen(libraryPath, {
      pollux_abi_version: {
        args: [],
        returns: FFIType.cstring,
      },
      pollux_core_version: {
        args: [],
        returns: FFIType.cstring,
      },
      pollux_engine_create: {
        args: [FFIType.ptr, FFIType.u64, FFIType.ptr],
        returns: FFIType.i32,
      },
      pollux_engine_evaluate: {
        args: [FFIType.ptr, FFIType.ptr, FFIType.u64, FFIType.ptr],
        returns: FFIType.i32,
      },
      pollux_string_free: {
        args: [FFIType.ptr],
        returns: FFIType.void,
      },
      pollux_engine_destroy: {
        args: [FFIType.ptr],
        returns: FFIType.void,
      },
    });
    this.symbols = lib.symbols;
  }

  public abiVersion(): string {
    return String(this.symbols.pollux_abi_version());
  }

  public coreVersion(): string {
    return String(this.symbols.pollux_core_version());
  }

  public createEngine(manifestBytes: Uint8Array): bigint {
    const { ptr } = this.ffi;
    const outEngine = new BigUint64Array(1);
    const manifestPtr = manifestBytes.byteLength > 0 ? ptr(manifestBytes) : 0;
    const status = this.symbols.pollux_engine_create(
      manifestPtr,
      BigInt(manifestBytes.byteLength),
      ptr(outEngine),
    );

    checkStatus(Number(status), "pollux_engine_create");
    return outEngine[0] ?? 0n;
  }

  public evaluate(engineHandle: unknown, operationJsonBytes: Uint8Array): string {
    const { ptr, CString } = this.ffi;
    const outResult = new BigUint64Array(1);
    const opPtr = operationJsonBytes.byteLength > 0 ? ptr(operationJsonBytes) : 0;
    const status = this.symbols.pollux_engine_evaluate(
      engineHandle,
      opPtr,
      BigInt(operationJsonBytes.byteLength),
      ptr(outResult),
    );

    checkStatus(Number(status), "pollux_engine_evaluate");

    const resultPtr = outResult[0] ?? 0n;
    if (resultPtr === 0n) {
      return "";
    }

    try {
      const cstr = new CString(resultPtr);
      return cstr.toString();
    } finally {
      this.symbols.pollux_string_free(resultPtr);
    }
  }

  public destroyEngine(engineHandle: unknown): void {
    if (engineHandle) {
      this.symbols.pollux_engine_destroy(engineHandle);
    }
  }
}
