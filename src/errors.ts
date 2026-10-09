import { PolluxStatus } from "./types.js";

/**
 * Base class for all Pollux errors.
 */
export class PolluxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PolluxError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a required argument passed across the ABI boundary was null or missing.
 */
export class PolluxNullArgumentError extends PolluxError {
  constructor(detail = "A required argument passed across the ABI was null or empty") {
    super(detail);
    this.name = "PolluxNullArgumentError";
  }
}

/**
 * Thrown when a string or buffer contains invalid UTF-8 sequences.
 */
export class PolluxInvalidUtf8Error extends PolluxError {
  constructor(detail = "A buffer passed across the ABI contained invalid UTF-8") {
    super(detail);
    this.name = "PolluxInvalidUtf8Error";
  }
}

/**
 * Thrown when an Authority Manifest cannot be parsed or violates schema / admissibility rules.
 */
export class PolluxManifestError extends PolluxError {
  constructor(detail = "Authority Manifest YAML could not be parsed into a valid Authority") {
    super(detail);
    this.name = "PolluxManifestError";
  }
}

/**
 * Thrown when an Operation candidate cannot be decoded into a valid domain operation.
 */
export class PolluxOperationError extends PolluxError {
  constructor(detail = "Operation candidate could not be decoded into a valid domain operation") {
    super(detail);
    this.name = "PolluxOperationError";
  }
}

/**
 * Thrown when an internal engine invariant is violated.
 */
export class PolluxInternalError extends PolluxError {
  constructor(detail = "An internal invariant in Pollux Core was violated") {
    super(detail);
    this.name = "PolluxInternalError";
  }
}

/**
 * Thrown when the linked Core artifact declares an incompatible ABI version.
 */
export class PolluxAbiMismatchError extends PolluxError {
  constructor(expected: string, actual: string) {
    super(
      `Pollux Core declared ABI version '${actual}', but this polyglot SDK was built against '${expected}'. Refusing to link against an incompatible ABI.`,
    );
    this.name = "PolluxAbiMismatchError";
  }
}

/**
 * Thrown when the native dynamic library `libpollux_ffi` cannot be resolved or loaded.
 */
export class PolluxLibraryNotFoundError extends PolluxError {
  constructor(searchedPaths: string[]) {
    super(
      `Could not find native Pollux Core library. Searched:\n${searchedPaths.map((p) => `  - ${p}`).join("\n")}\nSet POLLUX_CORE_LIB to the library path.`,
    );
    this.name = "PolluxLibraryNotFoundError";
  }
}

/**
 * Thrown when an operation is attempted on an already destroyed engine handle.
 */
export class PolluxEngineDisposedError extends PolluxError {
  constructor() {
    super("Attempted to evaluate against a PolluxEngine that has already been destroyed");
    this.name = "PolluxEngineDisposedError";
  }
}

/**
 * Maps a PolluxStatus numeric code to an appropriate PolluxError instance.
 */
export function checkStatus(status: number, context = ""): void {
  if (status === PolluxStatus.Ok) {
    return;
  }

  const prefix = context ? `${context}: ` : "";
  switch (status) {
    case PolluxStatus.NullArgument:
      throw new PolluxNullArgumentError(`${prefix}required argument was null`);
    case PolluxStatus.InvalidUtf8:
      throw new PolluxInvalidUtf8Error(`${prefix}invalid UTF-8 in argument`);
    case PolluxStatus.ManifestError:
      throw new PolluxManifestError(`${prefix}manifest parsing or admissibility rejected`);
    case PolluxStatus.OperationError:
      throw new PolluxOperationError(`${prefix}operation candidate rejected`);
    case PolluxStatus.InternalError:
      throw new PolluxInternalError(`${prefix}internal engine invariant violated`);
    default:
      throw new PolluxError(`${prefix}unknown status code ${status}`);
  }
}
