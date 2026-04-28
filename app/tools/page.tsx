import { AdSlot } from "@/components/AdSlot";
import { ToolCard } from "@/components/ToolCard";
import { tools } from "@/data/tools";
import Link from "next/link";

export const metadata = {
  title: "Tools",
  description: "Browse all available tools.",
};

export default function ToolsPage() {
  return (
    <div className="min-w-0 w-full space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Tools
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Quick, lightweight utilities designed for mobile-first use.
        </p>
      </section>

      <AdSlot type="banner" variant="topBanner" />

      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <div key={t.slug}>
              <ToolCard
                title={t.title}
                description={t.description}
                href={`/tools/${t.slug}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-3">
          <Link
            href="/request-tool"
            className="block rounded-2xl border border-dashed border-zinc-300 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-400 hover:shadow-md"
          >
            <div className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
              Coming Soon
            </div>
            <h3 className="mt-3 text-base font-semibold text-zinc-950">
              More tools are on the way
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              We are adding new utility tools regularly. Keep checking this
              page for fresh launches.
            </p>
            <div className="mt-3 inline-flex text-sm font-medium text-zinc-900">
              Request a tool →
            </div>
          </Link>
        </div>
      </section>

      <AdSlot type="banner" variant="bottomBanner" />
    </div>
  );
}

