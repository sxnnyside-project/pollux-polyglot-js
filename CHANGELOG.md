# Changelog

All notable changes to **Pollux Polyglot JS** are documented here.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.0] — 2026-10-08

### Added

- Tri-runtime FFI architecture for Bun (`bun:ffi`), Deno (`Deno.dlopen`), and Node.js (`koffi`).
- `PolluxEngine` lifecycle management with Explicit Resource Management (`Symbol.dispose`).
- Strongly typed capability operation builders (`fileRead`, `fileWrite`, `netConnect`, `procSpawn`, `procExec`, `secretAccess`, `envRead`, `deviceAccess`).
- Conformance validation with Pollux ABI specification (`pollux-abi/1`).
- Deterministic multi-path resolver for `libpollux_ffi` native dynamic library.

---

[Unreleased]: https://github.com/sxnnyside-project/pollux-polyglot-js/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sxnnyside-project/pollux-polyglot-js/releases/tag/v0.1.0
