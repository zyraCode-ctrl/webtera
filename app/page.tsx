import Link from "next/link";
import { AdBox } from "@/components/AdBox";
import { ToolCard } from "@/components/ToolCard";
import { tools } from "@/data/tools";

export default function Home() {
  return (
    <div className="min-w-0 w-full space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white" />
        </div>

        <div className="relative px-4 py-10 text-center sm:px-10 sm:py-16">
          <h1 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
            Simple, fast online tools
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            Lightweight utilities that feel like a modern product: quick to load,
            easy to use, and built for mobile from day one.
          </p>
          <div className="mx-auto mt-7 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/tools"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
            >
              Browse Tools
            </Link>
            <Link
              href="/tools/json-formatter"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              Try JSON Formatter
            </Link>
          </div>
        </div>
      </section>

      {/* Top ad (natural placement after hero) */}
      <AdBox type="banner" />

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
            className="text-sm font-medium text-zinc-700 hover:text-zinc-950 hover:underline"
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
        <AdBox type="inline" />
      </section>

      {/* Why choose us */}
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="text-center">
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
      <AdBox type="box" />
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="text-sm font-semibold text-zinc-950">{title}</div>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
    </div>
  );
}
