const REQUIRED_PROD_ENV = [
  "IG_FUNNEL_SECRET",
  "REQUEST_TOOL_WEBHOOK_URL",
] as const;

type RequiredProdEnv = (typeof REQUIRED_PROD_ENV)[number];
let hasWarnedForMissingEnv = false;

export function getRequiredEnv(name: RequiredProdEnv): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export function validateProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;
  const missing = REQUIRED_PROD_ENV.filter((name) => {
    const value = process.env[name];
    return !value || !value.trim();
  });
  if (missing.length === 0) return;

  const message = `[env] Missing recommended production environment variables: ${missing.join(", ")}`;
  if (process.env.STRICT_ENV_VALIDATION === "1") {
    throw new Error(message);
  }
  if (!hasWarnedForMissingEnv) {
    console.warn(message);
    hasWarnedForMissingEnv = true;
  }
}
