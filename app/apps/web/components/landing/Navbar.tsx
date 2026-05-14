"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/templates", label: "Templates" },
  { href: "/mockups", label: "Mockups" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color] duration-300",
        scrolled
          ? "border-b border-border-faint bg-bg/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-medium tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning" />
          Shotso
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] text-muted md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] text-muted hover:text-foreground">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-pill bg-primary px-4 py-1.5 text-[13px] font-medium text-body transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
