"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdBox } from "@/components/AdBox";
import { toolContent } from "@/data/toolContent";
import { tools } from "@/data/tools";
import { getPostLink, getDownloadLink, rateUsUrl } from "@/data/links";
import { trackEvent } from "@/lib/analytics";

type Props = { postId: string };

const TOOL_SLUGS = Object.keys(toolContent) as Array<keyof typeof toolContent>;

/** Show the CTA card right after the 6th tool (index 5). */
const CTA_TOOL_INDEX = 5;

export function HelpPage({ postId }: Props) {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const isFunnel = from === "video" || from === "download";

  const [showReveal, setShowReveal] = useState(false);
  const [showFloatingArrow, setShowFloatingArrow] = useState(true);
  const pageRef = useRef<HTMLDivElement>(null);
  const postLinkCtaRef = useRef<HTMLDivElement>(null);

  // Reveal box after user has scrolled through content.
  useEffect(() => {
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
  }, []);

  const postLink = getPostLink(postId);
  const downloadLink = getDownloadLink(postId);

  useEffect(() => {
    trackEvent({
      event: "help_page_view",
      path: `/help/${postId}`,
      postId,
      source: from ?? undefined,
    });
  }, [postId, from]);

  useEffect(() => {
    if (!showReveal || !isFunnel) return;
    trackEvent({
      event: "help_reveal_shown",
      path: `/help/${postId}`,
      postId,
      source: from ?? undefined,
    });
  }, [showReveal, isFunnel, postId, from]);

  useEffect(() => {
    if (!isFunnel) {
      setShowFloatingArrow(false);
      return;
    }

    setShowFloatingArrow(true);
    const target = postLinkCtaRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingArrow(!entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isFunnel, showReveal]);

  return (
    <div ref={pageRef} className="min-w-0 w-full space-y-6 pb-10">
      {isFunnel ? (
        <div className="sticky top-14 z-40 flex justify-center">
          <div className="mt-2 rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold text-white shadow-sm sm:px-5">
          Access the resources link and download below.
          </div>
        </div>
      ) : null}

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
        <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
          Help Center
        </span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          Tools Help Center
        </h1>
        <p className="mt-2 text-sm text-zinc-600">Complete guide for all tools — Post #{postId}</p>
      </section>

      <AdBox type="banner" />

      <section className="mx-auto w-full min-w-0 max-w-3xl space-y-4">
        {TOOL_SLUGS.map((slug, idx) => {
          const tool = tools.find((t) => t.slug === slug);
          const content = toolContent[slug];
          if (!tool || !content) return null;

          return (
            <div key={slug} className="space-y-4">
              <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
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

              {/* Funnel-only scroll sticker right before the inline ad */}
              {isFunnel && idx !== TOOL_SLUGS.length - 1 ? (
                <div>
                  <AdBox type="inline" />
                </div>
              ) : null}

              {/* Inline CTA after 6th tool, once user passes ~50% scroll */}
              {isFunnel && showReveal && idx === CTA_TOOL_INDEX ? (
                <div className="space-y-4 rounded-3xl border-2 border-indigo-200 bg-white p-5 shadow-xl ring-4 ring-indigo-100/80 sm:p-6">
                  <div className="text-center text-sm font-medium text-zinc-600">
                    For example, you can get resources in this type of box.
                  </div>
                  <div className="text-center text-sm font-semibold uppercase tracking-wider text-indigo-700 sm:text-base">
                    Your content is ready — Post #{postId}
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2 sm:p-3">
                    <AdBox type="banner" />
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
                            event: "help_click_download",
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
                        No Download
                      </span>
                    )}
                    {postLink ? (
                      <a
                        href={postLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackEvent({
                            event: "help_click_link",
                            path: `/help/${postId}`,
                            postId,
                            source: from ?? undefined,
                          })
                        }
                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-500"
                      >
                        Link
                      </a>
                    ) : (
                      <span className="inline-flex min-h-11 items-center justify-center rounded-lg bg-zinc-200 px-4 py-3 text-sm font-medium text-zinc-600">
                        No Link
                      </span>
                    )}
                    <a
                      href={rateUsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent({
                          event: "help_click_rate",
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

      <AdBox type="box" />

      {isFunnel && showFloatingArrow ? (
        <div className="pointer-events-none fixed bottom-24 left-1/2 z-50 -translate-x-1/2">
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
        </div>
      ) : null}
    </div>
  );
}
