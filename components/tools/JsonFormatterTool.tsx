"use client";

import { useMemo, useState } from "react";
import { AdBox } from "@/components/AdBox";

export function JsonFormatterTool() {
  const [input, setInput] = useState<string>(
    '{\n  "hello": "world",\n  "count": 2\n}\n'
  );
  const [indent, setIndent] = useState<number>(2);
  const [toast, setToast] = useState<string | null>(null);

  const result = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return { ok: true as const, text: "" };
    try {
      const parsed = JSON.parse(trimmed);
      return { ok: true as const, text: JSON.stringify(parsed, null, indent) };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid JSON";
      return { ok: false as const, text: msg };
    }
  }, [input, indent]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="text-sm font-medium text-zinc-800">
            JSON input
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Indent</span>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm font-medium text-zinc-800"
            >
              {[2, 4].map((n) => (
                <option key={n} value={n}>
                  {n} spaces
                </option>
              ))}
            </select>
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          className="mt-3 min-h-[240px] w-full rounded-xl border border-zinc-200 bg-white p-3 font-mono text-sm leading-6 text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
          placeholder='Paste JSON here...'
        />
      </section>

      {/* Ad below tool input */}
      <AdBox type="inline" />

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-zinc-800">Result</div>
          <div
            className={[
              "text-xs font-medium transition-colors",
              result.ok ? "text-emerald-700" : "text-rose-700",
            ].join(" ")}
          >
            {result.ok ? "Valid JSON" : "Error"}
          </div>
        </div>

        <pre className="mt-3 max-h-[360px] overflow-auto rounded-xl bg-zinc-50 p-3 text-xs leading-6 text-zinc-800 transition">
          {result.text || "—"}
        </pre>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-zinc-500">
            {toast ? toast : "Actions"}
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              disabled={!result.ok || !result.text}
              onClick={async () => {
                if (!result.ok || !result.text) return;
                await navigator.clipboard.writeText(result.text);
                setToast("Copied!");
                window.setTimeout(() => setToast(null), 1200);
              }}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white enabled:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              Copy
            </button>
            <button
              type="button"
              disabled={!result.ok || !result.text}
              onClick={() => {
                if (!result.ok || !result.text) return;
                const blob = new Blob([result.text], {
                  type: "application/json;charset=utf-8",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "formatted.json";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                setToast("Downloaded!");
                window.setTimeout(() => setToast(null), 1200);
              }}
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              Download
            </button>
          </div>
        </div>
      </section>

      {/* Ad below result section */}
      <AdBox type="inline" />
    </div>
  );
}

