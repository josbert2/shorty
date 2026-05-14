import "server-only";
import { Polar } from "@polar-sh/sdk";
import { env } from "./env";

let _client: Polar | null = null;

export function getPolar(): Polar {
  if (_client) return _client;
  if (!env.polar.accessToken) {
    throw new Error(
      "POLAR_ACCESS_TOKEN no está definido. Completá apps/web/.env.local"
    );
  }
  _client = new Polar({
    accessToken: env.polar.accessToken,
    server: env.polar.server, // "sandbox" | "production"
  });
  return _client;
}

export type Plan = "free" | "pro" | "team";

export interface PlanLimits {
  monthlyExports: number; // Infinity = ilimitado
  videoExports: boolean;
  watermark: boolean;
  maxScale: 1 | 2 | 4;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: { monthlyExports: 5,        videoExports: false, watermark: true,  maxScale: 1 },
  pro:  { monthlyExports: Infinity, videoExports: true,  watermark: false, maxScale: 4 },
  team: { monthlyExports: Infinity, videoExports: true,  watermark: false, maxScale: 4 },
};

/**
 * Mapea un Product ID de Polar al plan interno.
 * Polar trabaja con products (no prices como Stripe). El interval (monthly/yearly)
 * suele estar en distintos products o en el mismo product con multiple recurring prices.
 */
export function productIdToPlan(productId: string | null | undefined): Plan {
  if (!productId) return "free";
  if (productId === env.polar.proProductId) return "pro";
  return "free";
}
