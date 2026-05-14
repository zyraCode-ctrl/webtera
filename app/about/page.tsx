export const metadata = {
  title: "About",
  description: "About WebTera Tools.",
};

export default function AboutPage() {
  return (
    <div className="min-w-0 w-full space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-white via-violet-50/65 to-cyan-50/45 p-6 shadow-lg shadow-violet-950/[0.05] ring-1 ring-black/[0.03] sm:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-violet-400/35 via-fuchsia-400/18 to-transparent blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-gradient-to-bl from-cyan-400/28 to-transparent blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/70" />
        </div>
        <div className="relative">
          <span className="surface-brand-chip inline-flex px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-800">
            About Us
          </span>
          <h1 className="mt-3 text-balance text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
            About{" "}
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
              WebTera Tools
            </span>
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 sm:text-base">
            WebTera Tools is a lightweight collection of practical web utilities.
            We focus on speed, clarity, and mobile-first usability so people can
            solve everyday tasks quickly without complex setup.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard
          title="Our Mission"
          text="Build reliable browser-based tools that are simple, fast, and useful for everyone."
        />
        <InfoCard
          title="Our Approach"
          text="Clean interfaces, predictable output, and performance-first engineering."
        />
        <InfoCard
          title="Our Focus"
          text="Practical utility tools, continuous improvements, and transparent product evolution."
        />
      </section>

      <section className="surface-panel p-6">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
          Why users trust WebTera
        </h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-7 text-zinc-600">
          <li>Fast-loading pages and lightweight interactions</li>
          <li>Consistent layouts across desktop and mobile</li>
          <li>Focused tool design with minimal distractions</li>
          <li>Ongoing updates based on user feedback</li>
        </ul>
      </section>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="surface-panel p-5">
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
    </article>
  );
}

