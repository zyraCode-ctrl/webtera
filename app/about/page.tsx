export const metadata = {
  title: "About",
  description: "About WebTera Tools.",
};

export default function AboutPage() {
  return (
    <div className="min-w-0 w-full space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
        </div>
        <div className="relative">
          <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
            About Us
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            About WebTera Tools
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

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
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
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
    </article>
  );
}

