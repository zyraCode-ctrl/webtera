"use client";

import { useMemo, useState } from "react";
import { AdBox } from "@/components/AdBox";

function randomInt(maxExclusive: number) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % maxExclusive;
}

function generatePassword(opts: {
  length: number;
  lower: boolean;
  upper: boolean;
  numbers: boolean;
  symbols: boolean;
}) {
  const sets = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{};:,.?/|~",
  };

  const pool =
    (opts.lower ? sets.lower : "") +
    (opts.upper ? sets.upper : "") +
    (opts.numbers ? sets.numbers : "") +
    (opts.symbols ? sets.symbols : "");

  if (!pool) return "";

  let out = "";
  for (let i = 0; i < opts.length; i++) {
    out += pool[randomInt(pool.length)];
  }
  return out;
}

export function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [seed, setSeed] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const password = useMemo(() => {
    void seed;
    return generatePassword({ length, lower, upper, numbers, symbols });
  }, [length, lower, upper, numbers, symbols, seed]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-zinc-800">Length</div>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="range"
                min={6}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full"
              />
              <span className="w-10 text-right text-sm font-medium text-zinc-700">
                {length}
              </span>
            </div>
          </label>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-zinc-800">Options</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-zinc-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={lower}
                  onChange={(e) => setLower(e.target.checked)}
                />
                Lowercase
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={upper}
                  onChange={(e) => setUpper(e.target.checked)}
                />
                Uppercase
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={numbers}
                  onChange={(e) => setNumbers(e.target.checked)}
                />
                Numbers
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={symbols}
                  onChange={(e) => setSymbols(e.target.checked)}
                />
                Symbols
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Ad below tool input */}
      <AdBox type="inline" />

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium text-zinc-800">
              Generated password
            </div>
            <div className="text-xs text-zinc-500">
              Tip: disable symbols for sites with strict rules.
            </div>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => setSeed((s) => s + 1)}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 sm:flex-none"
            >
              Regenerate
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!password) return;
                await navigator.clipboard.writeText(password);
                setToast("Copied!");
                window.setTimeout(() => setToast(null), 1200);
              }}
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 sm:flex-none"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="mt-3 rounded-lg bg-zinc-50 p-3 font-mono text-sm text-zinc-900">
          {password || "Select at least one option."}
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-zinc-500">{toast ? toast : "Actions"}</div>
          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              disabled={!password}
              onClick={() => {
                if (!password) return;
                const blob = new Blob([password + "\n"], {
                  type: "text/plain;charset=utf-8",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "password.txt";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                setToast("Downloaded!");
                window.setTimeout(() => setToast(null), 1200);
              }}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white enabled:hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
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

