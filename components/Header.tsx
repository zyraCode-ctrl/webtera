"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = useMemo(
    () => [
      { label: "Tools", href: "/tools" },
      { label: "Docs", href: "/tools/help" },
      { label: "Request Tool", href: "/request-tool" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
    []
  );

  useEffect(() => {
    // Close mobile menu after navigation
    setOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <header className="sticky top-0 z-50 w-full min-w-0 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full min-h-14 min-w-0 max-w-[1400px] items-center justify-between gap-3 px-3 py-2 sm:px-4">
        <Link href="/" className="font-semibold tracking-tight text-zinc-950">
          WebTera Tools
        </Link>

        {/* Desktop nav */}
        <nav className="hidden justify-end gap-2 text-sm sm:flex">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "rounded-md px-3 py-2 font-medium transition",
                  active
                    ? "text-zinc-950"
                    : "text-zinc-600 hover:text-zinc-950 hover:underline",
                ].join(" ")}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 sm:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open ? (
        <div className="border-t border-zinc-200 bg-white sm:hidden">
          <nav className="mx-auto w-full min-w-0 max-w-[1400px] px-3 py-3 sm:px-4">
            <div className="flex flex-col gap-1">
              {links.map((l) => {
                const active = isActive(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "rounded-lg px-3 py-2 text-sm font-medium transition",
                      active
                        ? "bg-zinc-100 text-zinc-950"
                        : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950",
                    ].join(" ")}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

