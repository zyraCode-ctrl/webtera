export async function postJsonWithTimeout(
  url: string,
  payload: unknown,
  timeoutMs = 5000
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`[http] Non-2xx response ${res.status} from ${url}`);
    }
  } finally {
    clearTimeout(timer);
  }
}
