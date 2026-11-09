# CRM Table

Inspired by https://21st.dev/community/apps/twenty; independently written.

Sales deals as sortable rows. Chips above the table filter by stage and show each stage's total. The header shows the count and sum of the visible rows. On phones the stage moves under the deal name, and the date and owner columns hide.

```tsx
import { CrmTable } from "@/components/business/crm-table";

<CrmTable
  stages={[{ id: "new", label: "New", tone: "chart-1" }]}
  deals={[{ id: "1", name: "Upgrade", company: "Fieldstone", stage: "new", amount: 50000, closeDate: "2026-12-10", owner: "Priya Nair" }]}
/>;
```

## Props

| Prop | Type | Notes |
| --- | --- | --- |
| `title` | `string` | Defaults to "Opportunities" |
| `stages` | `CrmStage[]` | `id`, `label`, `tone` |
| `deals` | `CrmDeal[]` | `amount` in whole units, `closeDate` as an ISO date |
| `currency`, `locale` | `string` | Used for all number and date formats |
