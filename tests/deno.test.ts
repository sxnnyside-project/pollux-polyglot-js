// biome-ignore lint/suspicious/noExplicitAny: Ambient Deno global
declare const Deno: any;

import { PolluxEngine } from "../src/engine.js";
import { fileRead, fileWrite } from "../src/operation.js";

const VALID_MANIFEST_YAML = `version: 1
filesystem:
  read:
    - ./assets
`;

if (typeof Deno !== "undefined") {
  Deno.test("Deno runtime evaluation", async () => {
    const engine = await PolluxEngine.load(VALID_MANIFEST_YAML);
    if (engine.abiVersion !== "pollux-abi/1") {
      throw new Error(`Unexpected ABI version: ${engine.abiVersion}`);
    }
    if (engine.driverName !== "deno") {
      throw new Error(`Expected driver "deno", got: ${engine.driverName}`);
    }

    const allowed = engine.evaluate(fileRead("./assets"));
    if (!allowed.allowed || allowed.outcome !== "allow") {
      throw new Error(`Expected allow, got: ${allowed.outcome}`);
    }

    const denied = engine.evaluate(fileWrite("./assets"));
    if (denied.allowed || denied.outcome !== "deny") {
      throw new Error(`Expected deny, got: ${denied.outcome}`);
    }

    engine.destroy();
    if (!engine.isDestroyed) {
      throw new Error("Expected engine to be destroyed");
    }
  });
}
