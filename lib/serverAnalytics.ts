type ServerEvent = {
  event: string;
  at?: string;
  path?: string;
  source?: string;
  postId?: string;
  meta?: Record<string, unknown>;
};

import { postJsonWithTimeout } from "@/lib/http";

export async function sendServerEvent(evt: ServerEvent) {
  const payload = {
    ...evt,
    at: evt.at ?? new Date().toISOString(),
  };

  // Keep analytics webhook optional in production.
  // Without this, funnel entry links can crash with HTTP 500 on Vercel.
  const webhook = process.env.ANALYTICS_WEBHOOK_URL;
  if (!webhook || !webhook.trim()) return { ok: true as const };

  try {
    await postJsonWithTimeout(webhook, payload, 5000);
    return { ok: true as const };
  } catch (err) {
    console.error("[analytics] webhook error:", err);
    return { ok: false as const, error: "analytics_webhook_failed" };
  }
}

