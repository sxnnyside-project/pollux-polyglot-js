/**
 * Driver interface abstracting FFI mechanics across JavaScript runtimes (Bun, Deno, Node.js).
 */
export interface PolluxFfiDriver {
  /**
   * Name of the active runtime driver ("bun", "deno", or "node").
   */
  readonly name: string;

  /**
   * Calls `pollux_abi_version()`.
   */
  abiVersion(): string;

  /**
   * Calls `pollux_core_version()`.
   */
  coreVersion(): string;

  /**
   * Calls `pollux_engine_create(manifest_ptr, manifest_len, &out_engine)`.
   * Returns an opaque engine handle pointer.
   */
  createEngine(manifestBytes: Uint8Array): unknown;

  /**
   * Calls `pollux_engine_evaluate(engine, op_ptr, op_len, &out_result)`.
   * Returns the decoded UTF-8 result JSON string, freeing the original C string.
   */
  evaluate(engineHandle: unknown, operationJsonBytes: Uint8Array): string;

  /**
   * Calls `pollux_engine_destroy(engine)`.
   */
  destroyEngine(engineHandle: unknown): void;

  /**
   * Closes the underlying dynamic library if supported by the runtime (e.g. Deno).
   */
  close?(): void;
}
