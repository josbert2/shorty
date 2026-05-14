# PROMPT DIOS — Clonar shots.so con stack de producción

---

## IDENTIDAD DEL PROYECTO

Eres un senior fullstack engineer con 10 años de experiencia construyendo SaaS de diseño. Tu tarea es construir **Shots** — una plataforma SaaS de creación de mockups de dispositivos — desde cero, con calidad de producción real. No un prototipo. No un "starter". Un producto que se pueda lanzar.

El producto de referencia es **shots.so**: un editor web que permite a diseñadores y creadores subir screenshots de sus apps/webs, aplicarlos sobre mockups de dispositivos (iPhone, MacBook, iPad, etc.), añadir fondos, efectos visuales y exportar imágenes/videos de alta resolución para redes sociales.

El resultado final debe ser indistinguible de un producto de una startup de SF con $2M de funding.

---

## STACK TÉCNICO — NO NEGOCIABLE

```
Monorepo:        Turborepo
Framework:       Next.js 15 (App Router, RSC, Server Actions)
Lenguaje:        TypeScript estricto (strict: true, no any)
Styling:         Tailwind CSS v4 + CSS custom properties
Animaciones:     Motion (Framer Motion v11) + GSAP ScrollTrigger
Componentes:     shadcn/ui + Radix UI primitives
Canvas/Editor:   Fabric.js 6
State global:    Zustand (slices pattern)
Server state:    TanStack Query v5
API layer:       tRPC v11 + Zod schemas
ORM:             Drizzle ORM
DB:              PostgreSQL
Auth:            Better Auth
Storage:         MinIO (S3-compatible, self-hosted)
Media:           Sharp (imágenes) + FFmpeg (video/GIF)
Pagos:           Stripe (subscriptions + webhooks)
Email:           Resend + React Email
Deploy:          Docker + Coolify (VPS self-hosted)
CDN:             Cloudflare
```

---

## ESTRUCTURA DE MONOREPO

```
shotso/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── (landing)/
│       │   │   ├── page.tsx              ← Landing page principal
│       │   │   ├── pricing/page.tsx
│       │   │   ├── templates/page.tsx
│       │   │   └── blog/page.tsx
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   ├── (app)/
│       │   │   ├── layout.tsx            ← Layout autenticado
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── editor/[id]/page.tsx  ← Editor principal
│       │   │   └── settings/page.tsx
│       │   ├── api/
│       │   │   ├── trpc/[trpc]/route.ts
│       │   │   ├── webhooks/stripe/route.ts
│       │   │   └── export/route.ts       ← Heavy export handler
│       │   ├── layout.tsx
│       │   └── globals.css
│       ├── components/
│       │   ├── landing/
│       │   │   ├── Navbar.tsx
│       │   │   ├── Hero.tsx
│       │   │   ├── LogoBar.tsx
│       │   │   ├── Features.tsx
│       │   │   ├── ProductShowcase.tsx
│       │   │   ├── TemplatesGrid.tsx
│       │   │   ├── Testimonials.tsx
│       │   │   ├── Pricing.tsx
│       │   │   ├── FAQ.tsx
│       │   │   └── Footer.tsx
│       │   ├── editor/
│       │   │   ├── Canvas.tsx
│       │   │   ├── Toolbar.tsx
│       │   │   ├── panels/
│       │   │   │   ├── DevicesPanel.tsx
│       │   │   │   ├── BackgroundsPanel.tsx
│       │   │   │   ├── EffectsPanel.tsx
│       │   │   │   └── ExportPanel.tsx
│       │   │   └── hooks/
│       │   │       ├── useCanvas.ts
│       │   │       ├── useDevices.ts
│       │   │       └── useExport.ts
│       │   └── ui/                       ← shadcn components
│       ├── lib/
│       │   ├── canvas/
│       │   │   ├── devices.ts            ← Device templates
│       │   │   ├── effects.ts            ← Visual effects
│       │   │   └── export.ts             ← Export logic
│       │   ├── trpc/
│       │   │   ├── client.ts
│       │   │   ├── server.ts
│       │   │   └── root.ts
│       │   ├── auth.ts
│       │   ├── stripe.ts
│       │   └── utils.ts
│       └── store/
│           ├── editor.ts                 ← Zustand editor slice
│           ├── ui.ts                     ← Zustand UI slice
│           └── user.ts
├── packages/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── users.ts
│   │   │   ├── projects.ts
│   │   │   ├── exports.ts
│   │   │   └── subscriptions.ts
│   │   ├── migrations/
│   │   └── index.ts
│   └── config/
│       ├── tailwind/
│       └── typescript/
├── docker-compose.yml
├── turbo.json
└── package.json
```

---

## DISEÑO VISUAL — SISTEMA DE DISEÑO COMPLETO

### Paleta de colores

```css
/* globals.css — define TODOS estos tokens */
:root {
  /* Backgrounds */
  --bg-base:        #080808;   /* El negro más profundo — body */
  --bg-surface:     #0f0f0f;   /* Cards, panels */
  --bg-elevated:    #171717;   /* Hover states, inputs */
  --bg-overlay:     #1f1f1f;   /* Dropdowns, tooltips */
  --bg-invert:      #ffffff;   /* Botón primario filled */

  /* Borders */
  --border-faint:   rgba(255,255,255,0.06);
  --border-subtle:  rgba(255,255,255,0.10);
  --border-medium:  rgba(255,255,255,0.18);
  --border-strong:  rgba(255,255,255,0.30);

  /* Text */
  --text-primary:   #f5f5f5;
  --text-secondary: #a0a0a0;
  --text-tertiary:  #555555;
  --text-invert:    #0a0a0a;

  /* Accent */
  --accent-blue:    #4f8ef7;
  --accent-purple:  #a855f7;
  --accent-cyan:    #22d3ee;
  --accent-orange:  #f97316;
  --accent-grad:    linear-gradient(135deg, #4f8ef7 0%, #a855f7 100%);

  /* Shadows */
  --shadow-sm:      0 2px 8px rgba(0,0,0,0.4);
  --shadow-md:      0 4px 24px rgba(0,0,0,0.5);
  --shadow-lg:      0 8px 48px rgba(0,0,0,0.7);
  --shadow-glow:    0 0 80px rgba(79,142,247,0.12);
  --shadow-device:  0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05);

  /* Radii */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-full: 9999px;

  /* Spacing system (4px base) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;
  --space-8: 32px;  --space-10: 40px; --space-12: 48px;
  --space-16: 64px; --space-20: 80px; --space-24: 96px;

  /* Z-index scale */
  --z-base:    1;
  --z-above:   10;
  --z-modal:   100;
  --z-toast:   200;
  --z-cursor:  9999;
}
```

### Tipografía

```css
/* En layout.tsx, importar de Google Fonts: */
/* Instrument Serif (display) + DM Sans (body) + JetBrains Mono (code) */

h1, h2, h3 {
  font-family: 'Instrument Serif', Georgia, serif;
  letter-spacing: -0.03em;
  line-height: 1.05;
}

body, button, input {
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

code, pre, .mono {
  font-family: 'JetBrains Mono', monospace;
}

/* Scale */
.text-display  { font-size: clamp(56px, 8vw, 104px); }
.text-hero     { font-size: clamp(40px, 6vw,  80px); }
.text-title    { font-size: clamp(28px, 4vw,  48px); }
.text-subtitle { font-size: clamp(20px, 2.5vw, 28px); }
.text-body     { font-size: 16px; }
.text-small    { font-size: 14px; }
.text-xs       { font-size: 12px; }
```

### Noise texture (fondo grain en toda la app)

```tsx
// components/ui/NoiseOverlay.tsx
// Componente que va en el root layout — una sola vez
export function NoiseOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.035]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: '256px 256px',
      }}
    />
  )
}
```

---

## LANDING PAGE — ESPECIFICACIÓN SECCIÓN A SECCIÓN

### Navbar (`components/landing/Navbar.tsx`)

**Comportamiento:**
- `position: fixed`, top 0, full width, z-index alto
- Estado inicial: completamente transparente
- Al hacer scroll > 20px: `backdrop-filter: blur(20px)`, `background: rgba(8,8,8,0.8)`, border-bottom `var(--border-faint)`
- Transición suave 300ms en todos los cambios de estilo
- En mobile (<768px): menú hamburger con drawer animado con Motion

**Layout desktop:**
```
[Logo]                    [Templates] [Mockups] [Pricing] [Blog]      [Sign in] [Get started →]
```

**Logo:** SVG inline — un punto naranja/rojo + texto "Shots" en `font-family: 'Instrument Serif'`

**Botón "Get started":**
- `background: white`, `color: black`, `border-radius: var(--radius-full)`
- Hover: `scale(1.02)` + `box-shadow: 0 0 0 3px rgba(255,255,255,0.15)`
- `<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>`

**Links de nav:**
- Hover: color `var(--text-primary)` + underline con `::after` que crece desde izquierda
- Active route: color white

```tsx
// Implementar con:
const [scrolled, setScrolled] = useState(false)
useEffect(() => {
  const handler = () => setScrolled(window.scrollY > 20)
  window.addEventListener('scroll', handler, { passive: true })
  return () => window.removeEventListener('scroll', handler)
}, [])
```

---

### Hero (`components/landing/Hero.tsx`)

**Objetivo visual:** Primera impresión que mate. El visitante debe pensar "esto es serio" en 0.3 segundos.

**Estructura JSX:**
```tsx
<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* Fondo: grid de puntos + radial glow */}
  <HeroBackground />

  <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
    {/* Badge animado */}
    <AnimatedBadge>✦ Ahora con exportación a video</AnimatedBadge>

    {/* Headline con entrada staggered por palabra */}
    <HeroHeadline />

    {/* Subtítulo */}
    <motion.p ...>
      Mockups de dispositivos, fondos premium y efectos cinematográficos.
      Exporta en segundos, no en horas.
    </motion.p>

    {/* CTAs */}
    <HeroCTAs />

    {/* Social proof */}
    <SocialProof />

    {/* Dispositivo flotante — el elemento HÉROE visual */}
    <HeroDevice />
  </div>
</section>
```

**`<HeroBackground />`:**
```tsx
// Fondo del hero: dot grid + radial gradient
function HeroBackground() {
  return (
    <>
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }}
      />
      {/* Radial glow azul */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(79,142,247,0.10) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
    </>
  )
}
```

**`<AnimatedBadge />`:**
```tsx
// Badge pill con borde que rota en gradiente (conic-gradient animado)
// CSS: @keyframes rotate { to { --angle: 360deg } }
// border: usando antes/después pseudo con conic-gradient
function AnimatedBadge({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="animated-badge inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8"
    >
      {children}
    </motion.div>
  )
}

/* CSS para animated-badge:
.animated-badge {
  position: relative;
  color: var(--text-secondary);
  background: var(--bg-surface);
}
.animated-badge::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(from var(--angle, 0deg), transparent 70%, #4f8ef7, #a855f7, transparent);
  animation: rotate-gradient 3s linear infinite;
  z-index: -1;
}
@property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
@keyframes rotate-gradient { to { --angle: 360deg; } }
*/
```

**`<HeroHeadline />`:**
```tsx
// Cada palabra entra con un delay staggered
// La palabra clave tiene gradiente de texto
const words = ["Mockups", "que", "detienen", "el", "scroll."]
const gradient_words = ["detienen"] // estas van con gradiente

function HeroHeadline() {
  return (
    <h1 className="text-display font-serif mb-6">
      {words.map((word, i) => (
        <motion.span
          key={word}
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={cn(
            "inline-block mr-[0.25em]",
            gradient_words.includes(word) && "gradient-text"
          )}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  )
}

/* CSS:
.gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, #888888 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
*/
```

**`<HeroDevice />`:**
```tsx
// El elemento visual más importante de toda la landing
// iPhone 16 Pro en CSS puro, flotando, con sombra enorme y glow
function HeroDevice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative mt-20 mx-auto"
      style={{ width: 320, perspective: 1000 }}
    >
      {/* Glow debajo del device */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(79,142,247,0.4) 0%, transparent 70%)',
          filter: 'blur(20px)',
          transform: 'translateX(-50%) translateY(20px)',
        }}
      />

      {/* Float animation en el contenedor del device */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <IPhoneDevice />
      </motion.div>
    </motion.div>
  )
}

// El iPhone en CSS: rectángulo muy redondeado, notch dinámica, pantalla con gradiente
function IPhoneDevice() {
  return (
    <div
      className="relative mx-auto"
      style={{
        width: 240,
        height: 490,
        borderRadius: 44,
        background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #111 100%)',
        boxShadow: 'var(--shadow-device)',
        border: '1px solid rgba(255,255,255,0.12)',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Island */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-black rounded-full z-10"
        style={{ width: 90, height: 28 }}
      />
      {/* Pantalla — gradiente que simula una app */}
      <div
        className="absolute inset-[3px] rounded-[41px] overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0a0a2e 0%, #1a0533 30%, #0d1a3e 60%, #051525 100%)',
        }}
      >
        {/* Contenido de pantalla simulado */}
        <MockScreenContent />
      </div>
    </div>
  )
}
```

---

### Features Grid (`components/landing/Features.tsx`)

**6 cards en bento grid asimétrico:**

```tsx
// Layout bento: no es un grid uniforme
// Card 1 y 2: más anchas (col-span-2)
// Cards 3-6: normales
// En mobile: todas full-width apiladas

const features = [
  {
    id: 'devices',
    tag: 'MOCKUPS',
    title: '100+ dispositivos',
    description: 'iPhone 16 Pro, MacBook Pro M4, iPad Air, Android — todos actualizados al día de lanzamiento de cada dispositivo.',
    span: 'col-span-2', // más ancha
    preview: <DevicesPreview />, // stack de 3 devices en CSS
  },
  {
    id: 'backgrounds',
    tag: 'FONDOS',
    title: 'Backgrounds que convierten',
    description: 'Gradientes curados, fondos de malla, colores sólidos y fotografía premium. Un clic.',
    span: 'col-span-1',
    preview: <BackgroundsPreview />, // grid de swatches
  },
  // ... resto de features
]

// Cada card con animación de entrada via IntersectionObserver
function FeatureCard({ feature, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4, borderColor: 'var(--border-medium)' }}
      className="group relative p-6 rounded-[var(--radius-xl)] border border-[var(--border-faint)] bg-[var(--bg-surface)] overflow-hidden"
    >
      {/* Glow en hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
           style={{ background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(79,142,247,0.06), transparent 60%)' }}
      />
      {/* ... contenido */}
    </motion.div>
  )
}

// El mouse tracking para el glow radial en cada card:
// onMouseMove: actualizar CSS custom properties --mouse-x y --mouse-y relativas a la card
```

---

### Pricing (`components/landing/Pricing.tsx`)

**Toggle mensual/anual con precios que flipean:**

```tsx
const [annual, setAnnual] = useState(false)

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'Para explorar',
    features: [
      { text: '5 exports al mes', included: true },
      { text: 'Watermark en exports', included: true },
      { text: '10 templates básicos', included: true },
      { text: 'Resolución HD (1x)', included: true },
      { text: 'Sin marca de agua', included: false },
      { text: 'Animaciones', included: false },
      { text: 'Export en video', included: false },
    ],
    cta: 'Empezar gratis',
    ctaVariant: 'ghost',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: { monthly: 12, annual: 9 },
    description: 'Para creadores serios',
    badge: 'Más popular',
    features: [
      { text: 'Exports ilimitados', included: true },
      { text: 'Sin marca de agua', included: true },
      { text: '200+ templates premium', included: true },
      { text: 'Resolución 4K (4x)', included: true },
      { text: 'Export en video MP4/GIF', included: true },
      { text: 'Efectos VHS, Noise, Glitch', included: true },
      { text: 'Brand kit (logo + colores)', included: true },
    ],
    cta: 'Empezar Pro',
    ctaVariant: 'primary',
    highlighted: true, // borde gradiente animado
  },
  {
    name: 'Team',
    price: { monthly: 29, annual: 23 },
    description: 'Para equipos',
    features: [
      { text: 'Todo de Pro', included: true },
      { text: 'Hasta 10 miembros', included: true },
      { text: 'Carpetas compartidas', included: true },
      { text: 'Análisis de uso', included: true },
      { text: 'SSO / SAML', included: true },
      { text: 'SLA garantizado', included: true },
      { text: 'Soporte prioritario', included: true },
    ],
    cta: 'Hablar con ventas',
    ctaVariant: 'ghost',
    highlighted: false,
  },
]

// La card Pro tiene este efecto de borde:
/* CSS:
.pricing-card-pro {
  position: relative;
}
.pricing-card-pro::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(from var(--angle, 0deg), #4f8ef7, #a855f7, #4f8ef7);
  animation: rotate-gradient 4s linear infinite;
  z-index: -1;
}
*/

// Precio con flip animation al togglear:
<AnimatePresence mode="wait">
  <motion.span
    key={annual ? 'annual' : 'monthly'}
    initial={{ opacity: 0, rotateX: 90 }}
    animate={{ opacity: 1, rotateX: 0 }}
    exit={{ opacity: 0, rotateX: -90 }}
    transition={{ duration: 0.2 }}
    style={{ display: 'inline-block', transformStyle: 'preserve-3d' }}
  >
    ${annual ? plan.price.annual : plan.price.monthly}
  </motion.span>
</AnimatePresence>
```

---

## EDITOR — ESPECIFICACIÓN COMPLETA

Esta es la parte core del producto. El editor donde el usuario crea el mockup.

### Layout del editor

```
┌─────────────────────────────────────────────────────────────┐
│ [← Dashboard]  [Nombre del proyecto]  [Deshacer] [Rehacer] [Exportar] │  ← Top bar
├──────────┬──────────────────────────────────────┬───────────┤
│          │                                      │           │
│ DEVICES  │                                      │ FONDOS    │
│ ──────── │          CANVAS (Fabric.js)          │ ──────── │
│ iPhone   │                                      │ Gradients │
│ MacBook  │      [Mockup Preview]                │ Meshes    │
│ iPad     │                                      │ Colors    │
│ Android  │                                      │ Photos    │
│ Watch    │                                      │ ──────── │
│ ──────── │                                      │ EFFECTS   │
│ MOCKUP   │                                      │ ──────── │
│ OPTIONS  │                                      │ Noise     │
│          │                                      │ VHS       │
│          │                                      │ Glitch    │
└──────────┴──────────────────────────────────────┴───────────┘
```

### Canvas (`components/editor/Canvas.tsx`)

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { Canvas as FabricCanvas, FabricImage, filters } from 'fabric'
import { useEditorStore } from '@/store/editor'

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<FabricCanvas | null>(null)
  const { selectedDevice, background, effects } = useEditorStore()

  useEffect(() => {
    if (!canvasRef.current) return

    // Inicializar Fabric
    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1200,
      height: 1200,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      controlsAboveOverlay: true,
    })
    fabricRef.current = canvas

    return () => canvas.dispose()
  }, [])

  // Cuando cambia el device, actualizar el mockup
  useEffect(() => {
    if (!fabricRef.current || !selectedDevice) return
    applyDeviceMockup(fabricRef.current, selectedDevice)
  }, [selectedDevice])

  // Cuando cambia el fondo
  useEffect(() => {
    if (!fabricRef.current) return
    applyBackground(fabricRef.current, background)
  }, [background])

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-[var(--bg-base)] overflow-hidden">
      {/* Checkerboard pattern para transparencia */}
      <div className="absolute inset-0 checkerboard opacity-30" />

      {/* Canvas con zoom y pan */}
      <div className="relative" style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}>
        <canvas ref={canvasRef} />
      </div>

      {/* Zoom controls */}
      <ZoomControls />
    </div>
  )
}
```

### Device Templates (`lib/canvas/devices.ts`)

```ts
// Cada device es un objeto con su forma SVG/canvas y la región donde va la pantalla

export interface DeviceTemplate {
  id: string
  name: string
  category: 'phone' | 'tablet' | 'laptop' | 'desktop' | 'watch'
  aspectRatio: number         // del canvas completo
  screenRegion: {             // donde se aplica el screenshot
    x: number                 // % del canvas
    y: number
    width: number
    height: number
    borderRadius: number      // de los bordes de la pantalla
    rotation: number          // para devices en perspectiva
  }
  shadowConfig: {
    blur: number
    offsetY: number
    color: string
    opacity: number
  }
  // La forma del device como SVG path o Fabric objects
  devicePath: string          // SVG path del chasis
  screenPath: string          // SVG path de la pantalla (clip)
  bezelColor: string
  highlightPath?: string      // reflejo de luz
}

export const DEVICES: DeviceTemplate[] = [
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    category: 'phone',
    aspectRatio: 9/19.5,
    screenRegion: { x: 5.2, y: 2.8, width: 89.6, height: 94.4, borderRadius: 12, rotation: 0 },
    shadowConfig: { blur: 80, offsetY: 40, color: '#000', opacity: 0.7 },
    bezelColor: '#2a2a2a',
    // paths...
  },
  {
    id: 'macbook-pro-14',
    name: 'MacBook Pro 14"',
    category: 'laptop',
    aspectRatio: 16/10,
    screenRegion: { x: 8.5, y: 4, width: 83, height: 88, borderRadius: 4, rotation: 0 },
    // ...
  },
  // ... 100+ devices más
]

// Función para aplicar un device al canvas de Fabric:
export async function applyDeviceMockup(
  canvas: FabricCanvas,
  device: DeviceTemplate,
  screenshot: string | null
) {
  canvas.clear()

  // 1. Dibujar el chasis del device
  // 2. Si hay screenshot, aplicarlo como clip en screenRegion
  // 3. Añadir highlight/reflejo encima
  // 4. Aplicar sombra
}
```

### Background System (`lib/canvas/backgrounds.ts`)

```ts
export type BackgroundType = 'gradient' | 'mesh' | 'solid' | 'image' | 'pattern'

export interface Background {
  id: string
  type: BackgroundType
  name: string
  preview: string      // small base64 para thumbnail
  apply: (canvas: FabricCanvas) => void
}

// Gradientes curados (mínimo 30):
export const GRADIENTS: Background[] = [
  { id: 'midnight', type: 'gradient', name: 'Midnight',
    apply: (c) => c.set('backgroundColor',
      'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)') },
  { id: 'aurora', type: 'gradient', name: 'Aurora',
    apply: (c) => { /* canvas gradient verde/morado */ } },
  // ...
]

// Mesh gradients (generados con multiple radial-gradients):
export const MESHES: Background[] = [
  // Cada mesh es un canvas con múltiples radial gradients superpuestos
]
```

### Effects System (`lib/canvas/effects.ts`)

```ts
// Efectos usando Fabric.js filters:

export const EFFECTS = {
  noise: (intensity: number) => [
    new filters.Noise({ noise: intensity * 100 }),
  ],

  vhs: () => [
    new filters.Saturation({ saturation: 0.3 }),
    new filters.Blur({ blur: 0.5 }),
    // Custom Fabric filter para scanlines
    new ScanLinesFilter(),
    new ChromaticAberrationFilter(),
  ],

  glitch: (intensity: number) => [
    // Custom filter que desplaza canales RGB
    new RGBSplitFilter({ offset: intensity * 10 }),
  ],

  grain: (intensity: number) => [
    new FilmGrainFilter({ intensity }),
  ],
}

// Implementar ScanLinesFilter como WebGL shader en Fabric:
class ScanLinesFilter extends filters.BaseFilter {
  static type = 'ScanLines'

  getFragmentSource() {
    return `
      precision highp float;
      uniform sampler2D uTexture;
      varying vec2 vTexCoord;
      uniform float uIntensity;

      void main() {
        vec4 color = texture2D(uTexture, vTexCoord);
        float scanline = sin(vTexCoord.y * 800.0) * 0.04 * uIntensity;
        gl_FragColor = color - vec4(scanline, scanline, scanline, 0.0);
      }
    `
  }
}
```

### Export System (`lib/canvas/export.ts` + `app/api/export/route.ts`)

```ts
// Cliente: prepara el canvas y lo manda al servidor para procesamiento
export async function exportMockup(config: ExportConfig): Promise<Blob> {
  const { format, size, quality, canvas } = config

  if (format === 'png' || format === 'webp') {
    // Export directo en el cliente vía Fabric
    return canvas.toCanvasElement().toBlob(null, `image/${format}`, quality)
  }

  if (format === 'mp4' || format === 'gif') {
    // Para video, mandar frames al servidor y usar FFmpeg
    const frames = await captureFrames(canvas, config.animation)
    const response = await fetch('/api/export', {
      method: 'POST',
      body: JSON.stringify({ frames, format, fps: config.fps }),
    })
    return response.blob()
  }
}

// Servidor: app/api/export/route.ts
// Usa FFmpeg para ensamblar frames en MP4/GIF
import { createFFmpeg } from '@ffmpeg/ffmpeg'

export async function POST(req: Request) {
  const { frames, format, fps } = await req.json()

  const ffmpeg = createFFmpeg({ log: false })
  await ffmpeg.load()

  // Escribir frames como PNG temporales
  for (const [i, frame] of frames.entries()) {
    ffmpeg.FS('writeFile', `frame${i.toString().padStart(4,'0')}.png`, frame)
  }

  // Ensamblar
  if (format === 'mp4') {
    await ffmpeg.run('-r', String(fps), '-i', 'frame%04d.png',
      '-vcodec', 'libx264', '-crf', '18', 'output.mp4')
  }

  const output = ffmpeg.FS('readFile', `output.${format}`)
  return new Response(output, {
    headers: { 'Content-Type': `video/${format}` }
  })
}
```

---

## BASE DE DATOS — SCHEMA COMPLETO

```ts
// packages/db/schema/users.ts
export const users = pgTable('users', {
  id:             uuid('id').primaryKey().defaultRandom(),
  email:          text('email').notNull().unique(),
  name:           text('name'),
  avatarUrl:      text('avatar_url'),
  plan:           text('plan').notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt:      timestamp('created_at').defaultNow().notNull(),
  updatedAt:      timestamp('updated_at').defaultNow().notNull(),
})

// packages/db/schema/projects.ts
export const projects = pgTable('projects', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name:        text('name').notNull().default('Sin título'),
  thumbnail:   text('thumbnail'),           // URL en MinIO
  canvasData:  jsonb('canvas_data'),        // Estado serializado de Fabric
  deviceId:    text('device_id'),
  backgroundId: text('background_id'),
  isPublic:    boolean('is_public').default(false),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().notNull(),
})

// packages/db/schema/exports.ts
export const exports = pgTable('exports', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').references(() => projects.id),
  format:    text('format').notNull(),      // png | webp | mp4 | gif
  size:      text('size').notNull(),        // 1x | 2x | 4x
  fileUrl:   text('file_url'),             // URL en MinIO
  fileSize:  integer('file_size'),
  status:    text('status').default('pending'), // pending | done | error
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// packages/db/schema/subscriptions.ts
export const subscriptions = pgTable('subscriptions', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  userId:             uuid('user_id').references(() => users.id),
  stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
  stripePriceId:      text('stripe_price_id').notNull(),
  status:             text('status').notNull(), // active | canceled | past_due
  currentPeriodEnd:   timestamp('current_period_end'),
  cancelAtPeriodEnd:  boolean('cancel_at_period_end').default(false),
  createdAt:          timestamp('created_at').defaultNow().notNull(),
})
```

---

## TRPC ROUTERS — API COMPLETA

```ts
// lib/trpc/routers/projects.ts
export const projectsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db.select().from(projects)
      .where(eq(projects.userId, ctx.session.user.id))
      .orderBy(desc(projects.updatedAt))
  }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const [project] = await db.insert(projects).values({
        userId: ctx.session.user.id,
        name: input.name,
      }).returning()
      return project
    }),

  save: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      canvasData: z.any(),
      thumbnail: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verificar ownership
      const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, input.id), eq(projects.userId, ctx.session.user.id))
      })
      if (!project) throw new TRPCError({ code: 'FORBIDDEN' })

      return db.update(projects)
        .set({ canvasData: input.canvasData, thumbnail: input.thumbnail, updatedAt: new Date() })
        .where(eq(projects.id, input.id))
        .returning()
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),
})
```

---

## ZUSTAND STORE — ESTADO DEL EDITOR

```ts
// store/editor.ts
interface EditorState {
  // Canvas
  canvasRef: FabricCanvas | null
  zoom: number
  pan: { x: number; y: number }

  // Contenido
  screenshot: string | null
  selectedDevice: DeviceTemplate | null
  background: Background | null
  activeEffects: EffectConfig[]

  // UI
  activePanel: 'devices' | 'backgrounds' | 'effects' | 'export'
  isExporting: boolean

  // Historia (undo/redo)
  history: CanvasState[]
  historyIndex: number

  // Acciones
  setCanvas: (canvas: FabricCanvas) => void
  setScreenshot: (url: string) => void
  selectDevice: (device: DeviceTemplate) => void
  setBackground: (bg: Background) => void
  toggleEffect: (effect: EffectConfig) => void
  undo: () => void
  redo: () => void
  reset: () => void
}

export const useEditorStore = create<EditorState>()(
  devtools(
    immer((set, get) => ({
      // ... implementación con immer para mutaciones inmutables
    }))
  )
)
```

---

## DOCKER + DEPLOY

### `docker-compose.yml`

```yaml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/shotso
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      BETTER_AUTH_SECRET: ${BETTER_AUTH_SECRET}
      RESEND_API_KEY: ${RESEND_API_KEY}
      NEXT_PUBLIC_APP_URL: ${APP_URL}
    depends_on:
      db:
        condition: service_healthy
      minio:
        condition: service_started
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: shotso
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    command: server /data --console-address ":9001"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  minio_data:
```

### `apps/web/Dockerfile`

```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat ffmpeg

FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

---

## PERFORMANCE Y OPTIMIZACIONES

```tsx
// 1. Lazy load del editor de canvas (es pesado)
const Editor = dynamic(() => import('@/components/editor/Canvas'), {
  ssr: false, // Fabric.js no es SSR-compatible
  loading: () => <EditorSkeleton />,
})

// 2. Virtualización en grids grandes (templates, backgrounds)
import { useVirtualizer } from '@tanstack/react-virtual'

// 3. Prefetch de assets críticos en el layout
export async function generateMetadata() {
  return {
    other: {
      'Link': '</fonts/DMSans.woff2>; rel=preload; as=font; crossorigin',
    }
  }
}

// 4. Image optimization con next/image para thumbnails
import Image from 'next/image'

// 5. Memoización agresiva en el editor (re-renders matan el canvas)
const Toolbar = memo(function Toolbar({ ... }) { ... })

// 6. Web Workers para procesamiento de imagen pesado
// export-worker.ts: Sharp operations off the main thread

// 7. Bundle analyzer en turbo.json para detectar bloat
```

---

## ANIMACIONES CON GSAP (landing)

```tsx
// components/landing/Hero.tsx
// ScrollTrigger para el device que se "acerca" al hacer scroll

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function HeroScrollAnimation() {
  const containerRef = useRef(null)

  useGSAP(() => {
    // El device crece y se centra al hacer scroll
    gsap.to('.hero-device', {
      scale: 1.3,
      y: 80,
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    })

    // Parallax en el fondo
    gsap.to('.hero-bg', {
      yPercent: -30,
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 2,
      }
    })
  }, { scope: containerRef })

  return <section ref={containerRef} className="hero-section"> ... </section>
}

// Marquee de logos con GSAP (más smooth que CSS)
function LogoMarquee({ logos }) {
  useGSAP(() => {
    gsap.to('.marquee-track', {
      x: '-50%',
      duration: 20,
      ease: 'none',
      repeat: -1,
    })
  })

  return (
    <div className="overflow-hidden">
      <div className="marquee-track flex">
        {[...logos, ...logos].map((logo, i) => (
          <LogoItem key={i} logo={logo} />
        ))}
      </div>
    </div>
  )
}
```

---

## CHECKLIST DE CALIDAD — ANTES DE ENTREGAR

```
VISUAL:
[ ] Grain/noise en toda la app
[ ] Todos los bordes son variables CSS (no hardcoded)
[ ] Cards con glow radial en hover que sigue el mouse
[ ] Sombras multicapa en elementos elevados
[ ] Transiciones en TODOS los estados hover/focus/active
[ ] El dispositivo flotante tiene sombra + glow + animación float
[ ] Los gradientes de texto usan background-clip correctamente
[ ] En mobile no hay overflow horizontal
[ ] Las fuentes cargan con font-display: swap

PERFORMANCE:
[ ] Canvas (Fabric) carga lazy con Suspense
[ ] Las imágenes usan next/image
[ ] No hay re-renders innecesarios en el editor (memoización)
[ ] Bundle size del home < 200KB gzipped
[ ] LCP < 2.5s en PageSpeed Insights

CÓDIGO:
[ ] TypeScript sin `any` (excepto Fabric types que lo requieren)
[ ] Todos los tRPC inputs tienen Zod schemas
[ ] Error boundaries en el editor
[ ] Variables de entorno validadas con Zod en env.ts
[ ] No hay console.log en producción
[ ] Los webhooks de Stripe verifican la firma

ACCESIBILIDAD:
[ ] Todos los botones con aria-label donde no hay texto visible
[ ] Focus visible en todos los elementos interactivos
[ ] prefers-reduced-motion respetado
[ ] Contraste WCAG AA en todos los textos
[ ] Keyboard navigation funciona en el editor
```

---

## INSTRUCCIONES DE EJECUCIÓN

Cuando yo te pida que construyas una parte de este sistema, hazlo siguiendo estas reglas:

1. **Escribe código TypeScript real y completo** — no pseudocódigo, no `// TODO`, no `// implement here`
2. **Los componentes deben ser copy-paste** — que yo los pueda pegar en el proyecto sin cambios
3. **Incluye todos los imports** necesarios en cada archivo
4. **Los tipos TypeScript deben ser explícitos** — no confíes en inferencia cuando la intención no es obvia
5. **CSS debe usar las variables** definidas en este documento, no valores hardcoded
6. **Las animaciones con Motion deben ser fluidas** — usa `ease: [0.16, 1, 0.3, 1]` (ease out expo) como default
7. **Los errores deben manejarse** con try/catch + feedback al usuario (toast, etc.)
8. **Cada componente debe ser production-ready**: loading states, error states, empty states

Cuando yo diga "construye la sección X" o "implementa el componente Y", usa este documento completo como referencia y produce el código correspondiente con máxima calidad.

**El objetivo es un producto que alguien pagaría $12/mes sin dudarlo.**