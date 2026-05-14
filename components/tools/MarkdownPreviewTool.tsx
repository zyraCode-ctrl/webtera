"use client";

import { useState } from "react";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { AdBox } from "@/components/AdBox";

export function MarkdownPreviewTool() {
  const [markdown, setMarkdown] = useState<string>("# Hello Markdown\n\nStart typing **markdown** here to see it rendered instantly.");
  const [toast, setToast] = useState<string | null>(null);

  const html = sanitizeHtml(marked.parse(markdown) as string, {
    allowedTags: sanitizeHtml.defaults.allowedTags,
    allowedAttributes: sanitizeHtml.defaults.allowedAttributes,
  });

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="surface-panel p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-zinc-800">Markdown Editor</label>
             <div className="text-xs text-zinc-500">{toast ? toast : "Input"}</div>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="min-h-[300px] w-full rounded-xl border border-violet-200/55 bg-white/95 backdrop-blur-sm p-3 text-sm leading-6 text-zinc-900 shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-300/35 font-mono"
            placeholder="Type your markdown here..."
          />
          <div className="mt-4 flex justify-end">
            <button
               type="button"
               onClick={async () => {
                 await navigator.clipboard.writeText(markdown);
                 setToast("Copied Raw!");
                 window.setTimeout(() => setToast(null), 1200);
               }}
               className="inline-flex items-center justify-center rounded-lg border border-violet-200/55 bg-white/95 px-4 py-2 backdrop-blur-sm text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            >
              Copy Markdown
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="surface-panel p-5 sm:p-6">
          <label className="text-sm font-medium text-zinc-800 mb-3 block">Live Preview</label>
          <div 
            className="prose prose-zinc prose-sm min-h-[300px] w-full max-w-none rounded-xl border border-zinc-200 bg-zinc-50 p-4 overflow-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </section>

      <AdBox type="inline" />
    </div>
  );
}
