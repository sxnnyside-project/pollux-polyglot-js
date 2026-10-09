/**
 * Canonical capability kinds recognized by the Pollux Domain Model.
 */
export type CapabilityKind = "read" | "write" | "connect" | "spawn" | "execute" | "access";

/**
 * Canonical resource domains recognized by the Pollux Domain Model.
 */
export type ResourceDomain = "filesystem" | "network" | "process" | "secret" | "env" | "device";

/**
 * Canonical evaluation decision outcome.
 */
export type DecisionOutcome = "allow" | "deny";

/**
 * Expected ABI version for binary compatibility verification.
 */
export const EXPECTED_ABI_VERSION = "pollux-abi/1";

/**
 * Supported protocol version.
 */
export const PROTOCOL_VERSION = "pollux-protocol/1";

/**
 * Status codes returned across the Pollux C-compatible ABI boundary.
 * Mirrors `enum PolluxStatus` in `pollux.h`.
 */
export enum PolluxStatus {
  Ok = 0,
  NullArgument = 1,
  InvalidUtf8 = 2,
  ManifestError = 3,
  OperationError = 4,
  InternalError = 5,
}

/**
 * Canonical wire shape of a single requested (Capability, Resource) pair.
 * Conforms to `OperationWire` in `pollux-protocol/1`.
 */
export interface OperationWire {
  capability: string;
  resource_domain: string;
  resource_value: string;
}

/**
 * Canonical wire shape of a single ContractViolation.
 */
export interface ContractViolationWire {
  contract_id: string;
  contract_description: string;
  detail: string;
}

/**
 * Canonical wire shape of a Decision.
 */
export interface DecisionWire {
  outcome: string;
  reason: string;
}

/**
 * Canonical wire shape of an EvaluationTrace.
 * Conforms to `EvaluationTraceWire` in `pollux-protocol/1`.
 */
export interface EvaluationTraceWire {
  protocol_version: string;
  engine_version: string;
  authority_identity: string;
  requested_operation: OperationWire;
  operation_declared: boolean;
  contracts_evaluated: number;
  violations: ContractViolationWire[];
  decision: DecisionWire;
}

/**
 * High-level requested operation candidate.
 */
export interface Operation {
  capability: CapabilityKind;
  resourceDomain: ResourceDomain;
  resourceValue: string;
}

/**
 * Strongly typed evaluation outcome returned by PolluxEngine.
 */
export interface EvaluationResult {
  /**
   * Whether the operation is authorized (`true` if outcome is `"allow"`).
   */
  readonly allowed: boolean;

  /**
   * Evaluated outcome: `"allow"` or `"deny"`.
   */
  readonly outcome: DecisionOutcome;

  /**
   * Human-readable rationale for the decision.
   */
  readonly reason: string;

  /**
   * Complete, deterministic evaluation trace received from Pollux Core.
   */
  readonly trace: EvaluationTraceWire;
}

/**
 * Options for initializing a PolluxEngine.
 */
export interface EngineOptions {
  /**
   * Explicit file path to the native `libpollux_ffi` binary.
   */
  libraryPath?: string;
}
