"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppNavbar } from "@/components/dashboard/AppNavbar";

type Plan = "free" | "pro" | "team";

type Props = {
  user: { id: string; name: string; email: string };
  quota: {
    plan: Plan;
    used: number;
    limit: number | null; // null = ilimitado
    hasVideoExports: boolean;
  };
};

const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  team: "Team",
};

export function Settings({ user, quota }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const percentage =
    quota.limit === null ? 0 : Math.min(100, Math.round((quota.used / quota.limit) * 100));

  const handleManage = async () => {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/polar/portal", { method: "POST" });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `Error ${res.status}`);
      }
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo abrir el portal.");
      setBusy(false);
    }
  };

  const handleUpgrade = () => router.push("/pricing");

  return (
    <>
      <AppNavbar user={{ name: user.name, email: user.email }} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-[32px] font-medium leading-none tracking-[-0.025em]">Ajustes</h1>
          <p className="mt-2 text-[14px] text-muted">Tu cuenta y suscripción.</p>
        </header>

        {/* Cuenta */}
        <Card title="Cuenta">
          <Row label="Nombre" value={user.name} />
          <Row label="Email" value={user.email} />
        </Card>

        {/* Plan + usage */}
        <Card
          title="Plan"
          action={
            quota.plan === "free" ? (
              <button
                type="button"
                onClick={handleUpgrade}
                className="rounded-pill bg-primary px-4 py-1.5 text-[12.5px] font-medium text-body transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Mejorar a Pro
              </button>
            ) : (
              <button
                type="button"
                onClick={handleManage}
                disabled={busy}
                className="rounded-pill border border-border bg-surface-elevated/40 px-4 py-1.5 text-[12.5px] text-foreground transition-colors hover:bg-surface-elevated disabled:opacity-60"
              >
                {busy ? "Abriendo…" : "Gestionar suscripción"}
              </button>
            )
          }
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted">Plan actual</p>
              <p className="mt-1 text-[20px] font-medium">{PLAN_LABEL[quota.plan]}</p>
            </div>
            {quota.plan !== "free" && (
              <span className="rounded-pill bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent">
                Activo
              </span>
            )}
          </div>

          <div className="mt-6">
            <div className="flex items-baseline justify-between text-[12.5px] text-muted">
              <span>Exports este mes</span>
              <span className="font-medium text-foreground tabular-nums">
                {quota.used}
                {quota.limit !== null && ` / ${quota.limit}`}
                {quota.limit === null && " / ∞"}
              </span>
            </div>
            {quota.limit !== null && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-surface-dim">
                <div
                  className={`h-full rounded-pill ${
                    percentage >= 100 ? "bg-danger" : percentage >= 80 ? "bg-warning" : "bg-accent"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            )}
            {quota.limit !== null && percentage >= 80 && (
              <p className="mt-2 text-[12px] text-muted">
                Te quedan {Math.max(0, quota.limit - quota.used)} exports.{" "}
                <Link href="/pricing" className="text-accent hover:underline">
                  Mejorar a Pro
                </Link>{" "}
                para ilimitados.
              </p>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
              {error}
            </p>
          )}
        </Card>

        {/* Soporte */}
        <Card title="Soporte">
          <p className="text-[13px] text-muted">
            ¿Algo no funciona o tenés una idea? Escribinos a{" "}
            <a href="mailto:hola@shotso.com" className="text-foreground hover:underline">
              hola@shotso.com
            </a>
            .
          </p>
        </Card>
      </main>
    </>
  );
}

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 rounded-2xl border border-border-faint bg-surface/40 p-6">
      <header className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-medium">{title}</h2>
        {action}
      </header>
      <div>{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border-faint py-3 last:border-0 last:pb-0 first:pt-0">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-[13.5px] text-foreground">{value}</span>
    </div>
  );
}
