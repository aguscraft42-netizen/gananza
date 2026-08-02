import { cpxAdapter } from "./cpx";
import type { ProviderAdapter } from "./types";

const adapters: Record<string, ProviderAdapter> = {
  [cpxAdapter.slug]: cpxAdapter,
};

export function getProviderAdapter(slug: string): ProviderAdapter | null {
  return adapters[slug] || null;
}

export * from "./cpx";
export * from "./types";
