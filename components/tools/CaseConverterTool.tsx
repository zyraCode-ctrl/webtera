"use client";

import { useMemo, useState } from "react";
import { AdBox } from "@/components/AdBox";

function toTitleCase(s: string) {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

function toSentenceCase(s: string) {
  const trimmed = s.trimStart();
  if (!trimmed) return s;
  const idx = s.indexOf(trimmed);
  return (
    s.slice(0, idx) +
    trimmed.charAt(0).toUpperCase() +
    trimmed.slice(1).toLowerCase()
  );
}

export function CaseConverterTool() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<
    "upper" | "lower" | "title" | "sentence" | "snake" | "kebab"
  >("title");

  const result = useMemo(() => {
    switch (mode) {
      case "upper":
        return text.toUpperCase();
      case "lower":
        return text.toLowerCase();
      case "title":
        return toTitleCase(text);
      case "sentence":
        return toSentenceCase(text);
      case "snake":
        return text
          .trim()
          .replace(/\s+/g, " ")
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .replace(/\s/g, "_")
          .toLowerCase();
      case "kebab":
        return text
          .trim()
          .replace(/\s+/g, " ")
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .replace(/\s/g, "-")
          .toLowerCase();
      default:
        return text;
    }
  }, [text, mode]);

  const modes: Array<{ id: typeof mode; label: string }> = [
    { id: "title", label: "Title" },
    { id: "sentence", label: "Sentence" },
    { id: "upper", label: "UPPER" },
    { id: "lower", label: "lower" },
    { id: "snake", label: "snake_case" },
    { id: "kebab", label: "kebab-case" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm font-medium text-zinc-800">Text</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as typeof mode)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800"
        >
          {modes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-h-[180px] w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm leading-6 text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
        placeholder="Paste or type your text here..."
      />

      {/* Ad below tool input */}
      <AdBox type="inline" />

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-zinc-800">Result</div>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(result);
            }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Copy
          </button>
        </div>
        <pre className="mt-3 max-h-[360px] overflow-auto rounded-lg bg-zinc-50 p-3 text-xs leading-6 text-zinc-800">
          {result || "—"}
        </pre>
      </div>

      {/* Ad below result section */}
      <AdBox type="inline" />
    </div>
  );
}

