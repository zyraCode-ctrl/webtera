const REQUIRED_PROD_ENV = [
  "IG_FUNNEL_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "ANALYTICS_WEBHOOK_URL",
  "REQUEST_TOOL_WEBHOOK_URL",
] as const;

type RequiredProdEnv = (typeof REQUIRED_PROD_ENV)[number];

export function getRequiredEnv(name: RequiredProdEnv): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export function validateProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;
  for (const name of REQUIRED_PROD_ENV) getRequiredEnv(name);
}
