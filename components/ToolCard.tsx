import Link from "next/link";

export function ToolCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex h-full min-w-0 w-full flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:hover:scale-[1.01]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-zinc-100 blur-2xl" />
      </div>

      <div className="relative flex flex-1 flex-col">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-950 sm:text-base">
            {title}
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
            {description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-[11px] font-medium text-zinc-500">
            Fast • Private • Mobile
          </span>
          <span className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-3 py-1 text-[11px] font-medium text-white transition group-hover:bg-zinc-800">
            Open
          </span>
        </div>
      </div>
    </Link>
  );
}

