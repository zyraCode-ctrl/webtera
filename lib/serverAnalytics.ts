type ServerEvent = {
  event: string;
  at?: string;
  path?: string;
  source?: string;
  postId?: string;
  meta?: Record<string, unknown>;
};

import { getRequiredEnv } from "@/lib/env";
import { postJsonWithTimeout } from "@/lib/http";

export async function sendServerEvent(evt: ServerEvent) {
  const payload = {
    ...evt,
    at: evt.at ?? new Date().toISOString(),
  };

  const webhook =
    process.env.NODE_ENV === "production"
      ? getRequiredEnv("ANALYTICS_WEBHOOK_URL")
      : process.env.ANALYTICS_WEBHOOK_URL;
  if (!webhook) return { ok: true as const };

  try {
    await postJsonWithTimeout(webhook, payload, 5000);
    return { ok: true as const };
  } catch (err) {
    console.error("[analytics] webhook error:", err);
    return { ok: false as const, error: "analytics_webhook_failed" };
  }
}

