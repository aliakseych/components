// Everything company-specific lives here and in src/sample/. All values are placeholders: swap for your own.

export type Person = { name: string; role: string; phone?: string; whatsapp?: boolean; email?: string };
export type LegalDocument = { title: string; number: string; year: string; issuer: string; href: string };

export const config = {
  /** Wordmark in the intro, the nav pill and the copyright line. */
  brandName: "Silk Road Tours",
  /** Year the company started, for the copyright line. */
  since: 2010,
  legalName: "Example Tours LLC",
  taxId: "000 000 000",
  licence: { number: "T-0000-00", issued: "2020-01-01" },
  address: "1 Example Street, Tashkent, Uzbekistan",
  /** Office hours: weekday numbers 1–7 (Mon–Sun) and 24h times. */
  hours: { days: [1, 6] as [number, number], open: "09:00", close: "18:00" },
  staff: [
    { name: "Alex Example", role: "Director", phone: "+000 00 000 00 00", whatsapp: true, email: "hello@example.com" },
    { name: "Sam Example", role: "Tour manager", phone: "+000 00 000 00 01", whatsapp: true },
  ] satisfies Person[],
  socials: [
    { label: "Telegram", href: "https://example.com/telegram" },
    { label: "Instagram", href: "https://example.com/instagram" },
  ],
  /** Pages this landing links to; add them to your site or point the links elsewhere. */
  links: {
    travel: "/before-you-travel/",
    contacts: "/legal/#company",
    legal: "/legal/",
    payments: "/legal/#payments",
    terms: "/legal/#terms",
  },
  /** Documents shown in "Legal & documents": the first one keeps its preview on phones. */
  documents: [
    { title: "Tour operator licence", number: "T-0000-00", year: "2020", issuer: "Licensing authority", href: "/docs/licence.pdf" },
    { title: "State registration certificate", number: "000000", year: "2010", issuer: "Registration office", href: "/docs/registration.pdf" },
    { title: "Traveller insurance agreement", number: "00-0000", year: "2024", issuer: "Insurance partner", href: "/docs/insurance.pdf" },
  ] satisfies LegalDocument[],
  /** Language switcher entries; point the hrefs at your localised pages. */
  languages: [
    { code: "en", label: "English", href: "/" },
    { code: "ru", label: "Русский", href: "/ru/" },
    { code: "zh-Hans", label: "简体中文", href: "/zh/" },
    { code: "fr", label: "Français", href: "/fr/" },
    { code: "uz-Latn", label: "Oʻzbekcha", href: "/uz/" },
    { code: "de", label: "Deutsch", href: "/de/" },
    { code: "it", label: "Italiano", href: "/it/" },
    { code: "ko", label: "한국어", href: "/ko/" },
    { code: "ja", label: "日本語", href: "/ja/" },
    { code: "tr", label: "Türkçe", href: "/tr/" },
  ],
  currentLanguage: "en",
};

export type Config = typeof config;
