import Link from "next/link";

const columns = [
  {
    label: "Producto",
    links: [
      { href: "/templates", label: "Templates" },
      { href: "/mockups", label: "Mockups" },
      { href: "/pricing", label: "Pricing" },
      { href: "/changelog", label: "Changelog" },
    ],
  },
  {
    label: "Recursos",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/docs", label: "Docs" },
      { href: "/support", label: "Soporte" },
      { href: "/status", label: "Status" },
    ],
  },
  {
    label: "Legal",
    links: [
      { href: "/policy", label: "Privacidad" },
      { href: "/terms", label: "Términos" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border-faint bg-bg">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 font-medium tracking-tight">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning" />
              Shotso
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted">
              Mockups de dispositivos, fondos premium y export a video.
              Hecho por una persona, no por un comité.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.label}>
              <h4 className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted">
                {col.label}
              </h4>
              <ul className="mt-4 flex flex-col gap-2.5 text-[13px]">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border-faint pt-6 text-[12px] text-muted md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} Shotso. Todos los derechos reservados.</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
            Todos los sistemas operando con normalidad
          </span>
        </div>
      </div>
    </footer>
  );
}
