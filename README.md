# Pollux Polyglot JS

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)
[![CI](https://github.com/sxnnyside-project/pollux-polyglot-js/workflows/CI/badge.svg)](https://github.com/sxnnyside-project/pollux-polyglot-js/actions)

<p align="center">
  <strong>Bun-first ✦ Deno-native ✦ Zero-overhead FFI</strong><br>
  <em>Deterministic Execution Authority and capability evaluation bindings for JavaScript and TypeScript runtimes.</em>
</p>

<p align="center">
  <a href="#about">About</a> ✦
  <a href="#features">Features</a> ✦
  <a href="#installation">Installation</a> ✦
  <a href="#usage">Usage</a> ✦
  <a href="#architecture">Architecture</a> ✦
  <a href="#contributing">Contributing</a>
</p>

---

## About

**Pollux Polyglot JS** provides official high-performance TypeScript and JavaScript bindings for Pollux Core and the Pollux FFI Native Bridge (`pollux-abi/1`).

Modern applications running under Bun, Deno, or Node.js frequently execute external modules, user scripts, or agentic routines that require tight, verifiable containment. Standard runtime sandboxing models vary wildly across engines and lack cross-language conformance.

Pollux Polyglot JS binds your JavaScript runtime directly to the native Pollux evaluation engine, evaluating every sensitive system call (filesystem, network, processes, secrets) against a declarative capability manifest with zero execution variance.

### Philosophy

> _"Capabilities precede execution; evaluation must remain deterministic across every runtime."_

This is a Sxnnyside Project project, part of the Sxnnyside Project's Pollux Ecosystem.

## Features

- **Tri-Runtime Native Architecture**: Direct JIT FFI for Bun (`bun:ffi`), typed symbol bindings for Deno (`Deno.dlopen`), and low-overhead compatibility for Node.js (`koffi`).
- **Strictly Typed Wire Protocol**: 100% TypeScript coverage conforming to Pollux ABI specification (`pollux-abi/1`) and RFC-001 wire protocol.
- **Deterministic Evaluation**: Guaranteed byte-for-byte identical evaluation traces and decisions across all supported runtimes.
- **Resource Management Lifecycle**: Native handles protected against use-after-free and memory leaks with full `Symbol.dispose` (`using`) support.
- **Type-Safe Operation Builders**: Pre-built helpers for filesystem (`fileRead`, `fileWrite`), network (`netConnect`), process control (`procSpawn`), secrets, and environment isolation.

## Installation

### Prerequisites

- Bun (>= 1.2.0), Deno (>= 2.0.0), or Node.js (>= 20.0.0)
- `libpollux_ffi` dynamic library (compiled from `pollux-polyglot-native-bridge` or set via `POLLUX_FFI_PATH`)

### From Source

```bash
git clone https://github.com/sxnnyside-project/pollux-polyglot-js.git
cd pollux-polyglot-js

just install
just check
```

## Usage

```typescript
import {
  PolluxEngine,
  fileRead,
  fileWrite,
} from "@sxnnyside/pollux-polyglot-js";

const manifestYaml = `
version: 1
filesystem:
  read:
    - ./data
`;

// Initialize the engine (automatically selects Bun, Deno, or Node driver)
const engine = await PolluxEngine.load(manifestYaml);

// Evaluate allowed read operation
const readResult = engine.evaluate(fileRead("./data/input.json"));
console.log(readResult.allowed); // true
console.log(readResult.outcome); // "allow"

// Evaluate unauthorized write operation
const writeResult = engine.evaluate(fileWrite("./data/input.json"));
console.log(writeResult.allowed); // false
console.log(writeResult.outcome); // "deny"

// Clean up native memory
engine.destroy();
```

## Architecture

```
pollux-polyglot-js/
├── src/
│   ├── ffi/          # Runtime-specific FFI drivers (Bun, Deno, Node)
│   ├── engine.ts     # PolluxEngine stateful container & lifecycle
│   ├── operation.ts  # Strongly typed wire operation builders
│   ├── loader.ts     # Multi-path native library resolver
│   └── types.ts      # ABI wire protocol and capability types
└── tests/            # Multi-runtime conformance and integration tests
```

For a detailed breakdown of the task runner and contribution guidelines, see [CLAUDE.md](CLAUDE.md).

## Contributing

Contributions are accepted. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Before contributing, read the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Pollux Polyglot JS</strong> — A Sxnnyside Project<br>
  <em>&copy; 2026 Sxnnyside Project</em>
</p>
