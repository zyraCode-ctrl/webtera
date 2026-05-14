"use client";

type Props = {
  title: string;
  description: string;
  showSponsorFallback: boolean;
  sponsorUrl: string;
};

export function FunnelNavigatingOverlay({
  title,
  description,
  showSponsorFallback,
  sponsorUrl,
}: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[200] grid place-items-center bg-zinc-950/45 px-5 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/80 bg-white p-6 text-center shadow-2xl sm:p-8">
        <div className="mx-auto h-11 w-11 animate-spin rounded-full border-[3px] border-zinc-200 border-t-violet-600" />
        <h2 className="mt-5 text-lg font-semibold tracking-tight text-zinc-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
        {showSponsorFallback ? (
          <p className="mt-4 text-xs leading-5 text-amber-800">
            If a new tab did not open, your browser may have blocked it. Use the button below, then return
            here—this page will continue automatically.
          </p>
        ) : null}
        {showSponsorFallback ? (
          <a
            href={sponsorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-400"
          >
            Open sponsor tab
          </a>
        ) : null}
      </div>
    </div>
  );
}
