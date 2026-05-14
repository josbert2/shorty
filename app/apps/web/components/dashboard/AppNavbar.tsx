"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Proyectos" },
  { href: "/templates", label: "Templates" },
  { href: "/settings", label: "Ajustes" },
];

export function AppNavbar({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  const initial = user.name.slice(0, 1).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-40 border-b border-border-faint bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 text-[13px]">
        <Link href="/dashboard" className="flex items-center gap-2 font-medium tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning" />
          Shotso
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const isActive = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-1.5 transition-colors",
                  isActive
                    ? "bg-surface-elevated/60 text-foreground"
                    : "text-muted hover:bg-surface-elevated/30 hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-pill border border-border-faint bg-surface/60 py-1 pl-1.5 pr-2.5 transition-colors hover:border-border"
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-surface-elevated text-[12px] font-medium">
              {initial}
            </div>
            <span className="hidden text-[12.5px] text-muted sm:inline">{user.email}</span>
            <svg viewBox="0 0 16 16" className="size-3 text-muted">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-modal shadow-2xl">
              <div className="border-b border-border-faint px-4 py-3">
                <p className="truncate text-[13px] font-medium">{user.name}</p>
                <p className="truncate text-[12px] text-muted">{user.email}</p>
              </div>
              <div className="flex flex-col py-1.5 text-[13px]">
                <Link
                  href="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 text-foreground/80 transition-colors hover:bg-surface-elevated/40 hover:text-foreground"
                >
                  Ajustes
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2 text-foreground/80 transition-colors hover:bg-surface-elevated/40 hover:text-foreground"
                >
                  Mejorar a Pro
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2 text-left text-danger transition-colors hover:bg-danger/10"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
