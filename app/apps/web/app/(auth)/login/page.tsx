"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/auth/Field";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signIn.email({ email, password });
    if (res.error) {
      setError(res.error.message ?? "No se pudo iniciar sesión.");
      setBusy(false);
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <AuthCard
      title="Bienvenido de vuelta"
      subtitle="Entrá con tu email y contraseña."
      footer={
        <>
          ¿Sos nuevo?{" "}
          <Link href="/register" className="text-foreground hover:underline">
            Crear cuenta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Field
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
        />
        <Field
          label="Contraseña"
          type="password"
          required
          minLength={8}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-1 inline-flex h-10 items-center justify-center rounded-pill bg-primary px-4 text-[13.5px] font-medium text-body transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </AuthCard>
  );
}
