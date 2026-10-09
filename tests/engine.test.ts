import { describe, expect, it } from "bun:test";
import { PolluxEngine } from "../src/engine.js";
import { PolluxEngineDisposedError, PolluxManifestError } from "../src/errors.js";
import { fileRead, fileWrite } from "../src/operation.js";
import { EXPECTED_ABI_VERSION, PROTOCOL_VERSION } from "../src/types.js";

const VALID_MANIFEST_YAML = `version: 1
filesystem:
  read:
    - ./assets
`;

describe("PolluxEngine Integration", () => {
  it("reports matching ABI version and non-empty Core version", async () => {
    const engine = await PolluxEngine.load(VALID_MANIFEST_YAML);
    try {
      expect(engine.abiVersion).toBe(EXPECTED_ABI_VERSION);
      expect(engine.coreVersion.length).toBeGreaterThan(0);
      expect(engine.driverName).toBe("bun");
      expect(engine.isDestroyed).toBe(false);
    } finally {
      engine.destroy();
    }
  });

  it("loads synchronously on Bun runtime", () => {
    const engine = PolluxEngine.loadSync(VALID_MANIFEST_YAML);
    try {
      expect(engine.abiVersion).toBe(EXPECTED_ABI_VERSION);
      expect(engine.isDestroyed).toBe(false);
    } finally {
      engine.destroy();
    }
  });

  it("evaluates allowed operation with an allow decision", async () => {
    const engine = await PolluxEngine.load(VALID_MANIFEST_YAML);
    try {
      const op = fileRead("./assets");
      const result = engine.evaluate(op);

      expect(result.allowed).toBe(true);
      expect(result.outcome).toBe("allow");
      expect(result.trace.protocol_version).toBe(PROTOCOL_VERSION);
      expect(result.trace.operation_declared).toBe(true);
      expect(result.trace.requested_operation.capability).toBe("read");
      expect(result.trace.requested_operation.resource_domain).toBe("filesystem");
      expect(result.trace.requested_operation.resource_value).toBe("assets");
      expect(result.trace.violations.length).toBe(0);
    } finally {
      engine.destroy();
    }
  });

  it("evaluates unauthorized operation with a deny decision", async () => {
    const engine = await PolluxEngine.load(VALID_MANIFEST_YAML);
    try {
      const op = fileWrite("./assets");
      const result = engine.evaluate(op);

      expect(result.allowed).toBe(false);
      expect(result.outcome).toBe("deny");
      expect(result.trace.operation_declared).toBe(false);
      expect(result.trace.decision.outcome).toBe("deny");
      expect(result.reason.length).toBeGreaterThan(0);
    } finally {
      engine.destroy();
    }
  });

  it("produces identical deterministic traces on repeated evaluations", async () => {
    const engine = await PolluxEngine.load(VALID_MANIFEST_YAML);
    try {
      const op = fileRead("./assets");
      const first = engine.evaluate(op);
      const second = engine.evaluate(op);

      expect(first).toEqual(second);
    } finally {
      engine.destroy();
    }
  });

  it("rejects malformed manifest with PolluxManifestError", async () => {
    await expect(PolluxEngine.load("invalid: [yaml, manifest")).rejects.toThrow(
      PolluxManifestError,
    );
  });

  it("prevents evaluation after engine is destroyed", async () => {
    const engine = await PolluxEngine.load(VALID_MANIFEST_YAML);
    engine.destroy();
    expect(engine.isDestroyed).toBe(true);

    expect(() => engine.evaluate(fileRead("./assets"))).toThrow(PolluxEngineDisposedError);
  });

  it("supports explicit resource management using Symbol.dispose", () => {
    let capturedEngine: PolluxEngine | null = null;
    {
      const engine = PolluxEngine.loadSync(VALID_MANIFEST_YAML);
      capturedEngine = engine;
      expect(engine.isDestroyed).toBe(false);
      engine[Symbol.dispose]();
    }
    expect(capturedEngine?.isDestroyed).toBe(true);
  });

  it("allows multiple independent engines simultaneously", async () => {
    const engine1 = await PolluxEngine.load(VALID_MANIFEST_YAML);
    const engine2 = await PolluxEngine.load(VALID_MANIFEST_YAML);

    try {
      const res1 = engine1.evaluate(fileRead("./assets"));
      const res2 = engine2.evaluate(fileWrite("./assets"));

      expect(res1.allowed).toBe(true);
      expect(res2.allowed).toBe(false);
    } finally {
      engine1.destroy();
      engine2.destroy();
    }
  });
});
