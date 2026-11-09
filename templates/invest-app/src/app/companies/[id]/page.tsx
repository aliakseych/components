import { Suspense } from "react";
import { ExternalLink, Search } from "lucide-react";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { FoundersCard } from "@/components/company/founders-card";
import { HalalBadge } from "@/components/company/halal-badge";
import { CopyInn, RequisitesCard } from "@/components/company/requisites-card";
import { StabilityCard } from "@/components/company/stability-card";
import { DealCard } from "@/components/deal-card";
import { PageHeader } from "@/components/page-header";
import { GlassCard } from "@/components/viz/glass-card";
import { RatingBadge } from "@/components/viz/rating-badge";
import { mln, pct } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import { useTitle } from "@/lib/use-title";
import { useParams } from "next/navigation";
import type { CompanyPage } from "@/lib/types";

export default function CompanyRoute() {
  return (
    <>
      <PageHeader title="Компания" back="/deals" />
      <Suspense fallback={<div className="mx-auto max-w-md px-4 py-8 text-muted-foreground">Загружаем компанию…</div>}>
        <CompanyContent />
      </Suspense>
    </>
  );
}

function CompanyContent() {
  const { id } = useParams<{ id: string }>();
  const { data: company } = useApi<CompanyPage>(`/companies/${id}/`);
  useTitle(company?.name);
  if (!company) return <div className="mx-auto max-w-md px-4 py-8 text-muted-foreground">Загружаем компанию…</div>;
  return (
    <main className="mx-auto w-full min-w-0 max-w-md space-y-4 px-4 pb-32">
      <GlassCard className="space-y-5">
        <div className="flex items-center gap-4">
          <RatingBadge rating={company.rating} size={64} />
          <div className="min-w-0"><h1 className="text-xl font-semibold">{company.name}</h1><p className="text-sm text-muted-foreground">{company.kind} · {company.region}</p></div>
        </div>
        <HalalBadge halal={company.halal} note={company.halal_note} size="large" />
        <div className="flex flex-wrap gap-2">
          <CopyInn inn={company.inn} />
          <a href={company.orginfo_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-3 text-sm font-medium">
            {company.orginfo_direct ? <>orginfo.uz <ExternalLink className="size-4" /></> : <>Найти на orginfo.uz по ИНН <Search className="size-4" /></>}
          </a>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t pt-4">
          <div><p className="font-semibold tabular">{company.totals.deals.toLocaleString("ru-RU")}</p><p className="text-xs text-muted-foreground">сделок</p></div>
          <div><p className="font-semibold tabular">{mln(company.totals.raised)}</p><p className="text-xs text-muted-foreground">привлечено</p></div>
          <div><p className="font-semibold tabular">{pct(company.totals.paid_on_time_pct)}</p><p className="text-xs text-muted-foreground">в срок</p></div>
        </div>
        <AskAiButton company_id={company.id} title={company.name} block="Компания" question="Стоит ли доверять этой компании?" label="Стоит ли доверять этой компании?" className="min-h-11 whitespace-normal text-left" />
      </GlassCard>
      <StabilityCard company={company} />
      <FoundersCard founders={company.founders} />
      <RequisitesCard company={company} />
      <section className="space-y-3">
        <h2 className="px-1 text-lg font-semibold">Сделки компании</h2>
        {company.deals.length ? company.deals.map(deal => <DealCard key={deal.id} deal={deal} />) : <p className="px-1 text-sm text-muted-foreground">Пока нет сделок</p>}
      </section>
    </main>
  );
}
