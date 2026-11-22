// Page copy (English). Brand and contacts live in src/template.config.tsx.
import type { JourneyStrings } from "@/components/landing/journey";

export const copy = {
  skip: "Skip to content",
  nav: {
    label: "Main navigation",
    home: "Home",
    links: [
      { label: "Journey", href: "#journey" },
      { label: "Before you travel", href: "#plan" },
      { label: "Legal", href: "#trust" },
    ],
    sections: "Sections",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    language: (name: string) => `Language: ${name}`,
    languageList: "Choose a language",
    close: "Close",
  },
  hero: {
    heading: "Come to Uzbekistan as our guest",
    sub: "We have hosted travellers in Uzbekistan for years. We meet you at the airport and look after every day of your trip.",
    primary: "See the route",
    secondary: "Before you travel",
  },
  plan: {
    heading: "Plan your trip",
    open: "Open",
    travel: { title: "Before you travel", body: "Visa rules for your passport, Tashkent time, money, SIM cards and what happens after you land." },
    contacts: { title: "Contacts and payment details", body: "Phones, messengers, office address and hours, and bank details for paying us." },
  },
  trust: {
    heading: "Legal & documents",
    all: "All company details and documents",
    previewAlt: (title: string) => `Preview of ${title}`,
  },
  footer: {
    company: "Company",
    tin: "Taxpayer ID (TIN)",
    licence: "Tour operator licence",
    licenceLine: (number: string, date: string) => `No. ${number}, issued ${date}`,
    address: "Postal address",
    hours: "Working hours",
    contacts: "Contacts",
    whatsapp: "WhatsApp",
    links: "Information",
    legal: "Legal",
    payments: "Payment details",
    how: "How we work",
    travel: "Before you travel",
    languages: "Languages",
    rights: "All rights reserved.",
    photos: "Photos used",
    source: "Source",
    close: "Close",
  },
};

export const journeyStrings: JourneyStrings = {
  heading: "Across Uzbekistan, city by city",
  label: "Map of Uzbekistan with the stops Tashkent, Fergana, Samarkand, Bukhara, Khiva",
  imageryCredit: "© EOX Sentinel-2 cloudless 2016",
  back: "Back",
  close: "Close",
  photos: "Photos",
  prev: "Previous photo",
  next: "Next photo",
  highlights: "Highlights",
  bestTime: "Best time to go",
  highsLabel: "Average daily high, °C",
  goodMonth: "a good month to go",
  attractions: "Places to see",
  stopOf: (n, total) => `Stop ${n} of ${total}`,
  leg: (hours, mode) => {
    const h = Math.floor(hours), m = Math.round((hours - h) * 60);
    return `≈ ${h} h${m ? ` ${m} min` : ""} ${{ train: "by train", road: "by road", flight: "by plane" }[mode]}`;
  },
  hl: { knownFor: "Known for", taste: "Taste", dontMiss: "Don’t miss" },
  kind: { historical: "Historical", natural: "Nature", craft: "Craft", food: "Food", modern: "Modern" },
};
