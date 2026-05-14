import { Navbar } from "@/components/landing/Navbar";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Pricing — Shotso",
  description: "Precios honestos. Sin asteriscos. Cancelás cuando quieras.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
