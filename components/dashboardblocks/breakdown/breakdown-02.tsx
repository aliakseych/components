'use client'

import {
  BlockStateProvider,
  BlockStateRows,
  BlockStateText,
  type BlockStateProps,
  getBlockState,
} from '@/components/dashboardblocks/block-state'
import {
  BreakdownBar,
  BreakdownLegend,
  formatShare,
} from '@/components/dashboardblocks/breakdown'
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  DataTableRowHead,
} from '@/components/dashboardblocks/table'

import { Card, CardContent } from '@/components/ui/card'

interface CompositionCategory {
  color: string
  key: string
  label: string
}

interface CompositionGroup {
  label: string
  values: Record<string, number>
}

interface Breakdown2Props extends BlockStateProps {
  categories: CompositionCategory[]
  description: string
  /** Leave out, or pass none, to show the empty state. */
  groups?: CompositionGroup[]
  /** What the groups are, plural, for the summary sentence. @default 'groups' */
  groupsLabel?: string
  highlight: string
  title: string
}

const exampleProps: Breakdown2Props = {
  categories: [
    { color: 'var(--color-chart-2)', key: 'mobile', label: 'Mobile' },
    { color: 'var(--color-chart-3)', key: 'desktop', label: 'Desktop' },
    { color: 'var(--color-chart-4)', key: 'tablet', label: 'Tablet' },
  ],
  description: 'Sessions by device in each region over the last 30 days.',
  groups: [
    { label: 'Asia Pacific', values: { desktop: 9_120, mobile: 21_480, tablet: 1_940 } },
    { label: 'Latin America', values: { desktop: 4_310, mobile: 8_760, tablet: 820 } },
    { label: 'Europe', values: { desktop: 14_920, mobile: 13_410, tablet: 2_310 } },
    {
      label: 'North America',
      values: { desktop: 18_240, mobile: 14_630, tablet: 3_180 },
    },
    { label: 'Africa', values: { desktop: 1_120, mobile: 3_870, tablet: 140 } },
  ],
  groupsLabel: 'regions',
  highlight: 'mobile',
  title: 'Device mix by region',
}

// Below the @md container each bar takes a full line under its label and value.
const STACKED_ROW = '@max-md:grid @max-md:grid-cols-[1fr_auto] @max-md:items-center'

const Breakdown2 = (props: Breakdown2Props) => {
  const {
    categories,
    description,
    groups = [],
    groupsLabel = 'groups',
    highlight,
    errorMessage,
    status,
    title,
  } = props
  const state = getBlockState(status, groups)
  const highlighted = categories.find((category) => category.key === highlight)
  const rows = groups
    .map((group) => {
      const total = categories.reduce(
        (sum, category) => sum + (group.values[category.key] ?? 0),
        0,
      )
      const leader = categories.reduce<CompositionCategory | undefined>(
        (best, category) =>
          best && (group.values[best.key] ?? 0) >= (group.values[category.key] ?? 0)
            ? best
            : category,
        undefined,
      )
      return {
        group,
        leads: leader?.key === highlight,
        share: total > 0 ? (group.values[highlight] ?? 0) / total : 0,
        total,
      }
    })
    .sort((a, b) => b.share - a.share)
  const leads = rows.filter((row) => row.leads).length

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <Card>
        <CardContent>
          <section className='@container flex flex-col gap-4'>
            <header className='flex flex-col gap-0.5'>
              <h2 className='font-semibold tracking-tight'>{title}</h2>
              <p className='text-muted-foreground text-sm'>{description}</p>
            </header>
            <div className='flex flex-col gap-3 border-t pt-4'>
              {state ? (
                <BlockStateText className='text-sm' />
              ) : (
                highlighted && (
                  <p className='text-muted-foreground text-sm'>
                    <span className='text-foreground font-medium'>
                      {highlighted.label}
                    </span>{' '}
                    leads in {leads} of {rows.length} {groupsLabel}.
                  </p>
                )
              )}
              <BreakdownLegend
                items={categories.map((category) => ({
                  color: category.color,
                  label: category.label,
                }))}
              />
            </div>
            {state === 'loading' && <BlockStateRows rows={5} />}
            {!state && (
              <DataTable
                density='compact'
                caption={`${title}: ${description}`}
                className='@max-md:block'
              >
                <DataTableHeader className='@max-md:block'>
                  <DataTableRow className={STACKED_ROW}>
                    <DataTableHead>
                      <span className='sr-only'>Group</span>
                    </DataTableHead>
                    <DataTableHead className='@max-md:hidden'>
                      <span className='sr-only'>Share by category</span>
                    </DataTableHead>
                    <DataTableHead align='end'>{highlighted?.label}</DataTableHead>
                  </DataTableRow>
                </DataTableHeader>
                <DataTableBody className='@max-md:block'>
                  {rows.map(({ group, share, total }) => (
                    <DataTableRow key={group.label} className={STACKED_ROW}>
                      <DataTableRowHead className='w-32 whitespace-nowrap @max-md:w-auto @max-md:pb-1'>
                        {group.label}
                      </DataTableRowHead>
                      <DataTableCell className='@max-md:order-last @max-md:col-span-2 @max-md:pt-0'>
                        <BreakdownBar
                          className='h-2.5'
                          segments={categories.map((category) => ({
                            color: category.color,
                            label: category.label,
                            value: group.values[category.key] ?? 0,
                          }))}
                        />
                        <span className='sr-only'>
                          {categories
                            .map(
                              (category) =>
                                `${category.label} ${formatShare(group.values[category.key] ?? 0, total)}`,
                            )
                            .join(', ')}
                        </span>
                      </DataTableCell>
                      <DataTableCell align='end' className='w-16 @max-md:w-auto @max-md:pb-1'>
                        {formatShare(share, 1)}
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTableBody>
              </DataTable>
            )}
          </section>
        </CardContent>
      </Card>
    </BlockStateProvider>
  )
}

export { Breakdown2, exampleProps as breakdown2ExampleProps, type Breakdown2Props }
