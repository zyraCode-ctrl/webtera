"use client";

import { useMemo, useState } from "react";
import { AdBox } from "@/components/AdBox";

const loremWords = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
  "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

function generateParagraph() {
  const sentenceCount = Math.floor(Math.random() * 4) + 4;
  const sentences = [];
  for (let i = 0; i < sentenceCount; i++) {
    const wordCount = Math.floor(Math.random() * 8) + 6;
    const words = [];
    for (let j = 0; j < wordCount; j++) {
      let word = loremWords[Math.floor(Math.random() * loremWords.length)];
      if (j === 0) word = word.charAt(0).toUpperCase() + word.slice(1);
      words.push(word);
    }
    sentences.push(words.join(" ") + ".");
  }
  return sentences.join(" ");
}

export function LoremIpsumTool() {
  const [paragraphs, setParagraphs] = useState<number>(3);
  const [toast, setToast] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const text = useMemo(() => {
    // Generate paragraphs
    const paras = [];
    for (let i = 0; i < paragraphs; i++) {
      paras.push(generateParagraph());
    }
    // To suppress a warning about not using version
    if (version < 0) return "";
    return paras.join("\n\n");
  }, [paragraphs, version]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium text-zinc-800">Settings</label>
        </div>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-600">Paragraphs:</label>
            <input
              type="number"
              min="1"
              max="50"
              value={paragraphs}
              onChange={(e) => setParagraphs(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-20 rounded-lg border border-zinc-200 p-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>
          <button
            type="button"
            onClick={() => setVersion((v) => v + 1)}
            className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Regenerate
          </button>
        </div>
      </section>

      <AdBox type="inline" />

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-zinc-800">Result</div>
          <div className="text-xs text-zinc-500">{toast ? toast : "Actions"}</div>
        </div>

        <div className="mt-4">
          <textarea
            value={text}
            readOnly
            className="min-h-[240px] w-full rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-900 shadow-sm outline-none"
          />
        </div>

        <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(text);
              setToast("Copied!");
              window.setTimeout(() => setToast(null), 1200);
            }}
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Copy Text
          </button>
        </div>
      </section>

      <AdBox type="inline" />
    </div>
  );
}
