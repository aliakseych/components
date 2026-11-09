// Everything app-specific lives here: brand, money format, API mode and sample data.
// Swap these for your product; the screens read them through getConfig().
import type { ReactNode } from "react";
import { sampleData, type SampleData } from "./sample/data";

export interface Brand {
  /** Full product name, e.g. in the header and metadata. */
  name: string;
  /** Two-line wordmark next to the mark: [first line, second line]. */
  wordmark: [string, string];
  /** Square brand mark. Defaults to a neutral placeholder. */
  mark?: ReactNode;
  /** One sentence about the product. */
  description: string;
  /** Key prefix for browser storage, e.g. "acme". */
  storageKey: string;
}

export interface InvestAppConfig {
  brand: Brand;
  /** BCP 47 locale for numbers and dates. */
  locale: string;
  /** Currency label written after amounts. */
  currency: string;
  /**
   * Base URL of the API server (see server/). Leave empty to run fully on sample data:
   * every request is answered by src/lib/mock-api.ts, including the AI assistant.
   */
  apiUrl: string;
  /** Data the mock API starts from. */
  sample: SampleData;
}

export const defaultConfig: InvestAppConfig = {
  brand: {
    name: "Northwind Invest",
    wordmark: ["Northwind", "Invest"],
    description: "Инвестиции в закупки биржевых товаров от 1млн. Выплаты каждые 15 дней.",
    storageKey: "northwind-invest",
  },
  locale: "ru-RU",
  currency: "сум",
  apiUrl: "",
  sample: sampleData,
};

let current: InvestAppConfig = defaultConfig;

export function getConfig() {
  return current;
}

/** Call before the first render. Partial values are merged into the defaults. */
export function setConfig(next: Partial<InvestAppConfig> & { brand?: Partial<Brand> }) {
  current = { ...defaultConfig, ...next, brand: { ...defaultConfig.brand, ...next.brand } };
}
