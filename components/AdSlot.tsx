"use client";

import { AdBox, type AdBoxType } from "@/components/AdBox";

type AdSlotVariant =
  | "topBanner"
  | "inContent"
  | "sidebar"
  | "sidebarCompact"
  | "bottomBanner"
  | "mobileSticky";

const SLOT_STYLES: Record<AdSlotVariant, string> = {
  topBanner: "mx-auto w-full max-w-[760px]",
  inContent: "mx-auto w-full max-w-[340px]",
  sidebar: "mx-auto w-full max-w-[160px]",
  sidebarCompact: "mx-auto w-full max-w-full overflow-hidden",
  bottomBanner: "mx-auto w-full max-w-[760px]",
  mobileSticky: "w-full max-w-[340px] mx-auto",
};

const CARD_STYLES: Record<AdSlotVariant, string> = {
  topBanner: "surface-nested p-2",
  inContent: "surface-nested p-2",
  sidebar: "surface-nested p-2",
  sidebarCompact: "surface-nested max-h-[280px] overflow-hidden p-2",
  bottomBanner: "surface-nested p-2",
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
  const compact = variant === "sidebarCompact";

  if (!card) {
    return (
      <div className={wrap}>
        <AdBox type={type} compact={compact} />
      </div>
    );
  }

  return (
    <section className={wrap}>
      <div className={card}>
        <AdBox type={type} compact={compact} />
      </div>
    </section>
  );
}
