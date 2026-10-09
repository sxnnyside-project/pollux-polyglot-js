import { promises as fsPromises, readFileSync } from "node:fs";
import { PolluxAbiMismatchError, PolluxEngineDisposedError } from "./errors.js";
import { type PolluxFfiDriver, createDriver, createDriverSync } from "./ffi/index.js";
import { resolveLibraryPath } from "./loader.js";
import { toOperationWire } from "./operation.js";
import {
  EXPECTED_ABI_VERSION,
  type EngineOptions,
  type EvaluationResult,
  type EvaluationTraceWire,
  type Operation,
  type OperationWire,
} from "./types.js";

const textEncoder = new TextEncoder();

/**
 * Pollux Deterministic Execution Authority Engine instance.
 *
 * Wraps a native Core AuthorityEngine through the FFI boundary, providing
 * memory-safe evaluation and deterministic resource disposal.
 */
export class PolluxEngine {
  private driver: PolluxFfiDriver;
  private handle: unknown;
  private destroyed = false;

  private constructor(driver: PolluxFfiDriver, handle: unknown) {
    this.driver = driver;
    this.handle = handle;

    // Verify ABI compatibility immediately on construction
    const actualAbi = this.driver.abiVersion();
    if (actualAbi !== EXPECTED_ABI_VERSION) {
      this.destroy();
      throw new PolluxAbiMismatchError(EXPECTED_ABI_VERSION, actualAbi);
    }
  }

  /**
   * Loads an AuthorityEngine asynchronously from an Authority Manifest (YAML string or bytes).
   */
  public static async load(
    manifestYaml: string | Uint8Array,
    options: EngineOptions = {},
  ): Promise<PolluxEngine> {
    const libPath = resolveLibraryPath(options.libraryPath);
    const driver = await createDriver(libPath);
    const manifestBytes =
      typeof manifestYaml === "string" ? textEncoder.encode(manifestYaml) : manifestYaml;

    const handle = driver.createEngine(manifestBytes);
    return new PolluxEngine(driver, handle);
  }

  /**
   * Loads an AuthorityEngine synchronously from an Authority Manifest (YAML string or bytes).
   * Supported on Bun and Node.js.
   */
  public static loadSync(
    manifestYaml: string | Uint8Array,
    options: EngineOptions = {},
  ): PolluxEngine {
    const libPath = resolveLibraryPath(options.libraryPath);
    const driver = createDriverSync(libPath);
    const manifestBytes =
      typeof manifestYaml === "string" ? textEncoder.encode(manifestYaml) : manifestYaml;

    const handle = driver.createEngine(manifestBytes);
    return new PolluxEngine(driver, handle);
  }

  /**
   * Loads an AuthorityEngine from an Authority Manifest file path.
   */
  public static async fromFile(path: string, options: EngineOptions = {}): Promise<PolluxEngine> {
    const content = await fsPromises.readFile(path, "utf-8");
    return PolluxEngine.load(content, options);
  }

  /**
   * Loads an AuthorityEngine synchronously from an Authority Manifest file path.
   */
  public static fromFileSync(path: string, options: EngineOptions = {}): PolluxEngine {
    const content = readFileSync(path, "utf-8");
    return PolluxEngine.loadSync(content, options);
  }

  /**
   * The ABI version reported by the linked Pollux Core binary.
   */
  public get abiVersion(): string {
    return this.driver.abiVersion();
  }

  /**
   * The Core evaluation-model version reported by Pollux Core.
   */
  public get coreVersion(): string {
    return this.driver.coreVersion();
  }

  /**
   * Name of the underlying active FFI runtime driver ("bun", "deno", or "node").
   */
  public get driverName(): string {
    return this.driver.name;
  }

  /**
   * Whether this engine handle has already been destroyed.
   */
  public get isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * Evaluates an operation candidate against the authority rules in this engine.
   *
   * @param operation An operation candidate or raw OperationWire object.
   * @returns A strongly-typed EvaluationResult with deterministic trace.
   */
  public evaluate(operation: Operation | OperationWire): EvaluationResult {
    if (this.destroyed) {
      throw new PolluxEngineDisposedError();
    }

    const wire = toOperationWire(operation);
    const opJsonString = JSON.stringify(wire);
    const opBytes = textEncoder.encode(opJsonString);

    const traceJsonString = this.driver.evaluate(this.handle, opBytes);
    const trace = JSON.parse(traceJsonString) as EvaluationTraceWire;

    return {
      allowed: trace.decision.outcome === "allow",
      outcome: trace.decision.outcome === "allow" ? "allow" : "deny",
      reason: trace.decision.reason,
      trace,
    };
  }

  /**
   * Destroys this engine handle and releases all associated native memory.
   * Safe to call multiple times (subsequent calls are no-ops).
   */
  public destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    if (this.handle) {
      this.driver.destroyEngine(this.handle);
      this.handle = null;
    }
    this.driver.close?.();
  }

  /**
   * Explicit Resource Management support (TypeScript 5.2+ `using` keyword).
   */
  [Symbol.dispose](): void {
    this.destroy();
  }
}
