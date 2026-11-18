import {
  ArrowRight,
  Award,
  ChevronRight,
  Compass,
  Flag,
  Home,
  Mail,
  MessageSquare,
  PanelLeft,
  PenLine,
  Plus,
  ListChecks,
  Users,
  User,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";
import { dashboard } from "@/sample/content";
import { config } from "@/template.config";

const mainIcons: LucideIcon[] = [Home, Compass, MessageSquare, Users];
const appIcons: LucideIcon[] = [ListChecks, Award, PenLine, User];
const todayIcons: Record<string, LucideIcon> = { pen: PenLine, award: Award, mail: CircleCheck };
const pointIcons: Record<string, LucideIcon> = { pen: PenLine, mail: Mail, flag: Flag };

/** Static product screen rendered in code in place of a screenshot. Decorative: hidden from assistive tech. */
export function DashboardMock() {
  return (
    <div aria-hidden="true" className="flex h-full w-full bg-panel text-[11px] text-olive-950 select-none dark:text-olive-100">
      <aside className="flex w-[184px] shrink-0 flex-col gap-0.5 border-r border-panel-line bg-olive-950/[0.02] px-2 py-3 max-sm:hidden dark:bg-white/[0.02]">
        <div className="flex items-center justify-between px-1.5 pb-3">
          <span className="font-serif text-xl font-semibold tracking-tight">{config.brandName}</span>
          <PanelLeft className="size-3.5 text-olive-500" />
        </div>
        <div className="mb-2 flex items-center gap-2 rounded-md bg-panel px-2 py-1.5 font-medium shadow-[0_0_0_1px_var(--panel-line)]">
          <Plus className="size-3" /> New
        </div>
        {dashboard.sidebar.main.map((label, i) => {
          const Icon = mainIcons[i];
          return (
            <div key={label} className={`flex items-center gap-2 rounded-md px-2 py-1 ${i === 0 ? "bg-olive-950/5 font-medium dark:bg-white/5" : "text-olive-700 dark:text-olive-300"}`}>
              <Icon className="size-3" /> {label}
            </div>
          );
        })}
        <p className="mt-3 px-2 text-[9px] text-olive-500">Application</p>
        {dashboard.sidebar.application.map((item, i) => {
          const Icon = appIcons[i];
          return (
            <div key={item.label} className="flex items-center gap-2 rounded-md px-2 py-1 text-olive-700 dark:text-olive-300">
              <Icon className="size-3" />
              <span className="flex-1">{item.label}</span>
              {item.count && <span className="flex items-center text-[9px] text-olive-500">{item.count}<ChevronRight className="size-2.5" /></span>}
            </div>
          );
        })}
        {dashboard.sidebar.schools.map((s) => (
          <div key={s.label} className="flex items-center gap-2 rounded-md px-2 py-1 text-olive-700 dark:text-olive-300">
            <span className="size-3 rounded-[3px]" style={{ background: s.color }} />
            <span className="flex-1 truncate">{s.label}</span>
            <span className="flex items-center text-[9px] text-olive-500">{s.count}<ChevronRight className="size-2.5" /></span>
          </div>
        ))}
      </aside>

      <div className="min-w-0 flex-1 overflow-hidden px-5 pt-9 sm:px-12">
        <p className="text-lg font-medium tracking-tight">{dashboard.greeting}</p>
        <p className="mt-1 text-olive-600 dark:text-olive-400">{dashboard.subline}</p>

        <p className="mt-9 text-olive-600 dark:text-olive-400">Today</p>
        <div className="mt-2 divide-y divide-panel-line rounded-md border border-panel-line">
          {dashboard.today.map((t) => {
            const Icon = todayIcons[t.icon];
            return (
              <div key={t.title} className="flex items-center gap-3 px-3 py-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-panel-line">
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{t.title}</span>
                  <span className="block truncate text-[9px] text-olive-600 dark:text-olive-400">{t.meta}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[9px] text-olive-600 max-sm:hidden dark:text-olive-400">
                  {t.action} <ArrowRight className="size-2.5" />
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-9 flex justify-between text-olive-600 dark:text-olive-400">
          <span>Your timeline</span>
          <span className="text-[9px]">5 RD</span>
        </div>
        <p className="text-[9px] text-olive-500">Dates anchor to your earliest deadline: Northfield University (RD) · Jan 1, 2027</p>
        <div className="relative mt-3 h-[86px] rounded-md border border-panel-line">
          <div className="absolute inset-x-4 top-[26px] h-px bg-panel-line" />
          {dashboard.timeline.map((p) => {
            const Icon = pointIcons[p.kind];
            return (
              <div key={p.label + p.at} className="absolute top-3 flex -translate-x-1/2 flex-col items-center gap-1" style={{ left: `${p.at}%` }}>
                <span className="relative flex h-7 items-center">
                  {p.kind === "dot" && <span className="size-1.5 rounded-full bg-olive-950 dark:bg-white" />}
                  {p.kind === "schools" && (
                    <span className="flex gap-0.5">
                      {dashboard.sidebar.schools.map((s) => (
                        <span key={s.label} className="size-4 rounded-[3px]" style={{ background: s.color }} />
                      ))}
                    </span>
                  )}
                  {Icon && (
                    <span className={`flex size-5 items-center justify-center rounded-md ${p.kind === "flag" ? "bg-olive-950 text-white dark:bg-white dark:text-olive-950" : "bg-olive-950/5 dark:bg-white/10"}`}>
                      <Icon className="size-3" />
                    </span>
                  )}
                  {p.badge && (
                    <span className="absolute -top-1 -right-2 flex size-3 items-center justify-center rounded-full bg-olive-950 text-[7px] text-white dark:bg-white dark:text-olive-950">{p.badge}</span>
                  )}
                </span>
                <span className="text-[8px] whitespace-nowrap text-olive-700 max-sm:hidden dark:text-olive-300">{p.label}</span>
                {p.meta && <span className="text-[7px] text-olive-500 max-sm:hidden">{p.meta}</span>}
              </div>
            );
          })}
        </div>

        <div className="mt-9 flex justify-between text-olive-600 dark:text-olive-400">
          <span>Your roadmap</span>
          <span className="text-[9px]">0 of 25 done</span>
        </div>
        <div className="mt-2 flex justify-between rounded-md border border-panel-line px-3 py-2.5 font-medium">
          Foundation <span className="text-[9px] font-normal text-olive-500">0/5</span>
        </div>
        <div className="mt-2 flex justify-between rounded-md border border-panel-line px-3 py-2.5 font-medium">
          School list <span className="text-[9px] font-normal text-olive-500">0/6</span>
        </div>
      </div>
    </div>
  );
}
