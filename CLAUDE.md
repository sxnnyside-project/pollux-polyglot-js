# @pollux/polyglot-js Guide

## Overview
`@pollux/polyglot-js` is the official JavaScript / TypeScript language binding for Pollux Core and the Pollux FFI Native Bridge (`pollux-abi/1`).
The package is optimized for Bun and Deno runtimes, with full Node.js compatibility via Koffi.

## Commands

Always use `just` recipes when interacting with this repository:

- `just install` - Install package dependencies with Bun
- `just dev` - Run TypeScript compiler in watch mode
- `just build` - Compile TypeScript to `dist/` declarations and JavaScript
- `just test` - Run tests across Bun, Deno, and Node.js
- `just typecheck` - Run `tsc --noEmit`
- `just lint` - Run Biome linter check
- `just format` - Run Biome formatter check
- `just check` - Run full standard quality gate (format, lint, typecheck, test)
- `just clean` - Clean build artifacts and dist/

## Architecture Rules

- **Zero Global Driver Pollution**: Drivers in `src/ffi/` isolate runtime-specific FFI quirks (e.g. `bun:ffi` dynamic resolution, Deno symbol mapping, Koffi struct declarations).
- **Strict Typing**: No untyped `any` or lax type assertions. All ABI payloads must conform to `src/types.ts`.
- **Memory Safety**: Every native engine handle allocated by the ABI must be freed via `destroy()` or `[Symbol.dispose]()`. Drivers that support explicit closing (e.g. Deno) must unload the library to avoid resource leaks.
- **Error Propagation**: Return status codes from native C functions (`PolluxStatus`) must be validated with `checkStatus()` in `src/errors.ts` to throw descriptive domain exceptions.
- **Code Style**: Format and lint with Biome (`biome.json`). Avoid introducing ESLint or Prettier.
