# Security overview — WebTera (webtera)

High-level notes for operators and reviewers. This is not a formal penetration-test report.

## Threat model (implicit)

- Public marketing/tools pages (`/`, `/tools/*`) are open.
- Funnel content (`/go`, `/post/*`, `/help/*`, `/out/*`) is gated by a short-lived signed cookie (`ig_pass`), not per-user authentication.
- Video/media URLs may point at public CDNs (e.g. R2); **playback is not DRM**. Determined users can still capture or fetch bytes.

## Secrets & configuration

| Variable | Role |
|----------|------|
| `IG_FUNNEL_SECRET` | HMAC key for `ig_pass` cookie; **required** for middleware to allow gated routes. Missing → gated routes redirect away. |
| `REQUEST_TOOL_WEBHOOK_URL` | Production webhook for `/api/request-tool` (validated server-side). |
| `ANALYTICS_WEBHOOK_URL` | Optional server analytics forwarding. |
| `UPSTASH_REDIS_REST_*` | Optional; enables distributed rate limiting for `/api/track` and `/api/request-tool`. Without it, limits are in-process per instance (weaker on serverless). |

Never commit `.env*` files. Rotate `IG_FUNNEL_SECRET` if leaked.

## Funnel mechanics

- Valid two-part entry URLs are **allowlisted** in `app/[entry]/[sub]/route.ts`. Unknown pairs redirect home.
- Cookie: httpOnly, short TTL, `SameSite=Lax`, `Secure` in production, payload includes expiry + `src`, signed with HMAC-SHA256 (see `lib/funnelEntry.ts`, `middleware.ts`).
- Token does **not** bind to a specific post ID; within TTL it grants access to any gated route.

## HTTP security headers

`next.config.mjs` sets CSP, HSTS, `X-Frame-Options: DENY`, `Referrer-Policy`, etc. CSP allows **`unsafe-inline`** / **`unsafe-eval`** and multiple third-party script/frame hosts for ads/analytics — strong XSS containment is **not** the goal of the current CSP.

## APIs

- **`POST /api/track`**: JSON body size capped; event name/path validated; rate limited.
- **`POST /api/request-tool`**: JSON capped; fields validated; rate limited.
- Webhooks are plain HTTPS POSTs — **protect endpoints** with auth/signatures on the receiver side if payloads are sensitive.

## Dependency hygiene

Run periodically:

```bash
npm audit
```

Address critical/high issues per your policy; `npm audit fix` may introduce breaking upgrades — test after changes.

## Operational checklist

- [ ] Production env has strong random `IG_FUNNEL_SECRET`.
- [ ] Webhook URLs are HTTPS and trusted.
- [ ] Optional Upstash configured if you rely on API rate limits under load.
- [ ] Review funnel entry tokens if the repo is public (rotate paths + redeploy).

## Reporting issues

Use your team’s standard channel for suspected vulnerabilities; avoid posting secrets or live exploit steps in public tickets.
