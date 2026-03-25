import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-8 w-full min-w-0 border-t border-zinc-200 bg-white">
      <div className="flex w-full min-w-0 flex-col gap-4 py-6 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-medium text-zinc-900">WebTera Tools</div>
          <div className="text-xs text-zinc-500">
            Fast, clean utility tools for everyday tasks.
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <Link href="/tools" className="hover:text-zinc-900">
            Tools
          </Link>
          <Link href="/tools/help" className="hover:text-zinc-900">
            Docs
          </Link>
          <Link href="/request-tool" className="hover:text-zinc-900">
            Request Tool
          </Link>
          <Link href="/about" className="hover:text-zinc-900">
            About
          </Link>
          <Link href="/contact" className="hover:text-zinc-900">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-zinc-900">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-zinc-900">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}

