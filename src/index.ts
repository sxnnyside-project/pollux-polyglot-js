// Core engine and lifecycle
export { PolluxEngine } from "./engine.js";

// Operation builders and utilities
export {
  createOperation,
  fileRead,
  fileWrite,
  netConnect,
  procSpawn,
  procExecute,
  secretAccess,
  envRead,
  deviceAccess,
  toOperationWire,
} from "./operation.js";

// Library resolution
export { resolveLibraryPath, getPlatformLibraryName } from "./loader.js";

// Driver abstraction
export { createDriver, createDriverSync, type PolluxFfiDriver } from "./ffi/index.js";

// Types and constants
export {
  EXPECTED_ABI_VERSION,
  PROTOCOL_VERSION,
  PolluxStatus,
  type CapabilityKind,
  type ResourceDomain,
  type DecisionOutcome,
  type OperationWire,
  type ContractViolationWire,
  type DecisionWire,
  type EvaluationTraceWire,
  type Operation,
  type EvaluationResult,
  type EngineOptions,
} from "./types.js";

// Errors
export {
  PolluxError,
  PolluxNullArgumentError,
  PolluxInvalidUtf8Error,
  PolluxManifestError,
  PolluxOperationError,
  PolluxInternalError,
  PolluxAbiMismatchError,
  PolluxLibraryNotFoundError,
  PolluxEngineDisposedError,
} from "./errors.js";
