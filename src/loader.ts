import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PolluxLibraryNotFoundError } from "./errors.js";

/**
 * Returns the platform-specific library filename.
 */
export function getPlatformLibraryName(): string {
  const platform = process.platform;
  if (platform === "darwin") {
    return "libpollux_ffi.dylib";
  }
  if (platform === "win32") {
    return "pollux_ffi.dll";
  }
  return "libpollux_ffi.so";
}

/**
 * Resolves the path to the native Pollux Core dynamic library.
 */
export function resolveLibraryPath(explicitPath?: string): string {
  if (explicitPath && existsSync(explicitPath)) {
    return resolve(explicitPath);
  }

  const envLib = process.env.POLLUX_CORE_LIB || process.env.POLLUX_FFI_PATH;
  if (envLib && existsSync(envLib)) {
    return resolve(envLib);
  }

  const libName = getPlatformLibraryName();
  const envDir = process.env.POLLUX_CORE_DIR;
  if (envDir) {
    const candidateInLib = join(envDir, "lib", libName);
    if (existsSync(candidateInLib)) {
      return resolve(candidateInLib);
    }
    const candidateDirect = join(envDir, libName);
    if (existsSync(candidateDirect)) {
      return resolve(candidateDirect);
    }
  }

  const packageRoot =
    typeof import.meta.url === "string"
      ? resolve(dirname(fileURLToPath(import.meta.url)), "..")
      : process.cwd();

  const ecosystemRoot = resolve(packageRoot, "..", "..");

  const searchCandidates: string[] = [
    // Local package lib and target directories
    join(packageRoot, "lib", libName),
    join(packageRoot, libName),
    join(packageRoot, "target", "pollux-core-dist-cache", libName),
    // Relative to Native Bridge build / dist cache
    join(
      ecosystemRoot,
      "Native",
      "pollux-polyglot-native-bridge",
      "target",
      "pollux-core-dist-cache",
      "pollux-core-0.1.0-aarch64-apple-darwin",
      "lib",
      libName,
    ),
    join(
      ecosystemRoot,
      "Native",
      "pollux-polyglot-native-bridge",
      "target",
      "pollux-core-dist-cache",
      "pollux-core-0.1.0-x86_64-apple-darwin",
      "lib",
      libName,
    ),
    join(
      ecosystemRoot,
      "Native",
      "pollux-polyglot-native-bridge",
      "target",
      "pollux-core-dist-cache",
      "pollux-core-0.1.0-x86_64-unknown-linux-gnu",
      "lib",
      libName,
    ),
    join(
      ecosystemRoot,
      "Native",
      "pollux-polyglot-native-bridge",
      "target",
      "pollux-core-dist-cache",
      "pollux-core-0.1.0-aarch64-unknown-linux-gnu",
      "lib",
      libName,
    ),
    join(
      ecosystemRoot,
      "Native",
      "pollux-polyglot-native-bridge",
      "target",
      "pollux-core-dist-cache",
      "pollux-core-0.1.0-x86_64-pc-windows-msvc",
      "lib",
      libName,
    ),
    join(ecosystemRoot, "Native", "pollux-polyglot-native-bridge", "target", "debug", libName),
    join(ecosystemRoot, "Native", "pollux-polyglot-native-bridge", "target", "release", libName),
    // Relative to Pollux repo
    join(ecosystemRoot, "Pollux", "target", "debug", libName),
    join(ecosystemRoot, "Pollux", "target", "release", libName),
    // Relative to Distribution repo
    join(ecosystemRoot, "Distribution", "lib", libName),
    // Current working directory
    join(process.cwd(), libName),
    join(process.cwd(), "lib", libName),
    // System locations
    `/usr/local/lib/${libName}`,
    `/usr/lib/${libName}`,
    `/opt/homebrew/lib/${libName}`,
  ];

  for (const candidate of searchCandidates) {
    if (existsSync(candidate)) {
      return resolve(candidate);
    }
  }

  throw new PolluxLibraryNotFoundError(searchCandidates);
}
