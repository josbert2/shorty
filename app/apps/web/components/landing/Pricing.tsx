"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type Plan = {
  id: "free" | "pro" | "team";
  name: string;
  description: string;
  monthly: number;
  annual: number;
  cta: string;
  highlighted?: boolean;
  badge?: string;
  features: { text: string; included: boolean }[];
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "Para explorar la herramienta",
    monthly: 0,
    annual: 0,
    cta: "Empezar gratis",
    features: [
      { text: "5 exports al mes", included: true },
      { text: "Resolución HD (1×)", included: true },
      { text: "10 templates básicos", included: true },
      { text: "Watermark en exports", included: true },
      { text: "Sin marca de agua", included: false },
      { text: "Export en video / GIF", included: false },
      { text: "Brand kit", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para creadores serios",
    monthly: 12,
    annual: 9,
    cta: "Empezar Pro",
    highlighted: true,
    badge: "Más popular",
    features: [
      { text: "Exports ilimitados", included: true },
      { text: "Resolución 4K (4×)", included: true },
      { text: "200+ templates premium", included: true },
      { text: "Sin marca de agua", included: true },
      { text: "Export en MP4 / GIF", included: true },
      { text: "Efectos VHS, grain, glitch", included: true },
      { text: "Brand kit (logo + colores)", included: true },
    ],
  },
  {
    id: "team",
    name: "Team",
    description: "Para equipos de diseño",
    monthly: 29,
    annual: 23,
    cta: "Hablar con ventas",
    features: [
      { text: "Todo lo de Pro", included: true },
      { text: "Hasta 10 miembros", included: true },
      { text: "Carpetas compartidas", included: true },
      { text: "Análisis de uso", included: true },
      { text: "SSO / SAML", included: true },
      { text: "SLA garantizado", included: true },
      { text: "Soporte prioritario", included: true },
    ],
  },
];

export function Pricing() {
  const router = useRouter();
  const [annual, setAnnual] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (plan: Plan["id"]) => {
    setError(null);

    if (plan === "free") {
      const session = await getSession();
      if (session?.data) router.push("/dashboard");
      else router.push("/register");
      return;
    }

    if (plan === "team") {
      window.location.href = "mailto:hola@shotso.com?subject=Plan%20Team";
      return;
    }

    // Pro: crear checkout session
    const session = await getSession();
    if (!session?.data) {
      router.push("/register?next=/pricing");
      return;
    }

    setBusy(plan);
    try {
      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `Error ${res.status}`);
      }
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar el checkout.");
      setBusy(null);
    }
  };

  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted">
            Pricing
          </span>
          <h2 className="mt-3 text-[clamp(32px,5vw,56px)] font-medium leading-[1.05] tracking-[-0.03em]">
            Precios honestos.
            <br /> Sin asteriscos.
          </h2>
          <p className="mt-4 text-[15px] text-muted">
            Cancelás cuando quieras. Todo en USD.
          </p>

          <div className="mt-8 inline-flex items-center gap-1 rounded-pill border border-border-faint bg-surface-dim p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-pill px-4 py-1.5 text-[13px] transition-colors",
                !annual ? "bg-surface-elevated text-foreground" : "text-muted"
              )}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                "inline-flex items-center gap-2 rounded-pill px-4 py-1.5 text-[13px] transition-colors",
                annual ? "bg-surface-elevated text-foreground" : "text-muted"
              )}
            >
              Anual
              <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-medium text-success">
                −25%
              </span>
            </button>
          </div>
        </header>

        {error && (
          <div className="mx-auto mb-6 max-w-md rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-center text-[13px] text-danger">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              annual={annual}
              busy={busy === p.id}
              onSelect={() => handleSelect(p.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  annual,
  busy,
  onSelect,
}: {
  plan: Plan;
  annual: boolean;
  busy: boolean;
  onSelect: () => void;
}) {
  const price = annual ? plan.annual : plan.monthly;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-surface/60 p-7 transition-colors",
        plan.highlighted
          ? "border-border-strong bg-surface"
          : "border-border-faint hover:border-border"
      )}
    >
      {plan.badge && (
        <span className="absolute right-5 top-5 rounded-pill bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent">
          {plan.badge}
        </span>
      )}

      <div>
        <h3 className="text-[18px] font-medium tracking-[-0.01em]">{plan.name}</h3>
        <p className="mt-1 text-[13px] text-muted">{plan.description}</p>
      </div>

      <div className="mt-7 flex items-baseline gap-1.5">
        <span className="text-[44px] font-medium leading-none tracking-[-0.03em] tabular-nums">
          ${price}
        </span>
        <span className="text-[13px] text-muted">
          {price === 0 ? "para siempre" : `/${annual ? "mes facturado anual" : "mes"}`}
        </span>
      </div>

      <button
        type="button"
        onClick={onSelect}
        disabled={busy}
        className={cn(
          "mt-7 inline-flex h-11 items-center justify-center rounded-pill px-5 text-[14px] font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60",
          plan.highlighted
            ? "bg-primary text-body"
            : "border border-border bg-surface-elevated/40 text-foreground"
        )}
      >
        {busy ? "Redirigiendo…" : plan.cta}
      </button>

      <ul className="mt-7 flex flex-col gap-2.5 border-t border-border-faint pt-6 text-[13px]">
        {plan.features.map((f) => (
          <li
            key={f.text}
            className={cn(
              "flex items-start gap-2.5",
              !f.included && "text-faint line-through"
            )}
          >
            <Check included={f.included} />
            <span className={f.included ? "text-foreground/85" : ""}>{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Check({ included }: { included: boolean }) {
  if (!included) {
    return (
      <svg aria-hidden viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0 text-faint">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="mt-0.5 size-4 shrink-0 text-success">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
