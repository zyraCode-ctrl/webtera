import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { toolContent } from "@/data/toolContent";
import { tools } from "@/data/tools";

export const metadata = {
  title: "How to Use All Tools – Help",
  description:
    "Complete how-to documentation for every tool on WebTera. Step-by-step guides, examples, benefits, and FAQ for all tools in one page.",
};

const TOOL_SLUGS = Object.keys(toolContent) as Array<keyof typeof toolContent>;

export default function ToolsHelpPage() {
  return (
    <div className="min-w-0 w-full space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-violet-50/70 to-cyan-50/50 shadow-lg shadow-violet-950/[0.04] ring-1 ring-black/[0.03]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-gradient-to-br from-violet-400/35 via-fuchsia-400/20 to-transparent blur-3xl" />
          <div className="absolute -right-20 top-1/3 h-60 w-60 rounded-full bg-gradient-to-bl from-cyan-400/30 via-sky-400/15 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-48 w-64 rounded-full bg-gradient-to-tr from-amber-300/22 to-orange-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-transparent to-white/75" />
        </div>
        <div className="relative px-6 py-12 text-center sm:px-10">
          <div className="inline-block rounded-full border border-violet-200/80 bg-violet-50/90 px-4 py-1 text-xs font-bold uppercase tracking-widest text-violet-700 mb-4">
            Documentation
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            How to Use{" "}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
              All Tools
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-zinc-600">
            Everything you need to get the most out of every tool on WebTera — in one easy page.
          </p>
        </div>
      </section>

      {/* Ad directly under hero ("How to Use All Tools") */}
      <AdSlot type="banner" variant="topBanner" />

      {/* Jump Navigation */}
      <nav className="surface-panel p-5">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">
          Jump to a Tool
        </div>
        <div className="flex flex-wrap gap-2">
          {TOOL_SLUGS.map((slug) => {
            const tool = tools.find((t) => t.slug === slug);
            if (!tool) return null;
            return (
              <Link
                key={slug}
                href={`#${slug}`}
                className="inline-block rounded-lg border border-violet-200/55 bg-violet-50/70 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-violet-400 hover:bg-violet-50/90 hover:text-violet-800 transition-colors"
              >
                {tool.title}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Tool Sections */}
      {TOOL_SLUGS.map((slug, idx) => {
        const tool = tools.find((t) => t.slug === slug);
        const content = toolContent[slug];
        if (!tool || !content) return null;

        return (
          <div key={slug}>
            {/* Tool Section */}
            <section
              id={slug}
              className="surface-panel scroll-mt-6 p-6 sm:p-8 space-y-6"
            >
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm font-bold shadow">
                  {idx + 1}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-zinc-950">
                    {tool.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{content.what}</p>
                </div>
              </div>

              <hr className="border-zinc-100" />

              {/* How To */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-violet-700 mb-3">
                  How to Use
                </h3>
                <ol className="space-y-2 pl-0 list-none">
                  {content.howTo.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-zinc-700 leading-6">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-800">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Example */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-violet-700 mb-3">
                  Example
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-zinc-950 p-4">
                    <div className="text-xs font-semibold text-zinc-400 mb-2">
                      {content.example.inputLabel}
                    </div>
                    <pre className="text-xs text-violet-300 font-mono whitespace-pre-wrap break-all">
                      {content.example.input}
                    </pre>
                  </div>
                  <div className="rounded-xl bg-zinc-950 p-4">
                    <div className="text-xs font-semibold text-zinc-400 mb-2">
                      {content.example.outputLabel}
                    </div>
                    <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap break-all">
                      {content.example.output}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-violet-700 mb-3">
                  Benefits
                </h3>
                <ul className="space-y-2">
                  {content.benefits.map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-700 leading-6">
                      <span className="text-violet-500 mt-0.5">✦</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQ */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-violet-700 mb-3">
                  FAQ
                </h3>
                <div className="space-y-3">
                  {content.faq.map((f, i) => (
                    <details
                      key={i}
                      className="group rounded-xl border border-zinc-200/85 bg-zinc-50/90 backdrop-blur-sm open:border-violet-300/80 open:bg-violet-50/70"
                    >
                      <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-zinc-800 group-open:text-violet-800 list-none">
                        <span>{f.q}</span>
                        <span className="text-zinc-400 group-open:text-violet-600 text-lg leading-none">+</span>
                      </summary>
                      <div className="px-4 pb-4 pt-1 text-sm leading-6 text-zinc-600">
                        {f.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Back to top */}
              <div className="pt-2">
                <Link
                  href="#"
                  className="text-xs font-medium text-zinc-400 hover:text-violet-700 transition-colors"
                >
                  ↑ Back to top
                </Link>
              </div>
            </section>

            {/* Ad after every tool section */}
            <AdSlot type="inline" variant="inContent" className="mt-8" />
          </div>
        );
      })}

      {/* Bottom Ad */}
      <AdSlot type="banner" variant="bottomBanner" />
    </div>
  );
}
