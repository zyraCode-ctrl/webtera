"use client";

import { useMemo, useState } from "react";
import { AdBox } from "@/components/AdBox";

function safeBtoaUtf8(input: string) {
  return btoa(unescape(encodeURIComponent(input)));
}

function safeAtobUtf8(input: string) {
  return decodeURIComponent(escape(atob(input)));
}

export function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    const trimmed = input;
    if (!trimmed) return { ok: true as const, text: "" };
    try {
      const text =
        mode === "encode" ? safeBtoaUtf8(trimmed) : safeAtobUtf8(trimmed);
      return { ok: true as const, text };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid input";
      return { ok: false as const, text: msg };
    }
  }, [input, mode]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm font-medium text-zinc-800">Input</label>
        <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setMode("encode")}
            className={[
              "rounded-md px-3 py-1.5 text-sm font-medium transition",
              mode === "encode"
                ? "bg-zinc-900 text-white"
                : "text-zinc-700 hover:bg-zinc-50",
            ].join(" ")}
          >
            Encode
          </button>
          <button
            type="button"
            onClick={() => setMode("decode")}
            className={[
              "rounded-md px-3 py-1.5 text-sm font-medium transition",
              mode === "decode"
                ? "bg-zinc-900 text-white"
                : "text-zinc-700 hover:bg-zinc-50",
            ].join(" ")}
          >
            Decode
          </button>
        </div>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
        className="min-h-[180px] w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm leading-6 text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
        placeholder={
          mode === "encode" ? "Enter text to encode..." : "Paste Base64 to decode..."
        }
      />

      {/* Ad below tool input */}
      <AdBox type="inline" />

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-zinc-800">Result</div>
          <div
            className={
              result.ok
                ? "text-xs font-medium text-emerald-700"
                : "text-xs font-medium text-rose-700"
            }
          >
            {result.ok ? "Ready" : "Error"}
          </div>
        </div>
        <pre className="mt-3 max-h-[360px] overflow-auto rounded-lg bg-zinc-50 p-3 text-xs leading-6 text-zinc-800">
          {result.text || "—"}
        </pre>
      </div>

      {/* Ad below result section */}
      <AdBox type="inline" />
    </div>
  );
}

