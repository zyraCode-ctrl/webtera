export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for WebTera Tools.",
};

export default function PrivacyPage() {
  return (
    <div className="min-w-0 w-full space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Privacy Policy</h1>
        <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-600">
          <p>We aim to collect minimal data needed to operate and improve this website.</p>
          <p>
            Funnel and interaction events may be tracked in aggregate form for
            analytics and performance optimization.
          </p>
          <p>
            If ad providers are enabled, they may set cookies according to their
            own policies.
          </p>
        </div>
      </section>
    </div>
  );
}

