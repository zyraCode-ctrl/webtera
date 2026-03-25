"use client";

import { useEffect, useMemo, useState } from "react";

export function Redirector({ to }: { to: string }) {
  const delayMs = useMemo(() => 2000 + Math.floor(Math.random() * 1000), []);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const tick = window.setInterval(() => {
      setElapsed(Date.now() - started);
    }, 100);
    const timer = window.setTimeout(() => {
      window.location.href = to;
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(tick);
    };
  }, [to, delayMs]);

  const pct = Math.min(100, Math.round((elapsed / delayMs) * 100));

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-zinc-800">
        Loading your content...
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full bg-zinc-900 transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-zinc-500">Redirecting in a moment.</div>
    </div>
  );
}

