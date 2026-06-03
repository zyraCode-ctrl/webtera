"use client";

type Props = {
  title: string;
  description: string;
};

export function FunnelNavigatingOverlay({ title, description }: Props) {
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
      </div>
    </div>
  );
}
