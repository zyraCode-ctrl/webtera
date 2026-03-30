This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Build commands (Windows-safe)

- `npm run build`: build with increased Node memory (`--max-old-space-size=4096`)
- `npm run build:safe`: fallback build with higher memory (`--max-old-space-size=6144`)

## Instagram funnel protection

The Instagram funnel routes are protected so they can’t be accessed directly without an entry “pass”:

- **Protected**: `/go`, `/post/*`, `/out/*`
- **Protected**: `/help/*` (gated help funnel route)
- **Entry links (use these in Instagram)**:
  - `/<entry>/<sub>` (2-part links; configured in `app/[entry]/[sub]/route.ts`)

When a user opens a valid entry link, the server sets a short‑lived signed cookie and redirects them to `/go`. Without that cookie, funnel routes redirect to `/`.

### Configure the secret (production)

Set an environment variable:

- `IG_FUNNEL_SECRET`: a long random secret used to sign the entry pass.
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: your AdSense client id (for live ad script loading)
- `NEXT_PUBLIC_SITE_URL`: canonical site URL for sitemap
- `ANALYTICS_WEBHOOK_URL`: optional webhook endpoint for funnel analytics events
- `REQUEST_TOOL_WEBHOOK_URL`: optional webhook endpoint for `/request-tool` submissions

## Analytics events (funnel)

Client/server events are sent to `/api/track`, then forwarded to `ANALYTICS_WEBHOOK_URL` when set:

- `ig_entry`
- `go_page_view`
- `go_click_full_video`
- `go_click_instagram`
- `go_click_download`
- `out_loader_started`
- `out_loader_completed`
- `help_page_view`
- `help_reveal_shown`
- `help_click_download`
- `help_click_link`
- `help_click_rate`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
