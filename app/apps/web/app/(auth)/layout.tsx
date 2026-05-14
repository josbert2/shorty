import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-bg px-6 py-12">
      {/* Glow ambiental */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, rgb(10 132 255 / 0.10) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgb(255 255 255 / 0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 font-medium tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning" />
          Shotso
        </Link>
        {children}
      </div>
    </div>
  );
}
