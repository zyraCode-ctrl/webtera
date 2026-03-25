export const metadata = {
  title: "Terms of Use",
  description: "Terms of use for WebTera Tools.",
};

export default function TermsPage() {
  return (
    <div className="min-w-0 w-full space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Terms of Use</h1>
        <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-600">
          <p>By using this website, you agree to use the tools lawfully and responsibly.</p>
          <p>
            The tools are provided &quot;as is&quot; without guarantees of availability or
            fitness for specific legal/compliance requirements.
          </p>
          <p>We may update features, policies, and layouts at any time.</p>
        </div>
      </section>
    </div>
  );
}

