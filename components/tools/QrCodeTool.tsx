"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { AdBox } from "@/components/AdBox";

export function QrCodeTool() {
  const [text, setText] = useState("");
  const [qrUrl, setQrUrl] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!text.trim()) {
      setQrUrl("");
      return;
    }
    QRCode.toDataURL(text, { width: 300, margin: 2 })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error(err));
  }, [text]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <label className="text-sm font-medium text-zinc-800">Text or URL</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="mt-3 min-h-[120px] w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm leading-6 text-zinc-900 shadow-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
          placeholder="Paste or type text, URL, contact info..."
        />
      </section>

      <AdBox type="inline" />

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-zinc-800">Result</div>
          <div className="text-xs text-zinc-500">{toast ? toast : "Actions"}</div>
        </div>

        <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 py-8 min-h-[200px] w-full">
            {qrUrl ? (
              <Image
                src={qrUrl}
                alt="QR Code"
                width={200}
                height={200}
                unoptimized
                className="h-[200px] w-[200px] rounded-lg shadow-sm"
              />
            ) : (
              <span className="text-sm text-zinc-400">Enter text to generate QR code</span>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <button
              type="button"
              disabled={!qrUrl}
              onClick={() => {
                const a = document.createElement("a");
                a.href = qrUrl;
                a.download = "qrcode.png";
                document.body.appendChild(a);
                a.click();
                a.remove();
                setToast("Downloaded!");
                window.setTimeout(() => setToast(null), 1200);
              }}
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              Download PNG
            </button>
          </div>
        </div>
      </section>

      <AdBox type="inline" />
    </div>
  );
}
