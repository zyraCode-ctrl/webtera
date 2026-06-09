# Private R2 media (funnel)

## How it works

1. **Catalog** — Real files live in `data/mediaRegistry.ts` as R2 object keys (server-only). The client bundle no longer includes `pub-....r2.dev` URLs in `posts.ts` or `links.ts`.

2. **Gate** — Browser requests `GET /api/media/{postId}?kind=thumb|preview|full` with the `ig_pass` cookie (same Instagram funnel pass as `/go` and `/help`).

3. **API** — The route checks the cookie, loads the object from your **private** R2 bucket with server credentials, and **streams** bytes back. DevTools shows `/api/media/33?kind=full`, not the R2 path.

4. **UI** — `<img>` and `<video>` use `ProtectedMediaImage` / `ProtectedMediaVideo`, which set `src` to the API path only when the element renders.

## Cloudflare setup (you must do this)

1. R2 bucket → **Public access: Off** (disable `r2.dev` public URL for sensitive objects).
2. Create an **R2 API token** with Object Read on that bucket.
3. Set environment variables (`.env.local` / Vercel):

```env
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=your-bucket-name

# Optional during migration (server-only, not exposed to browser):
R2_LEGACY_PUBLIC_BASE_URL=https://pub-xxxxx.r2.dev
```

Remove `R2_LEGACY_PUBLIC_BASE_URL` after the bucket is private and credentials work.

## Bucket layout (new account)

Upload videos as **flat keys** in your bucket:

```
33.mp4
34.mp4
168.MP4   ← case is preserved; sync records the exact key
```

Then refresh the local index:

```bash
npm run sync-r2
```

## Video format (important for browser playback)

Upload **MP4 with H.264 video (avc1) + AAC audio (mp4a)**. Many phones export **HEVC (hvc1)** or old **MPEG-4 (mp4v)** — Chrome/Edge on Windows often play **audio only** with a black screen.

Check a file before upload:

```bash
node scripts/mp4-codec-hint.mjs 21
```

Re-encode if needed (requires [ffmpeg](https://ffmpeg.org)):

```bash
ffmpeg -i 21.mp4 -c:v libx264 -profile:v main -pix_fmt yuv420p -c:a aac -movflags +faststart 21-h264.mp4
```

Then upload `21-h264.mp4` as `21.mp4` in R2 and run `npm run sync-r2`.

That writes `data/r2VideoIndex.ts` (227+ entries). Post **#33** maps to object key `33.mp4`, post **#168** to `168.MP4`, etc.

- **Full video** (`kind=full`) — any post id listed in the index.
- **Preview** on `/post/{id}` — only post ids in `R2_PREVIEW_POST_IDS` inside `data/mediaRegistry.ts` (default: `32`, `34`).
- **Thumbnails** — placeholder images unless you add explicit thumb overrides.

Optional per-post overrides (custom paths) still go in `R2_POST_MEDIA` in `data/mediaRegistry.ts`.

External hosts (xvideos, mega) stay under `EXTERNAL_POST_MEDIA` — not proxied.

## Legacy old-account public URL

Remove `R2_LEGACY_PUBLIC_BASE_URL` from `.env` once the new bucket credentials work. The app no longer falls back to the old public `r2.dev` URL unless you set:

```env
R2_LEGACY_FALLBACK=1
```

## Limits

- Anyone with a valid `ig_pass` cookie can still download from Network tab via `/api/media/...` — that is normal for web video.
- URLs expire only if you add shorter cookie TTL or separate signed tokens later; streaming does not use long-lived public R2 links.
