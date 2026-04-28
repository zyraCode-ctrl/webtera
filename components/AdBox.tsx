"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Script from "next/script";

export type AdBoxType = "banner" | "bannerMobile" | "box" | "inline";

type InvokeConfig = { key: string; width: number; height: number };

let invokeQueue: Promise<void> = Promise.resolve();
let adRequestsBlocked = false;
const AD_BLOCKED_SESSION_KEY = "wt_ads_blocked_v1";

function isAdRequestsBlocked() {
  if (adRequestsBlocked) return true;
  try {
    const v = window.sessionStorage.getItem(AD_BLOCKED_SESSION_KEY);
    if (v === "1") {
      adRequestsBlocked = true;
      return true;
    }
  } catch {
    // ignore storage failures
  }
  return false;
}

function markAdRequestsBlocked() {
  adRequestsBlocked = true;
  try {
    window.sessionStorage.setItem(AD_BLOCKED_SESSION_KEY, "1");
  } catch {
    // ignore storage failures
  }
}

function isLocalDevHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

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
      ? process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT_BANNER
      : type === "bannerMobile"
        ? process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT_BANNER_MOBILE
        : type === "inline"
          ? process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT_INLINE
          : process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT_BOX;
  const t = v?.trim();
  if (!t) return undefined;
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;
    return u.toString();
  } catch {
    return undefined;
  }
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

function queueInvokeLoad(
  invoke: InvokeConfig,
  container: HTMLElement | null
): Promise<boolean> {
  if (!container) return Promise.resolve(false);
  if (isAdRequestsBlocked()) return Promise.resolve(false);
  const task = invokeQueue.then(
    () =>
      new Promise<boolean>((resolve) => {
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
            retry.onload = () => resolve(!!container.querySelector("iframe"));
            retry.onerror = () => resolve(false);
            container.appendChild(retry);
            return;
          }
          resolve(hasRenderedAd);
        };
        s.onload = done;
        s.onerror = () => {
          markAdRequestsBlocked();
          resolve(false);
        };
        container.appendChild(s);
      })
  );
  invokeQueue = task.then(() => undefined, () => undefined);
  return task;
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
  const [isHydrated, setIsHydrated] = useState(false);
  const [diagStatus, setDiagStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [disabledByClient, setDisabledByClient] = useState(false);
  const [disabledOnLocalhost, setDisabledOnLocalhost] = useState(false);

  const showDiagnostics =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_AD_DEBUG === "1";
  const allowLocalAds = process.env.NEXT_PUBLIC_AD_ALLOW_LOCALHOST === "1";

  useEffect(() => {
    setIsHydrated(true);
    setDisabledByClient(isAdRequestsBlocked());
    setDisabledOnLocalhost(isLocalDevHost() && !allowLocalAds);
  }, [allowLocalAds]);

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
    if (!isHydrated || !invoke || mounted.current || disabledByClient || disabledOnLocalhost) return;
    mounted.current = true;
    setDiagStatus("loading");
    const el = document.getElementById(domId);
    if (el) el.innerHTML = "";
    void queueInvokeLoad(invoke, el).then((ok) => {
      if (!ok) setDisabledByClient(isAdRequestsBlocked());
      setDiagStatus(ok ? "loaded" : "error");
    });
  }, [invoke, domId, isHydrated, disabledByClient, disabledOnLocalhost]);

  const diagnosticsBadge = (
    <div className="pointer-events-none absolute left-2 top-2 z-10 rounded bg-black/80 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
      {type} · {scriptSrc ? "script" : invoke ? "invoke" : "fallback"} · {diagStatus}
    </div>
  );

  if (scriptSrc && isHydrated && !disabledByClient && !disabledOnLocalhost) {
    return (
      <div
        id={domId}
        className={["relative", base, fallbackSize, className].filter(Boolean).join(" ")}
      >
        {showDiagnostics ? diagnosticsBadge : null}
        <Script
          id={`${domId}-script`}
          src={scriptSrc}
          strategy="afterInteractive"
          onLoad={() => setDiagStatus("loaded")}
          onError={() => {
            markAdRequestsBlocked();
            setDisabledByClient(true);
            setDiagStatus("error");
          }}
        />
      </div>
    );
  }

  if (invoke && isHydrated && !disabledByClient && !disabledOnLocalhost) {
    return (
      <div
        id={domId}
        className={["relative", base, fallbackSize, className].filter(Boolean).join(" ")}
        style={{ minHeight: invoke.height }}
      >
        {showDiagnostics ? diagnosticsBadge : null}
      </div>
    );
  }

  return (
    <div
      className={["relative", base, fallbackSize, "grid place-items-center", className]
        .filter(Boolean)
        .join(" ")}
    >
      {showDiagnostics ? diagnosticsBadge : null}
      <div className="text-xs font-medium uppercase tracking-wider">
        {disabledOnLocalhost
          ? "Ads disabled on localhost"
          : disabledByClient
            ? "Ads blocked by browser"
            : "Ad Space"}
      </div>
    </div>
  );
}
