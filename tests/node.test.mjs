import assert from "node:assert/strict";
import test from "node:test";

const VALID_MANIFEST_YAML = `version: 1
filesystem:
  read:
    - ./assets
`;

if (typeof Bun === "undefined" && typeof Deno === "undefined") {
  test("Node.js runtime evaluation", async () => {
    const { PolluxEngine, fileRead, fileWrite } = await import("../dist/index.js");
    const engine = await PolluxEngine.load(VALID_MANIFEST_YAML);
    assert.equal(engine.abiVersion, "pollux-abi/1");
    assert.equal(engine.driverName, "node");

    const allowed = engine.evaluate(fileRead("./assets"));
    assert.equal(allowed.allowed, true);
    assert.equal(allowed.outcome, "allow");

    const denied = engine.evaluate(fileWrite("./assets"));
    assert.equal(denied.allowed, false);
    assert.equal(denied.outcome, "deny");

    engine.destroy();
    assert.equal(engine.isDestroyed, true);
  });
}
