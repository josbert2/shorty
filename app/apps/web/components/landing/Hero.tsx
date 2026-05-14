import Image from "next/image";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden pt-24">
      {/* Dot grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(255 255 255 / 0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* Radial accent glow */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgb(10 132 255 / 0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center">
        {/* Eyebrow / badge */}
        <div className="mb-7 inline-flex items-center gap-2 rounded-pill border border-border-faint bg-surface/60 px-3.5 py-1.5 text-[12.5px] text-muted backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning" />
          Ahora con exportación a video
        </div>

        {/* Headline */}
        <h1 className="text-balance text-[clamp(40px,7vw,96px)] font-medium leading-[1.02] tracking-[-0.035em]">
          Mockups que{" "}
          <span className="bg-gradient-to-br from-white to-white/55 bg-clip-text text-transparent">
            detienen el scroll
          </span>
          .
        </h1>

        {/* Subhead */}
        <p className="mx-auto mt-6 max-w-xl text-pretty text-[16px] leading-relaxed text-muted">
          Encuadrá tus screenshots en dispositivos reales, sumá fondos y
          efectos cinematográficos. Exportá en segundos, no en horas.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/register"
            className="rounded-pill bg-primary px-5 py-3 text-[14px] font-medium text-body transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Empezar gratis
          </a>
          <a
            href="/templates"
            className="rounded-pill border border-border bg-surface/40 px-5 py-3 text-[14px] text-foreground transition-colors hover:bg-surface"
          >
            Ver templates
          </a>
        </div>

        {/* Device showcase */}
        <div className="relative mt-20 flex justify-center">
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 h-32 w-2/3 -translate-x-1/2 translate-y-8 rounded-full"
            style={{
              background:
                "radial-gradient(ellipse, rgb(10 132 255 / 0.4) 0%, transparent 70%)",
              filter: "blur(28px)",
            }}
          />

          {/* Background card con mockup demo (assets reales de shots.so) */}
          <div
            className="squircle relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border ring-1 ring-white/5"
            style={{ boxShadow: "var(--shadow-device)" }}
          >
            <Image
              src="/demo/bg-tahoe.jpg"
              alt=""
              width={1600}
              height={1000}
              priority
              className="aspect-[16/10] w-full object-cover"
            />
            <Image
              src="/demo/mockup-glass.png"
              alt="Preview"
              width={900}
              height={520}
              priority
              className="absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
