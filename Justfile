# Pollux Polyglot JS task runner.
# Every recipe wraps canonical runtime / tooling commands.

# Bootstrap dependencies.
install:
    bun install --frozen-lockfile || bun install

# Fast dev execution or watch mode.
dev:
    bun run --watch src/index.ts

# Compile TypeScript declarations and distribution bundle.
build:
    bun build src/index.ts --outdir dist --target node
    bun x tsc --emitDeclarationOnly

# Run Bun test suite.
test-bun:
    bun test

# Run Deno test suite.
test-deno:
    deno test -A tests/deno.test.ts

# Run Node.js test suite against built dist.
test-node: build
    node --test tests/node.test.mjs

# Run test suite across all supported runtimes.
test: test-bun test-deno test-node

# Correctness / static type checking.
typecheck:
    bun x tsc --noEmit

# Static analysis with Biome.
lint:
    bun x biome check .

# Apply deterministic formatting in place.
format:
    bun x biome format --write .

# Verify formatting without modifying files.
format-check:
    bun x biome format .

# Full non-mutating quality gate; invoked by CI.
check: format-check lint typecheck test

# Clean build artifacts and caches.
clean:
    rm -rf dist node_modules/.cache target
