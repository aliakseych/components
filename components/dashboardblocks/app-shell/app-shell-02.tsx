'use client'

import { BellIcon, ChartBarIcon, CircleHelpIcon, CircleUserRoundIcon, CommandIcon, FolderIcon, HomeIcon, InboxIcon, PlusIcon, Settings2Icon, UsersIcon } from 'lucide-react'
import {
  AppBrand,
  AppBreadcrumbs,
  AppHeader,
  AppNav,
  type AppUser,
  type Crumb,
  type NavSection,
  SearchButton,
  SidebarUserMenu,
  type UserMenuLink,
} from '@/components/dashboardblocks/app-shell'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import { cn } from '@/lib/utils'

interface AppShell2Props {
  breadcrumbs: Crumb[]
  children?: ReactNode
  defaultCollapsed?: boolean
  onCreate?: () => void
  onSearch?: () => void
  onSignOut?: () => void
  pathname: string
  secondarySections: NavSection[]
  sections: NavSection[]
  user: AppUser
  userLinks: UserMenuLink[]
}

const exampleProps: AppShell2Props = {
  breadcrumbs: [{ href: '#', label: 'Reports' }, { label: 'Usage' }],
  pathname: '/reports/usage',
  secondarySections: [
    {
      items: [
        {
          href: '/help',
          icon: (
            <CircleHelpIcon />
          ),
          title: 'Help',
        },
        {
          href: '/settings',
          icon: (
            <Settings2Icon />
          ),
          title: 'Settings',
        },
      ],
    },
  ],
  sections: [
    {
      items: [
        {
          href: '/',
          icon: (
            <HomeIcon />
          ),
          title: 'Home',
        },
        {
          badge: 4,
          href: '/inbox',
          icon: (
            <InboxIcon />
          ),
          title: 'Inbox',
        },
        {
          icon: (
            <FolderIcon />
          ),
          items: [
            { href: '/projects', title: 'All projects' },
            { badge: 3, href: '/projects/active', title: 'Active' },
            { href: '/projects/archived', title: 'Archived' },
          ],
          title: 'Projects',
        },
        {
          icon: (
            <ChartBarIcon />
          ),
          items: [
            { href: '/reports/revenue', title: 'Revenue' },
            { href: '/reports/usage', title: 'Usage' },
            { href: '/reports/exports', title: 'Exports' },
          ],
          title: 'Reports',
        },
        {
          href: '/team',
          icon: (
            <UsersIcon />
          ),
          title: 'Team',
        },
      ],
    },
  ],
  user: {
    avatar: '/images/avatar-01.webp',
    email: 'lena@northwind.io',
    name: 'Lena Fischer',
  },
  userLinks: [
    {
      href: '/account',
      icon: (
        <CircleUserRoundIcon />
      ),
      label: 'Account',
    },
    {
      href: '/account/notifications',
      icon: (
        <BellIcon />
      ),
      label: 'Notifications',
    },
  ],
}

const AppShell2 = (props: AppShell2Props) => {
  const {
    breadcrumbs,
    children,
    defaultCollapsed = false,
    onCreate = () => {},
    onSearch = () => {},
    onSignOut = () => {},
    pathname,
    secondarySections,
    sections,
    user,
    userLinks,
  } = props

  return (
    <SidebarProvider defaultOpen={!defaultCollapsed}>
      <Sidebar collapsible='icon'>
        <SidebarHeader>
          <AppBrand
            description='Analytics'
            href='/'
            logo={
              <CommandIcon />
            }
            name='Northwind'
          />
        </SidebarHeader>
        <SidebarContent>
          <AppNav pathname={pathname} sections={sections} />
          <AppNav className='mt-auto' pathname={pathname} sections={secondarySections} />
        </SidebarContent>
        <SidebarFooter>
          <SidebarUserMenu links={userLinks} onSignOut={onSignOut} user={user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className='@container/inset min-w-0'>
        <AppHeader>
          <SidebarTrigger className='-ml-1' />
          <Separator
            orientation='vertical'
            className='mr-2 data-vertical:h-4 data-vertical:self-auto'
          />
          <AppBreadcrumbs items={breadcrumbs} />
          <div className='ml-auto flex items-center gap-2'>
            <SearchButton onOpen={onSearch} />
            <Button onClick={onCreate}>
              <PlusIcon data-icon='inline-start' />
              <span className='@max-xl/inset:sr-only'>New report</span>
            </Button>
          </div>
        </AppHeader>
        <div className='flex flex-1 flex-col gap-4 p-4 md:p-6'>
          {children ?? <PagePlaceholder />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

const PLACEHOLDER_STATS = ['w-20', 'w-24', 'w-16', 'w-20']
const PLACEHOLDER_BARS = [
  34, 41, 38, 47, 44, 52, 49, 58, 55, 61, 57, 66, 63, 70, 67, 74, 71, 79, 76, 83, 80, 88,
  85, 92,
]

function PagePlaceholder() {
  return (
    <div className='flex flex-1 flex-col gap-8'>
      <div className='flex flex-col gap-2'>
        <div className='bg-muted h-7 w-40 rounded-md' />
        <div className='bg-muted/60 h-4 w-80 max-w-full rounded-md' />
      </div>
      <div className='grid grid-cols-2 gap-6 @3xl/inset:grid-cols-4'>
        {PLACEHOLDER_STATS.map((width, index) => (
          <div key={index} className='flex flex-col gap-3 border-t pt-3'>
            <div className={cn('bg-muted/60 h-3.5 rounded-sm', width)} />
            <div className='bg-muted h-9 w-28 rounded-md' />
          </div>
        ))}
      </div>
      <div className='flex h-64 items-end gap-1 border-t pt-6 sm:gap-2'>
        {PLACEHOLDER_BARS.map((height, index) => (
          <div
            key={index}
            className='bg-muted flex-1 rounded-t-sm'
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export { AppShell2, exampleProps as appShell2ExampleProps, type AppShell2Props }
