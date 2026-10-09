import type { CapabilityKind, Operation, OperationWire, ResourceDomain } from "./types.js";

/**
 * Normalizes an operation candidate into its canonical wire representation.
 */
export function toOperationWire(op: Operation | OperationWire): OperationWire {
  if ("capability" in op && "resource_domain" in op && "resource_value" in op) {
    return op;
  }

  const typed = op as Operation;
  return {
    capability: typed.capability,
    resource_domain: typed.resourceDomain,
    resource_value: typed.resourceValue,
  };
}

/**
 * Creates a generic requested operation candidate.
 */
export function createOperation(
  capability: CapabilityKind,
  resourceDomain: ResourceDomain,
  resourceValue: string,
): Operation {
  return {
    capability,
    resourceDomain,
    resourceValue,
  };
}

/**
 * Creates a filesystem read operation.
 */
export function fileRead(path: string): Operation {
  return createOperation("read", "filesystem", path);
}

/**
 * Creates a filesystem write operation.
 */
export function fileWrite(path: string): Operation {
  return createOperation("write", "filesystem", path);
}

/**
 * Creates a network connect operation.
 */
export function netConnect(host: string): Operation {
  return createOperation("connect", "network", host);
}

/**
 * Creates a process spawn operation.
 */
export function procSpawn(processIdentifier: string): Operation {
  return createOperation("spawn", "process", processIdentifier);
}

/**
 * Creates a process execute operation.
 */
export function procExecute(processIdentifier: string): Operation {
  return createOperation("execute", "process", processIdentifier);
}

/**
 * Creates a secret access operation.
 */
export function secretAccess(secretReference: string): Operation {
  return createOperation("access", "secret", secretReference);
}

/**
 * Creates an environment variable read operation.
 */
export function envRead(variableName: string): Operation {
  return createOperation("read", "env", variableName);
}

/**
 * Creates a device access operation (e.g. "camera", "microphone").
 */
export function deviceAccess(deviceIdentifier: string): Operation {
  return createOperation("access", "device", deviceIdentifier);
}
