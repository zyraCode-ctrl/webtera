import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-8 w-full min-w-0 border-t border-violet-200/55 bg-white/70 py-1 shadow-[0_-8px_28px_rgb(109_40_217_/0.06)] backdrop-blur-md">
      <div className="flex w-full min-w-0 flex-col gap-4 py-6 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text font-medium text-transparent">
            WebTera Tools
          </div>
          <div className="text-xs text-zinc-500">
            Fast, clean utility tools for everyday tasks.
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <Link href="/tools" className="transition hover:text-violet-700">
            Tools
          </Link>
          <Link href="/tools/help" className="transition hover:text-violet-700">
            Docs
          </Link>
          <Link href="/request-tool" className="transition hover:text-violet-700">
            Request Tool
          </Link>
          <Link href="/about" className="transition hover:text-violet-700">
            About
          </Link>
          <Link href="/contact" className="transition hover:text-violet-700">
            Contact
          </Link>
          <Link href="/privacy" className="transition hover:text-violet-700">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-violet-700">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}

