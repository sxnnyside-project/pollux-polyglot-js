import koffi from "koffi";
import { checkStatus } from "../errors.js";
import type { PolluxFfiDriver } from "./driver.js";

/**
 * Native FFI driver implementation for Node.js using Koffi.
 */
export class NodeFfiDriver implements PolluxFfiDriver {
  public readonly name = "node";
  // biome-ignore lint/suspicious/noExplicitAny: Koffi functions
  private fnAbiVersion: any;
  // biome-ignore lint/suspicious/noExplicitAny: Koffi functions
  private fnCoreVersion: any;
  // biome-ignore lint/suspicious/noExplicitAny: Koffi functions
  private fnCreate: any;
  // biome-ignore lint/suspicious/noExplicitAny: Koffi functions
  private fnEvaluate: any;
  // biome-ignore lint/suspicious/noExplicitAny: Koffi functions
  private fnDestroy: any;

  constructor(libraryPath: string) {
    const lib = koffi.load(libraryPath);

    this.fnAbiVersion = lib.func("pollux_abi_version", "str", []);
    this.fnCoreVersion = lib.func("pollux_core_version", "str", []);
    this.fnCreate = lib.func("pollux_engine_create", "int", ["uint8_t*", "size_t", "_Out_ void**"]);
    this.fnEvaluate = lib.func("pollux_engine_evaluate", "int", [
      "void*",
      "uint8_t*",
      "size_t",
      "_Out_ str*",
    ]);
    this.fnDestroy = lib.func("pollux_engine_destroy", "void", ["void*"]);
  }

  public abiVersion(): string {
    return this.fnAbiVersion();
  }

  public coreVersion(): string {
    return this.fnCoreVersion();
  }

  public createEngine(manifestBytes: Uint8Array): unknown {
    const outEngine: [unknown] = [null];
    const status = this.fnCreate(manifestBytes, manifestBytes.byteLength, outEngine);

    checkStatus(status, "pollux_engine_create");
    return outEngine[0];
  }

  public evaluate(engineHandle: unknown, operationJsonBytes: Uint8Array): string {
    const outResult: [string | null] = [null];
    const status = this.fnEvaluate(
      engineHandle,
      operationJsonBytes,
      operationJsonBytes.byteLength,
      outResult,
    );

    checkStatus(status, "pollux_engine_evaluate");
    return outResult[0] ?? "";
  }

  public destroyEngine(engineHandle: unknown): void {
    if (engineHandle) {
      this.fnDestroy(engineHandle);
    }
  }
}
