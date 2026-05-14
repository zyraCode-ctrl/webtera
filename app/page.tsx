import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { ToolCard } from "@/components/ToolCard";
import { tools } from "@/data/tools";

export default function Home() {
  return (
    <div className="min-w-0 w-full space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-violet-50/70 to-cyan-50/50 shadow-lg shadow-violet-950/[0.04] ring-1 ring-black/[0.03]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-gradient-to-br from-violet-400/35 via-fuchsia-400/20 to-transparent blur-3xl" />
          <div className="absolute -right-20 top-1/2 h-[22rem] w-[22rem] -translate-y-1/2 rounded-full bg-gradient-to-bl from-cyan-400/30 via-sky-400/15 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-56 w-72 rounded-full bg-gradient-to-tr from-amber-300/25 to-orange-400/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.45]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(24 24 27 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(24 24 27 / 0.06) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/80" />
        </div>

        <div className="relative px-4 py-12 text-center sm:px-10 sm:py-[4.25rem]">
          <div className="mx-auto mb-5 flex max-w-xl flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center rounded-full border border-violet-200/90 bg-white/75 px-3 py-1 text-xs font-semibold tracking-wide text-violet-800 shadow-sm shadow-violet-900/5 backdrop-blur-md">
              Quick to load
            </span>
            <span className="inline-flex items-center rounded-full border border-cyan-200/90 bg-white/75 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-900 shadow-sm shadow-cyan-900/5 backdrop-blur-md">
              Easy to use
            </span>
            <span className="inline-flex items-center rounded-full border border-amber-200/90 bg-white/75 px-3 py-1 text-xs font-semibold tracking-wide text-amber-900 shadow-sm shadow-amber-900/5 backdrop-blur-md">
              Mobile-first
            </span>
          </div>

          <h1 className="mx-auto max-w-3xl text-balance text-3xl font-bold tracking-tight text-zinc-950 sm:text-5xl sm:leading-[1.08]">
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
              Simple, fast
            </span>{" "}
            online tools
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-600 sm:text-lg sm:leading-8">
            Lightweight utilities that feel like a modern product: quick to load,
            easy to use, and built for mobile from day one.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/tools"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-violet-600/25 ring-1 ring-white/20 transition hover:from-violet-500 hover:via-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-600/30 active:scale-[0.98]"
            >
              Browse Tools
            </Link>
            <Link
              href="/tools/json-formatter"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200/90 bg-white/80 px-5 py-3 text-sm font-semibold text-zinc-900 shadow-sm backdrop-blur-md transition hover:border-zinc-300 hover:bg-white active:scale-[0.98]"
            >
              Try JSON Formatter
            </Link>
          </div>
        </div>
      </section>

      {/* Top ad (natural placement after hero) */}
      <AdSlot type="banner" variant="topBanner" />

      {/* Tools */}
      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
              Tools
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Pick a tool and get results instantly.
            </p>
          </div>
          <Link
            href="/tools"
            className="text-sm font-medium text-zinc-700 transition hover:text-violet-700 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <ToolCard
              key={t.slug}
              title={t.title}
              description={t.description}
              href={`/tools/${t.slug}`}
            />
          ))}
        </div>
      </section>

      {/* In-content slim banner between tools and benefits */}
      <section className="mx-auto w-full max-w-4xl">
        <AdSlot type="inline" variant="inContent" />
      </section>

      {/* Why choose us */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-violet-50/55 to-cyan-50/45 p-6 shadow-lg shadow-violet-950/[0.05] ring-1 ring-black/[0.03] sm:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-violet-300/25 blur-3xl" />
        </div>
        <div className="relative text-center">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
            Why choose us
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Built to be fast and simple, with a layout that stays readable on any
            screen.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Feature title="Fast" text="Optimized pages and lightweight UI for quick loads." />
          <Feature title="Free" text="No signup required. Just open a tool and go." />
          <Feature title="Mobile friendly" text="Designed mobile-first with clean spacing and taps." />
        </div>
      </section>

      {/* Bottom ad */}
      <AdSlot type="banner" variant="bottomBanner" />
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="surface-muted p-5 ring-1 ring-violet-400/[0.06]">
      <div className="text-sm font-semibold text-zinc-950">{title}</div>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
    </div>
  );
}
