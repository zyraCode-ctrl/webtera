export const metadata = {
  title: "Contact",
  description: "Contact WebTera Tools.",
};

export default function ContactPage() {
  return (
    <div className="min-w-0 w-full space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Contact</h1>
        <p className="mt-2 text-sm leading-7 text-zinc-600">
          For partnerships, ad inquiries, or feedback, email us at{" "}
          <a href="mailto:support@webtera.tools" className="font-medium text-zinc-900 underline">
            support@webtera.tools
          </a>
          .
        </p>
      </section>
    </div>
  );
}

