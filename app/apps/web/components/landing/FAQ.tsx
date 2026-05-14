const items = [
  {
    q: "¿Qué pasa con mis exports si bajo de Pro a Free?",
    a: "Nada. Lo que ya exportaste sigue siendo tuyo. Solo perdés acceso a los templates premium y los formatos de video.",
  },
  {
    q: "¿Puedo usar los mockups para clientes comerciales?",
    a: "Sí, ambos planes pagos incluyen licencia comercial. Free es solo para uso personal.",
  },
  {
    q: "¿Cómo funciona el render de video?",
    a: "Corre 100% server-side con Remotion + FFmpeg. Subís tu screenshot, elegís un device y una animación, y te devolvemos un MP4 o GIF en segundos.",
  },
  {
    q: "¿Tienen API?",
    a: "Está en roadmap para el plan Team. Si la necesitás antes, escribinos a hola@shotso.com.",
  },
  {
    q: "¿Aceptan crypto / transferencia / facturación local?",
    a: "Por ahora solo Stripe (tarjeta, Apple Pay, Google Pay). Para Team con facturación a empresa, escribinos.",
  },
];

export function FAQ() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-3xl px-6">
        <header className="mb-10 text-center">
          <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted">
            Preguntas frecuentes
          </span>
          <h2 className="mt-3 text-[clamp(28px,4vw,44px)] font-medium leading-[1.1] tracking-[-0.03em]">
            Lo que la gente suele preguntar
          </h2>
        </header>

        <div className="flex flex-col divide-y divide-border-faint overflow-hidden rounded-2xl border border-border-faint bg-surface/40">
          {items.map((it) => (
            <details key={it.q} className="group px-6 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[15px] font-medium">
                <span>{it.q}</span>
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  className="size-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
              </summary>
              <p className="pb-5 pr-8 text-[14px] leading-relaxed text-muted">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
