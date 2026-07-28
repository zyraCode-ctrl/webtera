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
const fullClean =
  process.env.DEV_CLEAN === "1" ||
  process.argv.includes("--full") ||
  process.argv.includes("full");

if (fullClean) {
  // Heavy: forces a full recompile (needs several GB free RAM).
  rmrf(path.join(projectRoot, ".next"));
  rmrf(path.join(projectRoot, "node_modules", ".cache", "next"));
  rmrf(path.join(projectRoot, ".turbo"));
  console.log("[dev-clean] Full clean: cleared .next and caches");
} else {
  // Light: keep .next so cold start uses less RAM on low-memory machines.
  rmrf(path.join(projectRoot, "node_modules", ".cache", "next"));
  console.log("[dev-clean] Light clean (set DEV_CLEAN=1 for full .next wipe)");
}
