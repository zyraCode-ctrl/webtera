"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { MouseEvent } from "react";
import { useSearchParams } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { FunnelNavigatingOverlay } from "@/components/FunnelNavigatingOverlay";
import { toolContent } from "@/data/toolContent";
import { tools } from "@/data/tools";
import { getPostLinkStatus, getDownloadLinkStatus, rateUsUrl } from "@/data/links";
import { ProtectedMediaVideo } from "@/components/media/ProtectedMediaVideo";
import { trackEvent } from "@/lib/analytics";
import { decodeFunnelFrom } from "@/lib/funnelRef";
import { openGateThenNavigate } from "@/lib/funnelNavigate";
import type { HelpVideoPresentation } from "@/lib/mediaApi";
import { EVENTS } from "@/lib/events";

type Props = {
  postId: string;
  helpVideo: HelpVideoPresentation;
  helpExternalLink?: string;
};
type GuideStage = "top" | "near" | "reached";

const TOOL_SLUGS = Object.keys(toolContent) as Array<keyof typeof toolContent>;

/** Show the CTA card right after the 6th tool (index 5). */
const CTA_TOOL_INDEX = 5;

/** For ?from=video, video block is placed after tool index 1–3 (2nd–4th tool). */
const VIDEO_INSERT_MIN_IDX = 1;
const VIDEO_INSERT_MAX_IDX = 3;

/** Stable per-post slot — must match on server and client (no Math.random during render). */
function stableVideoInsertIdx(postId: string) {
  let h = 0;
  for (let i = 0; i < postId.length; i++) {
    h = (h * 31 + postId.charCodeAt(i)) >>> 0;
  }
  const span = VIDEO_INSERT_MAX_IDX - VIDEO_INSERT_MIN_IDX + 1;
  return VIDEO_INSERT_MIN_IDX + (h % span);
}

/** In-page anchor for video funnel navigation (sticky bar scroll target). */
const HELP_VIDEO_SECTION_ID = "help-post-video";

/** First-play gate on inline video: countdown before playback continues. */
const HELP_PLAY_GATE_SECONDS = 5;

type VideoMediaProps = {
  postId: string;
  from: string | null;
  helpVideo: HelpVideoPresentation;
  downloadLink?: string;
  downloadLinkBlocked: boolean;
  rateUs: string;
  onGatedExternalLink: (e: MouseEvent<HTMLAnchorElement>) => void;
};

function HelpVideoFunnelIntro({ postId }: { postId: string }) {
  return (
    <section className="surface-panel p-6 text-center sm:p-6">
      <span className="inline-flex rounded-full border border-violet-200/80 bg-violet-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-800">
        Help Center
      </span>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
        Post #{postId}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">
        Complete guide for all tools below. Your video appears after a few tools—use the purple <b>Jump to video</b> chip
        at the top while you scroll to move straight to the player.
      </p>
    </section>
  );
}

function HelpVideoMediaSection({
  postId,
  from,
  helpVideo,
  downloadLink,
  downloadLinkBlocked,
  rateUs,
  onGatedExternalLink,
}: VideoMediaProps) {
  const playGateCompletedRef = useRef(false);
  const [playGateOpen, setPlayGateOpen] = useState(false);
  const [playGateSecondsLeft, setPlayGateSecondsLeft] = useState(HELP_PLAY_GATE_SECONDS);

  useEffect(() => {
    playGateCompletedRef.current = false;
    setPlayGateOpen(false);
    setPlayGateSecondsLeft(HELP_PLAY_GATE_SECONDS);
  }, [postId, helpVideo]);

  const handlePlayGateContinue = useCallback(() => {
    playGateCompletedRef.current = true;
    setPlayGateOpen(false);
  }, []);

  useEffect(() => {
    if (!playGateOpen) return;
    const id = window.setInterval(() => {
      setPlayGateSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [playGateOpen]);

  useEffect(() => {
    if (!playGateOpen || playGateSecondsLeft !== 0) return;
    const t = window.setTimeout(() => handlePlayGateContinue(), 500);
    return () => window.clearTimeout(t);
  }, [playGateOpen, playGateSecondsLeft, handlePlayGateContinue]);

  function handleVideoPlayAttempt() {
    if (playGateCompletedRef.current) return;
    setPlayGateSecondsLeft(HELP_PLAY_GATE_SECONDS);
    setPlayGateOpen(true);
  }

  const videoPlaybackHelp: ReactNode = (
    <p className="mt-3 text-xs leading-relaxed text-zinc-600">
      If this keeps failing: open Cloudflare <b>R2 → bucket → CORS</b> and allow <code className="rounded bg-zinc-100 px-1">GET</code> from your site
      origins (including <code className="rounded bg-zinc-100 px-1">http://localhost:3000</code>). Confirm the object opens in a new tab and returns{" "}
      <code className="rounded bg-zinc-100 px-1">200</code> with <code className="rounded bg-zinc-100 px-1">video/mp4</code> — not{" "}
      <code className="rounded bg-zinc-100 px-1">500</code>/<code className="rounded bg-zinc-100 px-1">403</code>.
    </p>
  );

  return (
    <section
      id={HELP_VIDEO_SECTION_ID}
      className="surface-panel scroll-mt-24 overflow-hidden p-5 text-center sm:p-6"
    >
      <h2 className="text-lg font-semibold tracking-tight text-zinc-950 sm:text-xl">Your video — Post #{postId}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">Plays inline here when the link allows it.</p>

      <div className="mx-auto mt-6 w-full max-w-3xl text-left">
        {helpVideo?.mode === "gated" ? (
          <div className="relative">
            {playGateOpen ? (
              <div
                className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-xl border border-zinc-600/80 bg-zinc-950/90 px-4 py-6 text-center backdrop-blur-sm sm:px-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="help-play-gate-title"
              >
                <p id="help-play-gate-title" className="text-sm font-semibold text-white">
                  Quick sponsor moment
                </p>
                <p className="max-w-sm text-xs leading-relaxed text-zinc-300">
                  After a short wait you can continue watching here—or tap below when the timer finishes.
                </p>
                <button
                  type="button"
                  disabled={playGateSecondsLeft > 0}
                  onClick={handlePlayGateContinue}
                  className={[
                    "inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition",
                    playGateSecondsLeft > 0
                      ? "cursor-not-allowed bg-zinc-600 text-zinc-300"
                      : "bg-violet-600 text-white hover:bg-violet-500",
                  ].join(" ")}
                >
                  {playGateSecondsLeft > 0 ? `Skip in ${playGateSecondsLeft}s` : "Continue watching"}
                </button>
              </div>
            ) : null}
            <ProtectedMediaVideo
              postId={postId}
              kind="full"
              className="aspect-video max-h-[min(70vh,720px)] w-full rounded-xl border border-zinc-200 bg-black object-contain shadow-lg select-none"
              onPlay={handleVideoPlayAttempt}
            />
          </div>
        ) : helpVideo?.mode === "iframe" ? (
          <iframe
            src={helpVideo.url}
            title={`Video embed — post ${postId}`}
            className="aspect-video w-full rounded-xl border border-zinc-200 bg-zinc-950 shadow-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : helpVideo?.mode === "external" ? (
          <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
            <p className="text-sm text-zinc-600">
              This post opens on an external site. Use the button for a sponsor step, then we&apos;ll take you there.
            </p>
            <a
              href={helpVideo.url}
              rel="noopener noreferrer"
              onClick={onGatedExternalLink}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:brightness-110 active:scale-[0.98]"
            >
              Continue to media
            </a>
          </div>
        ) : (
          <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
            No media link is configured for this post yet.
          </p>
        )}
      </div>

      <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
        {downloadLink ? (
          <a
            href={downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent({
                event: EVENTS.helpClickDownload,
                path: `/help/${postId}`,
                postId,
                source: from ?? undefined,
              })
            }
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Download
          </a>
        ) : (
          <span className="inline-flex min-h-11 items-center justify-center rounded-lg bg-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600">
            {downloadLinkBlocked ? "Blocked (unsafe link)" : "No Download"}
          </span>
        )}
        <a
          href={rateUs}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackEvent({
              event: EVENTS.helpClickRate,
              path: `/help/${postId}`,
              postId,
              source: from ?? undefined,
            })
          }
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-500 px-4 py-3 text-sm font-medium text-white hover:bg-amber-400"
        >
          Rate Us
        </a>
      </div>
    </section>
  );
}

export function HelpPage({ postId, helpVideo, helpExternalLink }: Props) {
  const searchParams = useSearchParams();
  const fromRaw = searchParams.get("f") ?? searchParams.get("from");
  const fromDecoded = decodeFunnelFrom(fromRaw);
  const from = fromDecoded ?? (fromRaw === "download" ? "download" : fromRaw === "video" ? "video" : null);
  const videoFunnel = from === "video";
  const isFunnel = from === "video" || from === "download";

  const [showReveal, setShowReveal] = useState(false);
  const [guideStage, setGuideStage] = useState<GuideStage>("top");
  const [highlightActive, setHighlightActive] = useState(false);
  const [isGateNavigating, setIsGateNavigating] = useState(false);
  const cancelNavigateRef = useRef<(() => void) | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const postLinkCtaRef = useRef<HTMLDivElement>(null);
  const ctaBoxRef = useRef<HTMLDivElement>(null);
  const videoInsertAfterIdx = videoFunnel ? stableVideoInsertIdx(postId) : VIDEO_INSERT_MIN_IDX;

  // Reveal box after user has scrolled through content (download funnel legacy layout only).
  useEffect(() => {
    if (videoFunnel) return;
    const handleScroll = () => {
      const el = pageRef.current;
      if (!el) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight || 1;
      // “Half score” — reveal inline CTA after ~50% of page scroll
      if (scrolled / total >= 0.5) {
        setShowReveal(true);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [videoFunnel]);

  const postLinkStatus = getPostLinkStatus(postId);
  const downloadLinkStatus = getDownloadLinkStatus(postId);
  const postLink = postLinkStatus.url;
  const downloadLink = downloadLinkStatus.url;

  useEffect(() => {
    return () => {
      cancelNavigateRef.current?.();
    };
  }, []);

  function handlePostLinkClick(e: MouseEvent<HTMLAnchorElement>) {
    if (isGateNavigating) return;

    const target = helpExternalLink ?? postLink;
    if (!target) {
      if (helpVideo?.mode === "gated") {
        e.preventDefault();
        handleJumpToVideo();
      }
      return;
    }

    e.preventDefault();

    trackEvent({
      event: EVENTS.helpClickLink,
      path: `/help/${postId}`,
      postId,
      source: from ?? undefined,
    });

    cancelNavigateRef.current?.();
    setIsGateNavigating(true);

    const { cancel } = openGateThenNavigate(target);
    cancelNavigateRef.current = cancel;
  }

  function handleJumpToVideo() {
    document.getElementById(HELP_VIDEO_SECTION_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    trackEvent({
      event: EVENTS.helpPageView,
      path: `/help/${postId}`,
      postId,
      source: from ?? undefined,
    });
  }, [postId, from]);

  useEffect(() => {
    if (!showReveal || !isFunnel || videoFunnel) return;
    trackEvent({
      event: EVENTS.helpRevealShown,
      path: `/help/${postId}`,
      postId,
      source: from ?? undefined,
    });
  }, [showReveal, isFunnel, videoFunnel, postId, from]);

  useEffect(() => {
    if (!isFunnel || videoFunnel) return;

    const setStageFromPosition = () => {
      const target = ctaBoxRef.current;
      if (!target) {
        // Before reveal, show "almost there" once user has meaningfully scrolled.
        const progress =
          (window.scrollY + window.innerHeight) /
          Math.max(document.documentElement.scrollHeight, 1);
        setGuideStage(progress > 0.35 ? "near" : "top");
        return;
      }

      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight;
      const inViewport = rect.top <= vh * 0.8 && rect.bottom >= vh * 0.2;
      if (inViewport) {
        setGuideStage("reached");
        return;
      }
      setGuideStage(rect.top <= vh * 1.3 ? "near" : "top");
    };

    const observer =
      showReveal && ctaBoxRef.current
        ? new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setGuideStage("reached");
            } else {
              setStageFromPosition();
            }
          },
          { threshold: 0.25 }
        )
        : null;

    if (observer && ctaBoxRef.current) observer.observe(ctaBoxRef.current);

    setStageFromPosition();
    window.addEventListener("scroll", setStageFromPosition, { passive: true });
    window.addEventListener("resize", setStageFromPosition);

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", setStageFromPosition);
      window.removeEventListener("resize", setStageFromPosition);
    };
  }, [isFunnel, showReveal, videoFunnel]);

  useEffect(() => {
    if (videoFunnel) return;
    if (guideStage !== "reached") {
      setHighlightActive(false);
      return;
    }

    setHighlightActive(true);
    // Keep highlight after arrival, then softly fade.
    const t = setTimeout(() => setHighlightActive(false), 5000);
    return () => clearTimeout(t);
  }, [guideStage, videoFunnel]);

  return (
    <div ref={pageRef} className="min-w-0 w-full space-y-6 pb-10">
      {isGateNavigating ? (
        <FunnelNavigatingOverlay
          title="Opening your link"
          description="This tab will continue to your content in a moment—stay on this screen."
        />
      ) : null}
      {isFunnel && !videoFunnel ? (
        <div className="sticky top-14 z-40 flex justify-center">
          <div className="mt-2 rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold text-white shadow-sm sm:px-5">
            Access the resources link and download below.
          </div>
        </div>
      ) : isFunnel && videoFunnel ? (
        <div className="sticky top-14 z-40 flex justify-center px-2">
          <button
            type="button"
            onClick={handleJumpToVideo}
            className="mt-2 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md ring-4 ring-violet-200/80 transition hover:bg-violet-500 sm:min-h-10 sm:px-5 sm:text-sm"
          >
            <span aria-hidden="true">▶</span>
            Jump to video
          </button>
        </div>
      ) : null}

      {videoFunnel ? (
        <HelpVideoFunnelIntro postId={postId} />
      ) : (
        <section className="surface-panel p-6 text-center">
          <span className="inline-flex rounded-full border border-violet-200/80 bg-violet-50/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-800">
            Help Center
          </span>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Tools Help Center
          </h1>
          <p className="mt-2 text-sm text-zinc-600">Complete guide for all tools — Post #{postId}</p>
          <p className="mt-2 text-sm leading-6 text-zinc-800 bg-yellow-100 px-3 py-2 rounded-md">
            <b>
              Click on the LINK button below.
            </b>
          </p>

          <p className="mt-2 text-sm leading-6 text-zinc-800 bg-yellow-100 px-3 py-2 rounded-md">
            <b>
              After a short redirect, come back here — your video will be ready to view.
            </b>
          </p>
        </section>
      )}

      <AdSlot type="banner" variant="topBanner" />

      <section className="mx-auto w-full min-w-0 max-w-3xl space-y-4">
        {TOOL_SLUGS.map((slug, idx) => {
          const tool = tools.find((t) => t.slug === slug);
          const content = toolContent[slug];
          if (!tool || !content) return null;

          return (
            <div key={slug} className="space-y-4">
              <article className="surface-panel p-5 sm:p-6">
                <div className="inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Tool {idx + 1}
                </div>
                <h2 className="mt-3 text-lg font-semibold tracking-tight text-zinc-950">{tool.title}</h2>
                <p className="mt-2 text-sm leading-7 text-zinc-600">{content.what}</p>

                <h3 className="mt-5 text-sm font-semibold text-zinc-900">How to use</h3>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-sm leading-7 text-zinc-700">
                  {content.howTo.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>

                <h3 className="mt-5 text-sm font-semibold text-zinc-900">Example</h3>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <pre className="overflow-auto rounded-xl bg-zinc-50 p-3 text-xs leading-6 text-zinc-800">
                    {content.example.input}
                  </pre>
                  <pre className="overflow-auto rounded-xl bg-zinc-50 p-3 text-xs leading-6 text-zinc-800">
                    {content.example.output}
                  </pre>
                </div>
              </article>

              {videoFunnel && idx === videoInsertAfterIdx ? (
                <HelpVideoMediaSection
                  postId={postId}
                  from={from}
                  helpVideo={helpVideo}
                  downloadLink={downloadLink}
                  downloadLinkBlocked={downloadLinkStatus.blocked}
                  rateUs={rateUsUrl}
                  onGatedExternalLink={handlePostLinkClick}
                />
              ) : null}

              {/* Funnel-only scroll sticker right before the inline ad */}
              {isFunnel && idx !== TOOL_SLUGS.length - 1 ? (
                <div>
                  <AdSlot type="banner" variant="topBanner" />
                </div>
              ) : null}

              {/* Inline CTA after 6th tool, once user passes ~50% scroll */}
              {isFunnel && !videoFunnel && showReveal && idx === CTA_TOOL_INDEX ? (
                <div
                  ref={ctaBoxRef}
                  className={[
                    "space-y-4 rounded-3xl border-2 border-violet-300/70 bg-white p-5 shadow-xl shadow-violet-600/10 ring-4 ring-violet-100/90 transition-all duration-300 sm:p-6",
                    highlightActive
                      ? "border-amber-400 ring-amber-200 shadow-[0_0_0_4px_rgba(251,191,36,0.30),0_16px_40px_rgba(251,191,36,0.35)] motion-safe:animate-pulse"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="text-center text-sm font-medium text-zinc-600">
                    <p className="mt-2 text-sm text-zinc-600">Complete guide for all tools — Post #{postId}</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-800 bg-yellow-100 px-3 py-2 rounded-md">
                      <b>
                        Click on the LINK button below. After a short redirect, come back here.
                      </b>
                    </p>

                    <p className="mt-2 text-sm leading-6 text-zinc-800 bg-yellow-100 px-3 py-2 rounded-md">
                      <b>
                         YOUR VIDEO WILL BE READY TO VIEW.
                      </b>
                    </p>
                  </div>
                  <div className="text-center text-sm font-semibold uppercase tracking-wider text-violet-800 sm:text-base">
                    Your content is ready — Post #{postId}
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2 sm:p-3">
                    <AdSlot type="banner" variant="topBanner" />
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-zinc-600 sm:grid-cols-3">
                    <div>download👇</div>
                    <div>view👇</div>
                    <div>&nbsp;</div>
                  </div>
                  <div ref={postLinkCtaRef} className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3">
                    {downloadLink ? (
                      <a
                        href={downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackEvent({
                            event: EVENTS.helpClickDownload,
                            path: `/help/${postId}`,
                            postId,
                            source: from ?? undefined,
                          })
                        }
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-500"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="inline-flex min-h-11 items-center justify-center rounded-lg bg-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600">
                        {downloadLinkStatus.blocked ? "Blocked (unsafe link)" : "No Download"}
                      </span>
                    )}
                    {helpExternalLink || postLink ? (
                      <a
                        href={helpExternalLink ?? postLink}
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          handlePostLinkClick(e);
                        }}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:brightness-110 active:scale-[0.98]"
                      >
                        Link
                      </a>
                    ) : helpVideo?.mode === "gated" ? (
                      <button
                        type="button"
                        onClick={handleJumpToVideo}
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:brightness-110 active:scale-[0.98]"
                      >
                        Link
                      </button>
                    ) : (
                      <span className="inline-flex min-h-11 items-center justify-center rounded-lg bg-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600">
                        {postLinkStatus.blocked ? "Blocked (unsafe link)" : "No Link"}
                      </span>
                    )}
                    <a
                      href={rateUsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent({
                          event: EVENTS.helpClickRate,
                          path: `/help/${postId}`,
                          postId,
                          source: from ?? undefined,
                        })
                      }
                      className="inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-500 px-4 py-3 text-sm font-medium text-white hover:bg-amber-400"
                    >
                      Rate Us
                    </a>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </section>

      <AdSlot type="banner" variant="bottomBanner" />

      {isFunnel && !videoFunnel ? (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full bg-amber-500 px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg ring-4 ring-amber-200/80">
              {guideStage === "top"
                ? "Scroll down"
                : guideStage === "near"
                  ? "Almost there..."
                  : "You are here"}
            </div>
            {guideStage !== "reached" ? (
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg ring-4 ring-amber-200/70 motion-safe:animate-bounce">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 8l5 5 5-5" />
                </svg>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
