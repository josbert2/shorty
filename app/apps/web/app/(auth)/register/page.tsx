"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/auth/Field";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await signUp.email({ email, password, name });
    if (res.error) {
      setError(res.error.message ?? "No se pudo crear la cuenta.");
      setBusy(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <AuthCard
      title="Creá tu cuenta"
      subtitle="5 exports gratis al mes. Sin tarjeta."
      footer={
        <>
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-foreground hover:underline">
            Iniciar sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Field
          label="Nombre"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
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
          {busy ? "Creando cuenta…" : "Crear cuenta"}
        </button>

        <p className="text-center text-[11.5px] text-faint">
          Al continuar aceptás los{" "}
          <Link href="/terms" className="hover:text-muted hover:underline">
            términos
          </Link>{" "}
          y la{" "}
          <Link href="/policy" className="hover:text-muted hover:underline">
            política de privacidad
          </Link>
          .
        </p>
      </form>
    </AuthCard>
  );
}
