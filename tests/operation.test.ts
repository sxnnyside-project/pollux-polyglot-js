import { describe, expect, it } from "bun:test";
import {
  createOperation,
  deviceAccess,
  envRead,
  fileRead,
  fileWrite,
  netConnect,
  procExecute,
  procSpawn,
  secretAccess,
  toOperationWire,
} from "../src/operation.js";

describe("Operation Builders", () => {
  it("creates filesystem read operations", () => {
    const op = fileRead("/var/log/app.log");
    expect(op.capability).toBe("read");
    expect(op.resourceDomain).toBe("filesystem");
    expect(op.resourceValue).toBe("/var/log/app.log");

    const wire = toOperationWire(op);
    expect(wire.capability).toBe("read");
    expect(wire.resource_domain).toBe("filesystem");
    expect(wire.resource_value).toBe("/var/log/app.log");
  });

  it("creates filesystem write operations", () => {
    const op = fileWrite("/tmp/output.json");
    expect(op.capability).toBe("write");
    expect(op.resourceDomain).toBe("filesystem");
    expect(op.resourceValue).toBe("/tmp/output.json");
  });

  it("creates network connect operations", () => {
    const op = netConnect("api.github.com:443");
    expect(op.capability).toBe("connect");
    expect(op.resourceDomain).toBe("network");
    expect(op.resourceValue).toBe("api.github.com:443");
  });

  it("creates process spawn operations", () => {
    const op = procSpawn("/bin/sh");
    expect(op.capability).toBe("spawn");
    expect(op.resourceDomain).toBe("process");
    expect(op.resourceValue).toBe("/bin/sh");
  });

  it("creates process execute operations", () => {
    const op = procExecute("/usr/bin/git");
    expect(op.capability).toBe("execute");
    expect(op.resourceDomain).toBe("process");
    expect(op.resourceValue).toBe("/usr/bin/git");
  });

  it("creates secret access operations", () => {
    const op = secretAccess("DATABASE_URL");
    expect(op.capability).toBe("access");
    expect(op.resourceDomain).toBe("secret");
    expect(op.resourceValue).toBe("DATABASE_URL");
  });

  it("creates environment variable read operations", () => {
    const op = envRead("NODE_ENV");
    expect(op.capability).toBe("read");
    expect(op.resourceDomain).toBe("env");
    expect(op.resourceValue).toBe("NODE_ENV");
  });

  it("creates device access operations", () => {
    const op = deviceAccess("camera");
    expect(op.capability).toBe("access");
    expect(op.resourceDomain).toBe("device");
    expect(op.resourceValue).toBe("camera");
  });

  it("handles generic custom operations", () => {
    const op = createOperation("read", "filesystem", "/etc/hosts");
    const wire = toOperationWire(op);
    expect(wire).toEqual({
      capability: "read",
      resource_domain: "filesystem",
      resource_value: "/etc/hosts",
    });
  });

  it("passes through already formed OperationWire objects", () => {
    const wireCandidate = {
      capability: "write",
      resource_domain: "filesystem",
      resource_value: "/tmp/data",
    };
    const wire = toOperationWire(wireCandidate);
    expect(wire).toBe(wireCandidate);
  });
});
