"use client";

import { useMemo, useState } from "react";
import { AdBox } from "@/components/AdBox";

export function WordCounterTool() {
  const [text, setText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const lines = text ? text.split(/\r?\n/).length : 0;
    return { words, characters, charactersNoSpaces, lines };
  }, [text]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <label className="text-sm font-medium text-zinc-800">Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-3 min-h-[240px] w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm leading-6 text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
          placeholder="Paste or type your text here..."
        />
      </section>

      {/* Ad below tool input */}
      <AdBox type="inline" />

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-zinc-800">Results</div>
          <div className="text-xs text-zinc-500">{toast ? toast : "Actions"}</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Words" value={stats.words} />
          <Stat label="Characters" value={stats.characters} />
          <Stat label="No spaces" value={stats.charactersNoSpaces} />
          <Stat label="Lines" value={stats.lines} />
        </div>

        <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={async () => {
              const payload = JSON.stringify(stats, null, 2);
              await navigator.clipboard.writeText(payload);
              setToast("Copied!");
              window.setTimeout(() => setToast(null), 1200);
            }}
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Copy stats
          </button>
          <button
            type="button"
            onClick={() => {
              const payload = JSON.stringify(stats, null, 2);
              const blob = new Blob([payload], {
                type: "application/json;charset=utf-8",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "word-count.json";
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
              setToast("Downloaded!");
              window.setTimeout(() => setToast(null), 1200);
            }}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Download
          </button>
        </div>
      </section>

      {/* Ad below result section */}
      <AdBox type="inline" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums text-zinc-950">
        {value}
      </div>
    </div>
  );
}

