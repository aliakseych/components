import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

export type SiteFooterProps = {
  brandName: string;
  nav: { label: string; href: string }[];
  phone: { label: string; href: string };
  email: string;
  legal: string;
  privacy: { label: string; href: string };
  socials: { label: string; href: string; icon: ReactNode }[];
};

export function SiteFooter({ brandName, nav, phone, email, legal, privacy, socials }: SiteFooterProps) {
  const link = "rounded-sm text-base font-semibold text-white transition-colors outline-none hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky";
  return (
    <footer className="bg-ink pt-12 pb-16">
      <div className="container-own">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <a href="#top" aria-label={brandName} className="shrink-0 rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky">
            <Logo name={brandName} className="text-[25px]" />
          </a>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3 lg:flex-1 lg:justify-center">
            {nav.map((l) => <a key={l.label} href={l.href} className={link}>{l.label}</a>)}
          </nav>
          <div className="flex flex-col gap-3">
            <a href={phone.href} className={link}>{phone.label}</a>
            <a href={`mailto:${email}`} className={link}>{email}</a>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
            <p className="text-white/50">{legal}</p>
            <a href={privacy.href} className="rounded-sm text-white/70 underline-offset-2 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-sky">{privacy.label}</a>
          </div>
          <ul className="flex gap-3">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} aria-label={s.label} className="block size-8 rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky">{s.icon}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
