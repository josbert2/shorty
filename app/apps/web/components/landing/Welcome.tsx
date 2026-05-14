"use client";

/*
  Welcome modal — clon fiel del modal de shots.so.
  Dimensiones, fonts y colores extraídos directamente de los computed styles del original.
*/

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth-client";

const BENEFITS = [
  {
    src: "/welcome/benefits/mockups.png",
    title: "Free Mockups, Instantly.",
    body:
      "Get access to mockup free tools for your projects. Explore our growing library of free mockups that are ready to use in one click.",
    width: 256,
  },
  {
    src: "/welcome/benefits/animation.gif",
    title: "Animated Mockups & Video Zoom.",
    body:
      "Turn static designs into motion with animated mockups. Smooth video zooms and animated presets built right into your workflow.",
    width: 256,
  },
  {
    src: "/welcome/benefits/iphone16-3.png",
    title: "iPhone Mockups.",
    body:
      "Showcase your designs with iPhone mockups — including the latest iPhone 17 mockup free options. Perfect for product shots, app previews, and more.",
    width: 256,
  },
  {
    src: "/welcome/benefits/mockupapp2.png",
    title: "All-in-One Mockup App.",
    body:
      "Create, edit, and share with our mockup app. Whether it's websites, iPhones, or animations — you'll find everything in one place.",
    width: 480,
  },
];

const TEMPLATES = [
  "template-1.jpg",
  "template-12.jpg",
  "template-3.jpg",
  "template-5.jpg",
  "template-6.jpg",
  "template-8.jpg",
  "template-4.jpg",
  "template-11.jpg",
  "template-10.jpg",
  "template-9.jpg",
];

export function Welcome() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleStart = async () => {
    setBusy(true);
    const session = await getSession();
    if (session?.data) router.push("/dashboard");
    else router.push("/register");
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{ background: "#00000080", backdropFilter: "blur(3px)" }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: "calc(100vw - 16px)",
          maxWidth: 1000,
          height: "calc(100vh - 16px)",
          background: "rgb(28, 28, 28)",
          borderRadius: 24,
          boxShadow: "0 16px 32px rgba(0,0,0,0.24)",
        }}
      >
        {/* outline interno */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit]"
          style={{ outline: "1px solid rgba(240,240,240,0.06)", outlineOffset: -1 }}
        />

        {/* Scroll del contenido */}
        <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col" style={{ padding: "0 0 160px" }}>
            <HeroSection />
            <BenefitsSection />
            <TemplatesSection />
            <FeaturesSection />
          </div>
        </div>

        {/* CTA fijo abajo con gradient fade */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center"
          style={{
            gap: 4,
            padding: "20px 20px 10px",
            background:
              "linear-gradient(rgba(0,0,0,0) 0, rgb(28,28,28) 90%)",
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <button
              type="button"
              onClick={handleStart}
              disabled={busy}
              className="welcome-start-btn disabled:opacity-70"
              style={{
                minWidth: 180,
                padding: "14px 16px",
                background:
                  "linear-gradient(120deg, #ff6432 25%, #ff0065 45%, #7b2eff 75%)",
                backgroundSize: "200% 200%",
                animation: "shotsGradient 2s linear infinite alternate",
                borderRadius: 100,
                outline: "1px solid rgba(240,240,240,0.12)",
                outlineOffset: -1,
                color: "#fff",
                font: "500 17px/24px Inter, sans-serif",
                letterSpacing: "-0.6px",
                position: "relative",
                overflow: "hidden",
                display: "inline-flex",
                gap: 8,
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 120ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <span>{busy ? "Loading…" : "Start Creating"}</span>
            </button>
          </div>

          <p
            style={{
              color: "rgba(240,240,240,0.36)",
              font: "400 12.5px/20px Inter, sans-serif",
              letterSpacing: "-0.2px",
              textAlign: "center",
              margin: 0,
            }}
          >
            By Clicking &quot;Start Creating&quot; you agree to our{" "}
            <a
              href="/policy"
              target="_blank"
              style={{ color: "rgba(240,240,240,0.6)" }}
              className="hover:underline"
            >
              Privacy Policy
            </a>{" "}
            &amp;{" "}
            <a
              href="/terms"
              target="_blank"
              style={{ color: "rgba(240,240,240,0.6)" }}
              className="hover:underline"
            >
              Terms of Service
            </a>
          </p>

          <div
            className="flex items-center justify-center"
            style={{ gap: 8, width: "100%" }}
          >
            <p
              style={{
                color: "rgba(240,240,240,0.36)",
                font: "500 12.5px/20px Inter, sans-serif",
                letterSpacing: "-0.2px",
                margin: 0,
              }}
            >
              Created with lots of ☕️ ♥️ 🎵
            </p>
            <a href="https://twitter.com/shotsapphq" target="_blank" rel="noreferrer">
              <button
                type="button"
                style={{
                  padding: "3px 9px",
                  background: "transparent",
                  borderRadius: 100,
                  color: "rgba(240,240,240,0.36)",
                  font: "500 12.5px/20px Inter, sans-serif",
                  letterSpacing: "-0.2px",
                  display: "inline-flex",
                  gap: 4,
                  alignItems: "center",
                  border: "1px solid rgba(240,240,240,0.08)",
                }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M22.36 6.37c-.77.34-1.6.57-2.46.67a4.3 4.3 0 0 0 1.88-2.37c-.83.49-1.75.84-2.72 1.03-.79-.84-1.9-1.36-3.13-1.36a4.27 4.27 0 0 0-4.28 4.27c0 .33.03.66.11.97C8.2 9.4 5.05 7.69 2.94 5.1c-.37.63-.58 1.36-.58 2.15 0 1.48.75 2.79 1.9 3.56-.71-.03-1.37-.22-1.94-.54-.01.01-.01.03-.01.05 0 2.07 1.47 3.8 3.43 4.19-.36.09-.74.14-1.13.14-.28 0-.55-.03-.81-.08a4.29 4.29 0 0 0 3.99 2.97 8.65 8.65 0 0 1-5.32 1.83c-.35 0-.69-.03-1.03-.07a12.1 12.1 0 0 0 6.55 1.92c7.87 0 12.17-6.52 12.17-12.18 0-.19-.01-.38-.02-.56.83-.61 1.56-1.36 2.13-2.22Z" />
                </svg>
                <span>@ShotsoAppHQ</span>
              </button>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shotsGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .welcome-start-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: inherit;
          filter: blur(20px) saturate(2);
          opacity: 0.6;
          z-index: -1;
        }
      `}</style>
    </div>
  );
}

function HeroSection() {
  return (
    <section
      className="relative w-full"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 32,
        justifyContent: "flex-end",
        height: "calc(100vh - 300px)",
        padding: 32,
        marginBottom: 32,
      }}
    >
      {/* Video de fondo (position absolute, detrás) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-90"
          src="/welcome/video-content/animation-demo3.mp4"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(28,28,28,0.95) 0%, rgba(28,28,28,0.4) 40%, rgba(28,28,28,0.1) 100%)",
          }}
        />
      </div>

      <div
        className="relative"
        style={{
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Logo gradient (en vez del PNG de shots) */}
          <span
            className="inline-block"
            style={{
              height: 48,
              width: 48,
              borderRadius: 12,
              background:
                "linear-gradient(135deg, #ff6432 0%, #ff0065 50%, #7b2eff 100%)",
              boxShadow: "0 8px 24px rgba(255,0,101,0.3)",
            }}
          />
          <span
            style={{
              color: "rgb(240,240,240)",
              font: "500 28px/38px Inter, sans-serif",
              letterSpacing: "-1px",
            }}
          >
            Shotso
          </span>
        </div>

        <h1
          className="text-balance"
          style={{
            color: "rgb(240,240,240)",
            font: "500 56px/68px Inter, sans-serif",
            letterSpacing: "-1.4px",
            margin: 0,
            textAlign: "center",
          }}
        >
          Create Amazing Mockups
        </h1>

        <p
          style={{
            color: "rgba(240,240,240,0.6)",
            font: "400 18px/28px Inter, sans-serif",
            letterSpacing: "-0.3px",
            margin: 0,
            textAlign: "center",
          }}
        >
          Beautiful animations, videos and images for your social media,
          <br className="hidden md:inline" /> website and more!
        </p>
      </div>
    </section>
  );
}

function SectionHeader({ subtitle, title, description }: { subtitle?: string; title: string; description?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        alignItems: "center",
        padding: "64px 32px 0",
        marginBottom: -8,
      }}
    >
      {subtitle && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              color: "rgb(240,240,240)",
              font: "500 19px/26px Inter, sans-serif",
              letterSpacing: "-0.4px",
            }}
          >
            {subtitle}
          </span>
        </div>
      )}
      <h2
        style={{
          color: "rgb(240,240,240)",
          font: "500 34px/44px Inter, sans-serif",
          letterSpacing: "-1px",
          margin: 0,
          textAlign: "center",
        }}
      >
        {title}
      </h2>
      {description && (
        <p
          style={{
            color: "rgba(240,240,240,0.6)",
            font: "500 19px/26px Inter, sans-serif",
            letterSpacing: "-0.4px",
            margin: 0,
            textAlign: "center",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function BenefitsSection() {
  return (
    <section
      className="w-full"
      style={{ display: "flex", flexDirection: "column", gap: 32, padding: 32 }}
    >
      <SectionHeader
        title="Your time saving design companion"
        description="Create content in seconds, spend your hours on what matters."
      />

      <div
        style={{
          width: "calc(100% + 40px)",
          margin: "0 -20px",
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 12,
            alignItems: "baseline",
            width: "max-content",
            padding: "0 20px",
          }}
        >
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "flex-start",
                position: "relative",
                width: b.width,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 320,
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "#000",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.src}
                  alt={b.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ width: "100%", padding: "0 12px" }}>
                <h3
                  style={{
                    display: "inline",
                    marginRight: 4,
                    color: "rgb(240,240,240)",
                    font: "500 15px/20px Inter, sans-serif",
                    letterSpacing: "-0.4px",
                  }}
                >
                  {b.title}
                </h3>
                <p
                  style={{
                    display: "inline",
                    color: "rgba(240,240,240,0.6)",
                    font: "400 14px/20px Inter, sans-serif",
                    letterSpacing: "-0.2px",
                  }}
                >
                  {" "}
                  {b.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TemplatesSection() {
  return (
    <section
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 32,
        alignItems: "center",
        width: "100%",
        padding: 32,
      }}
    >
      <SectionHeader
        title="Big collection of templates"
        description="The perfect result is one click away. And saves you even more time."
      />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 12,
          justifyContent: "center",
          width: "160%",
          overflow: "hidden",
        }}
      >
        {TEMPLATES.map((t) => (
          <div
            key={t}
            style={{
              position: "relative",
              height: 180,
              borderRadius: 16,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/welcome/templates/${t}`}
              alt=""
              style={{ height: "100%", maxWidth: 500, maxHeight: 600 }}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* btn-wrapper: overlap por encima del último row con gradient fade */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          width: "100%",
          height: 180,
          marginTop: -180,
          background:
            "linear-gradient(rgba(0,0,0,0), rgb(28,28,28))",
          zIndex: 1,
        }}
      >
        <button
          type="button"
          style={{
            minWidth: 190,
            padding: "14px 16px",
            background: "rgba(240,240,240,0.06)",
            backdropFilter: "blur(4px) saturate(1.5)",
            borderRadius: 100,
            color: "rgb(240,240,240)",
            font: "500 15px/20px Inter, sans-serif",
            letterSpacing: "-0.4px",
            display: "inline-flex",
            flexDirection: "row-reverse",
            gap: 4,
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(240,240,240,0.08)",
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Explore Templates</span>
        </button>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      style={{ display: "flex", flexDirection: "column", gap: 32, width: "100%", padding: 32 }}
    >
      <SectionHeader
        subtitle="Video & Animation"
        title="After Effects quality level videos in seconds."
        description="Bring your content to life with video, zoom effects and animation presets."
      />

      <div style={{ display: "flex", flexDirection: "row", gap: 16, flexWrap: "wrap" }}>
        <FeatureCard
          tag="NEW"
          title="Video. Zoom. Animate."
          body="Bring your content to life with video, zoom effects and animation presets."
          mediaHeight={320}
        />
      </div>
    </section>
  );
}

function FeatureCard({ tag, title, body, mediaHeight }: { tag?: string; title: string; body: string; mediaHeight: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column-reverse",
        position: "relative",
        flex: "1 1 100%",
        borderRadius: 24,
        background: "#000",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
          justifyContent: "flex-end",
          padding: 28,
          color: "#fff",
          zIndex: 2,
        }}
      >
        {tag && (
          <span
            style={{
              maxWidth: "max-content",
              padding: "2px 4px",
              background: "rgb(240,240,240)",
              color: "#000",
              borderRadius: 5,
              font: "500 11px/14px Inter, sans-serif",
              letterSpacing: "-0.2px",
            }}
          >
            {tag}
          </span>
        )}
        <h3
          style={{
            color: "#fff",
            font: "500 21px/32px Inter, sans-serif",
            letterSpacing: "-0.8px",
            margin: 0,
            textAlign: "center",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            maxWidth: 400,
            color: "#fff",
            opacity: 0.7,
            font: "500 14px/20px Inter, sans-serif",
            letterSpacing: "-0.2px",
            margin: 0,
            textAlign: "center",
          }}
        >
          {body}
        </p>
      </div>
      {/* Media placeholder */}
      <div style={{ height: mediaHeight, background: "linear-gradient(160deg, #1a0533 0%, #0a0a2e 50%, #0d1a3e 100%)" }} />
    </div>
  );
}
