"use client";

import { useState } from "react";
import { AdBox } from "@/components/AdBox";

type Mode = "encode" | "decode";

export function UrlEncoderTool() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [toast, setToast] = useState<string | null>(null);

  const result = (() => {
    if (!text) return "";
    try {
      if (mode === "encode") {
        return encodeURIComponent(text);
      } else {
        return decodeURIComponent(text);
      }
    } catch (e) {
      return "Error: Invalid encoded string";
    }
  })();

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <label className="text-sm font-medium text-zinc-800">Mode</label>
        </div>
        <div className="flex p-1 bg-zinc-100 rounded-lg w-fit mb-4">
          <button
            onClick={() => setMode("encode")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === "encode" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              mode === "decode" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Decode
          </button>
        </div>

        <label className="text-sm font-medium text-zinc-800">
          {mode === "encode" ? "Text to Encode" : "Text to Decode"}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-3 min-h-[160px] w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm leading-6 text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
          placeholder="Paste text or URL parameters here..."
        />
      </section>

      <AdBox type="inline" />

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-zinc-800">Result</div>
          <div className="text-xs text-zinc-500">{toast ? toast : "Actions"}</div>
        </div>

        <div className="mt-4">
          <textarea
            value={result}
            readOnly
            className="min-h-[160px] w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-900 shadow-sm outline-none font-mono break-all"
          />
        </div>

        <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            disabled={!result || result.startsWith("Error")}
            onClick={async () => {
              await navigator.clipboard.writeText(result);
              setToast("Copied!");
              window.setTimeout(() => setToast(null), 1200);
            }}
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            Copy Result
          </button>
        </div>
      </section>

      <AdBox type="inline" />
    </div>
  );
}
