"use client";

import { AdBox, type AdBoxType } from "@/components/AdBox";

type AdSlotVariant = "topBanner" | "inContent" | "sidebar" | "bottomBanner" | "mobileSticky";

const SLOT_STYLES: Record<AdSlotVariant, string> = {
  topBanner: "mx-auto w-full max-w-[760px]",
  inContent: "mx-auto w-full max-w-[340px]",
  sidebar: "mx-auto w-full max-w-[180px]",
  bottomBanner: "mx-auto w-full max-w-[760px]",
  mobileSticky: "w-full max-w-[340px] mx-auto",
};

const CARD_STYLES: Record<AdSlotVariant, string> = {
  topBanner: "rounded-xl border border-zinc-200 bg-white p-2 shadow-sm",
  inContent: "rounded-xl border border-zinc-200 bg-white p-2 shadow-sm",
  sidebar: "rounded-xl border border-zinc-200 bg-white p-2 shadow-sm",
  bottomBanner: "rounded-xl border border-zinc-200 bg-white p-2 shadow-sm",
  mobileSticky: "",
};

export function AdSlot({
  type,
  variant,
  className,
}: {
  type: AdBoxType;
  variant: AdSlotVariant;
  className?: string;
}) {
  const wrap = [SLOT_STYLES[variant], className].filter(Boolean).join(" ");
  const card = CARD_STYLES[variant];

  if (!card) {
    return (
      <div className={wrap}>
        <AdBox type={type} />
      </div>
    );
  }

  return (
    <section className={wrap}>
      <div className={card}>
        <AdBox type={type} />
      </div>
    </section>
  );
}
