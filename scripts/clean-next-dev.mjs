import fs from "node:fs";
import path from "node:path";

function rmrf(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

const projectRoot = process.cwd();

// Next dev artifacts (most important)
rmrf(path.join(projectRoot, ".next"));

// Extra caches that can contribute to stale chunk references (safe)
rmrf(path.join(projectRoot, "node_modules", ".cache", "next"));
rmrf(path.join(projectRoot, ".turbo"));

console.log("[dev-clean] Cleared Next dev caches");

