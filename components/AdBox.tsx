"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import Script from "next/script";

export type AdBoxType = "banner" | "bannerMobile" | "box" | "inline";

type InvokeConfig = { key: string; width: number; height: number };

let invokeQueue: Promise<void> = Promise.resolve();

function parseInvoke(raw: string | undefined): InvokeConfig | null {
  if (!raw?.trim()) return null;
  try {
    const j = JSON.parse(raw) as {
      key?: string;
      width?: number;
      height?: number;
      w?: number;
      h?: number;
    };
    const key = j.key?.trim();
    const width = typeof j.width === "number" ? j.width : j.w;
    const height = typeof j.height === "number" ? j.height : j.h;
    if (!key || typeof width !== "number" || typeof height !== "number") return null;
    return { key, width, height };
  } catch {
    return null;
  }
}

function envScriptForType(type: AdBoxType): string | undefined {
  const v =
    type === "banner"
      ? process.env.NEXT_PUBLIC_ADSTERRA_INVOKE_BANNER
      : type === "bannerMobile"
        ? process.env.NEXT_PUBLIC_ADSTERRA_INVOKE_BANNER_MOBILE
        : type === "inline"
          ? process.env.NEXT_PUBLIC_ADSTERRA_INVOKE_INLINE
          : process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT_BOX;
  const t = v?.trim();
  return t || undefined;
}

function envInvokeForType(type: AdBoxType): InvokeConfig | null {
  const raw =
    type === "banner"
      ? process.env.NEXT_PUBLIC_ADSTERRA_INVOKE_BANNER
      : type === "bannerMobile"
        ? process.env.NEXT_PUBLIC_ADSTERRA_INVOKE_BANNER_MOBILE
        : type === "inline"
          ? process.env.NEXT_PUBLIC_ADSTERRA_INVOKE_INLINE
          : process.env.NEXT_PUBLIC_ADSTERRA_INVOKE_BOX;
  return parseInvoke(raw);
}

function resolveScriptSrc(type: AdBoxType): string | undefined {
  // Keep sidebar box ads on their dedicated zone (typically 160x600).
  if (type === "box") return envScriptForType("box") ?? envScriptForType("banner");
  return envScriptForType(type) ?? envScriptForType("banner");
}

function resolveInvoke(type: AdBoxType): InvokeConfig | null {
  // Keep sidebar box ads on their dedicated zone (typically 160x600).
  if (type === "box") return envInvokeForType("box") ?? envInvokeForType("banner");
  return envInvokeForType(type) ?? envInvokeForType("banner");
}

function invokeBaseUrl(): string {
  const b = process.env.NEXT_PUBLIC_ADSTERRA_INVOKE_BASE?.trim();
  return (b || "https://www.highperformanceformat.com").replace(/\/+$/, "");
}

function queueInvokeLoad(invoke: InvokeConfig, container: HTMLElement | null) {
  if (!container) return;
  invokeQueue = invokeQueue.then(
    () =>
      new Promise<void>((resolve) => {
        const w = window as Window & {
          atOptions?: Record<string, unknown>;
        };
        w.atOptions = {
          key: invoke.key,
          format: "iframe",
          height: invoke.height,
          width: invoke.width,
          params: {},
        };
        const s = document.createElement("script");
        s.src = `${invokeBaseUrl()}/${invoke.key}/invoke.js`;
        s.async = true;
        let retried = false;
        const done = () => {
          // Retry once if provider script loaded but ad iframe did not render.
          const hasRenderedAd = !!container.querySelector("iframe");
          if (!hasRenderedAd && !retried) {
            retried = true;
            const retry = document.createElement("script");
            retry.src = s.src;
            retry.async = true;
            retry.onload = () => resolve();
            retry.onerror = () => resolve();
            container.appendChild(retry);
            return;
          }
          resolve();
        };
        s.onload = done;
        s.onerror = done;
        container.appendChild(s);
      })
  );
}

export function AdBox({
  type = "banner",
  className,
}: {
  type?: AdBoxType;
  className?: string;
}) {
  const scriptSrc = useMemo(() => resolveScriptSrc(type), [type]);
  const invoke = useMemo(() => resolveInvoke(type), [type]);
  const reactId = useId();
  const domId = useMemo(() => `adsterra-${reactId.replace(/:/g, "")}`, [reactId]);
  const mounted = useRef(false);

  const base =
    "w-full rounded-lg border border-dashed border-zinc-300 bg-zinc-100 text-zinc-500 overflow-hidden";

  const fallbackSize =
    type === "banner"
      ? "h-20 sm:h-24"
      : type === "bannerMobile"
        ? "h-[50px] max-w-[320px] mx-auto"
        : type === "inline"
          ? "min-h-[250px] sm:min-h-[250px] max-w-[300px] mx-auto"
          : "min-h-[600px] max-w-[160px] mx-auto";

  useEffect(() => {
    if (!invoke || mounted.current) return;
    mounted.current = true;
    const el = document.getElementById(domId);
    if (el) el.innerHTML = "";
    queueInvokeLoad(invoke, el);
  }, [invoke, domId]);

  if (scriptSrc) {
    return (
      <div
        id={domId}
        className={[base, fallbackSize, className].filter(Boolean).join(" ")}
      >
        <Script
          id={`${domId}-script`}
          src={scriptSrc}
          strategy="afterInteractive"
        />
      </div>
    );
  }

  if (invoke) {
    return (
      <div
        id={domId}
        className={[base, fallbackSize, className].filter(Boolean).join(" ")}
        style={{ minHeight: invoke.height }}
      />
    );
  }

  return (
    <div
      className={[base, fallbackSize, "grid place-items-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="text-xs font-medium uppercase tracking-wider">
        Ad Space
      </div>
    </div>
  );
}
