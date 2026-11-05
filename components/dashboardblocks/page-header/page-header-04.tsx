'use client'

import { PlusIcon, SearchIcon } from 'lucide-react'
import {
  BlockStateProvider,
  BlockStateText,
  type BlockStateProps,
  SkeletonText,
  getBlockState,
} from '@/components/dashboardblocks/block-state'
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
  PageHeaderRow,
} from '@/components/dashboardblocks/page-header'
import { formatNumber } from '@/lib/dashboardblocks/format'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

interface PageHeader4Props extends BlockStateProps {
  /** Leave out to show the empty state. */
  count?: number
  description?: string
  onCreate?: () => void
  onSearch?: (query: string) => void
  title: string
}

const exampleProps: PageHeader4Props = {
  count: 2_481,
  description: '312 of them bought for the first time this month.',
  title: 'Customers',
}

const PageHeader4 = (props: PageHeader4Props) => {
  const {
    count,
    description,
    onCreate = () => {},
    onSearch = () => {},
    errorMessage,
    status,
    title,
  } = props
  const [query, setQuery] = useState('')
  const state = getBlockState(status, count)

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <PageHeader>
        <PageHeaderRow className='@2xl/page-header:items-end'>
          <PageHeaderHeading
            title={title}
            description={
              state === 'loading' ? (
                <SkeletonText className='w-56 max-w-full' />
              ) : (
                !state && description
              )
            }
            badge={
              <span className='text-muted-foreground text-2xl font-light tracking-tight tabular-nums'>
                {state || count === undefined ? (
                  <BlockStateText variant='short' />
                ) : (
                  formatNumber(count)
                )}
              </span>
            }
          />
          <PageHeaderActions className='@2xl/page-header:flex-nowrap'>
            <InputGroup className='min-w-0 flex-1 @2xl/page-header:w-64 @2xl/page-header:flex-none'>
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                type='search'
                aria-label={`Search ${title.toLowerCase()}`}
                placeholder={`Search ${title.toLowerCase()}`}
                value={query}
                disabled={state !== undefined}
                onChange={(event) => {
                  setQuery(event.target.value)
                  onSearch(event.target.value)
                }}
              />
            </InputGroup>
            <Button onClick={onCreate}>
              <PlusIcon data-icon='inline-start' />
              New customer
            </Button>
          </PageHeaderActions>
        </PageHeaderRow>
      </PageHeader>
    </BlockStateProvider>
  )
}

export { PageHeader4, exampleProps as pageHeader4ExampleProps, type PageHeader4Props }
