import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shotso — Create Amazing Mockups",
  description: "Mockups de dispositivos, fondos premium y efectos cinematográficos. Exporta en segundos.",
  openGraph: {
    title: "Shotso — Create Amazing Mockups",
    description: "Mockups de dispositivos, fondos premium y efectos cinematográficos.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0D0D0D",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-bg text-foreground antialiased">
        {children}
        <NoiseOverlay />
      </body>
    </html>
  );
}
