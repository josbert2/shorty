type ClassValue = string | number | null | false | undefined | Record<string, boolean> | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (v: ClassValue) => {
    if (!v) return;
    if (typeof v === "string" || typeof v === "number") {
      out.push(String(v));
      return;
    }
    if (Array.isArray(v)) {
      for (const x of v) walk(x);
      return;
    }
    if (typeof v === "object") {
      for (const k in v) if (v[k]) out.push(k);
    }
  };
  for (const i of inputs) walk(i);
  return out.join(" ");
}
