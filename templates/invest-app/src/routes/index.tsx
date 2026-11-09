import Link from "next/link";
import { SearchX } from "lucide-react";
import { GlassCard } from "@/components/viz/glass-card";
import { useTitle } from "@/lib/use-title";
import type { Route } from "@/shims/router";
import AccountAgentsPage from "@/app/account/agents/page";
import AccountPage from "@/app/account/page";
import CompanyPage from "@/app/companies/[id]/page";
import DealPage from "@/app/deals/[id]/page";
import ClosedDealsPage from "@/app/deals/closed/page";
import DealsPage from "@/app/deals/page";
import LoginPage from "@/app/login/page";
import OfflinePage from "@/app/offline/page";
import OnboardingPage from "@/app/onboarding/page";
import HomePage from "@/app/page";
import PoolPage from "@/app/pools/[key]/page";
import PortfolioPage from "@/app/portfolio/[id]/page";
import RegisterPage from "@/app/register/page";

export const routes: Route[] = [
  { path: "/", Component: HomePage },
  { path: "/deals", Component: DealsPage },
  { path: "/deals/closed", Component: ClosedDealsPage },
  { path: "/deals/:id", Component: DealPage },
  { path: "/pools/:key", Component: PoolPage },
  { path: "/companies/:id", Component: CompanyPage },
  { path: "/portfolio/:id", Component: PortfolioPage },
  { path: "/account", Component: AccountPage },
  { path: "/account/agents", Component: AccountAgentsPage },
  { path: "/login", Component: LoginPage },
  { path: "/register", Component: RegisterPage },
  { path: "/onboarding", Component: OnboardingPage },
  { path: "/offline", Component: OfflinePage },
];

export function NotFoundPage() {
  useTitle("Не найдено");
  return (
    <main className="flex flex-1 items-center px-4 pb-32">
      <GlassCard className="flex w-full flex-col items-center gap-5 p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <SearchX className="size-8" />
        </div>
        <h2 className="text-2xl font-semibold">Страница не найдена</h2>
        <Link href="/" className="flex h-12 w-full items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">На главную</Link>
      </GlassCard>
    </main>
  );
}
