/**
 * Validación liviana de env vars del servidor.
 * NO importar desde Client Components (revela secretos).
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Revisá apps/web/.env.local`
    );
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const env = {
  // App
  appUrl: optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),

  // R2
  r2: {
    endpoint: optional("R2_ENDPOINT"),
    bucket: optional("R2_BUCKET"),
    publicUrl: optional("R2_PUBLIC_URL"),
    accessKeyId: optional("R2_ACCESS_KEY_ID"),
    secretAccessKey: optional("R2_SECRET_ACCESS_KEY"),
    get configured() {
      return Boolean(
        this.endpoint && this.bucket && this.accessKeyId && this.secretAccessKey
      );
    },
  },

  // Auth
  auth: {
    secret: optional("BETTER_AUTH_SECRET"),
    url: optional("BETTER_AUTH_URL", "http://localhost:3000"),
  },

  // Polar
  polar: {
    accessToken: optional("POLAR_ACCESS_TOKEN"),
    webhookSecret: optional("POLAR_WEBHOOK_SECRET"),
    server: (optional("POLAR_SERVER", "sandbox") as "sandbox" | "production"),
    proProductId: optional("POLAR_PRO_PRODUCT_ID"),
    organizationId: optional("POLAR_ORGANIZATION_ID"),
    get configured() {
      return Boolean(this.accessToken && this.webhookSecret && this.proProductId);
    },
  },

  required,
};
