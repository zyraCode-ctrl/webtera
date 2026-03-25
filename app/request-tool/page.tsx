"use client";

import { useState } from "react";
import { AdBox } from "@/components/AdBox";
import { trackEvent } from "@/lib/analytics";
import { TrackPageView } from "@/components/analytics/TrackPageView";

export default function RequestToolPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [toolName, setToolName] = useState("");
  const [details, setDetails] = useState("");

  return (
    <div className="min-w-0 w-full space-y-6">
      <TrackPageView event="request_tool_page_view" path="/request-tool" />
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
          Community
        </span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          Request a New Tool
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Tell us what tool you need. We prioritize requests based on demand,
          usefulness, and implementation time.
        </p>
      </section>

      <AdBox type="banner" />

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        {submitted ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-sm font-semibold text-emerald-800">
              Request received
            </div>
            <p className="mt-1 text-sm leading-6 text-emerald-700">
              Thanks! We review tool ideas regularly and add high-demand tools to
              our roadmap.
            </p>
          </div>
        ) : null}

        <form
          className="mt-1 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
              const res = await fetch("/api/request-tool", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name, email, toolName, details }),
              });
              const json = await res.json();
              if (!res.ok || !json?.ok) {
                throw new Error(json?.error || "Submission failed");
              }
              setSubmitted(true);
              trackEvent({
                event: "request_tool_submitted",
                path: "/request-tool",
                meta: { toolName },
              });
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Could not submit request";
              setError(message);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-800">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                placeholder="Your name"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-800">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <label className="space-y-1">
            <span className="text-sm font-medium text-zinc-800">Tool idea</span>
            <input
              required
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="Example: Image Compressor"
            />
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-zinc-800">
              Details / use case
            </span>
            <textarea
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[150px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="Describe what inputs/outputs you need and how you would use this tool."
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              Requests are submitted to your configured webhook/API endpoint.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              {loading ? "Submitting..." : "Submit request"}
            </button>
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </form>
      </section>

      <AdBox type="inline" />

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-zinc-950">What gets built first?</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-6 text-zinc-600">
          <li>High demand from multiple users</li>
          <li>Simple and fast browser-based implementation</li>
          <li>Clear practical use cases</li>
        </ul>
      </section>
    </div>
  );
}

