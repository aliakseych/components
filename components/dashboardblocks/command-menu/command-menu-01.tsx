'use client'

import { CreditCardIcon, DownloadIcon, LayoutDashboardIcon, PlusIcon, ShoppingCartIcon, UserPlusIcon, UsersIcon } from 'lucide-react'
import {
  CommandMenu,
  type CommandMenuGroup,
  CommandMenuTrigger,
  useCommandMenuShortcut,
} from '@/components/dashboardblocks/command-menu'
import { type ReactNode, useCallback, useState } from 'react'

interface CommandMenu1Props {
  /** Opens the menu with ⌘ or Ctrl and this key. */
  shortcutKey?: string
  onAction?: (id: string) => void
  onNavigate?: (href: string) => void
}

const exampleProps: CommandMenu1Props = { shortcutKey: '/' }

const pages: CommandMenuGroup = {
  heading: 'Pages',
  items: [
    {
      href: '/',
      icon: (
        <LayoutDashboardIcon />
      ),
      id: 'page-overview',
      keywords: ['home', 'dashboard'],
      label: 'Overview',
    },
    {
      href: '/orders',
      icon: (
        <ShoppingCartIcon />
      ),
      id: 'page-orders',
      keywords: ['sales', 'purchases'],
      label: 'Orders',
    },
    {
      href: '/customers',
      icon: (
        <UsersIcon />
      ),
      id: 'page-customers',
      keywords: ['people', 'contacts'],
      label: 'Customers',
    },
    {
      href: '/settings/billing',
      icon: (
        <CreditCardIcon />
      ),
      id: 'page-billing',
      keywords: ['invoices', 'plan', 'payment'],
      label: 'Billing',
    },
  ],
}

const actions: { icon: ReactNode; id: string; label: string; shortcut?: string }[] = [
  {
    icon: (
      <PlusIcon />
    ),
    id: 'new-order',
    label: 'Create order',
    shortcut: '⌘N',
  },
  {
    icon: (
      <UserPlusIcon />
    ),
    id: 'invite',
    label: 'Invite a teammate',
  },
  {
    icon: (
      <DownloadIcon />
    ),
    id: 'export-customers',
    label: 'Export customers',
  },
]

const CommandMenu1 = (props: CommandMenu1Props) => {
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const {
    onAction = (id: string) =>
      setLastCommand(actions.find((action) => action.id === id)?.label ?? id),
    onNavigate = (href: string) => setLastCommand(`Go to ${href}`),
    shortcutKey = 'k',
  } = props
  const [open, setOpen] = useState(false)
  const openMenu = useCallback(() => setOpen(true), [])
  useCommandMenuShortcut(openMenu, shortcutKey)

  const groups: CommandMenuGroup[] = [
    pages,
    {
      heading: 'Actions',
      items: actions.map((action) => ({
        ...action,
        onSelect: () => onAction(action.id),
      })),
    },
  ]

  return (
    <section className='@container flex flex-col items-center gap-3'>
      <CommandMenuTrigger
        onClick={openMenu}
        placeholder='Search or run a command'
        shortcut={`⌘${shortcutKey.toUpperCase()}`}
      />
      <p role='status' className='text-muted-foreground min-h-5 text-sm'>
        {lastCommand && `Last command: ${lastCommand}.`}
      </p>
      <CommandMenu
        open={open}
        onOpenChange={setOpen}
        groups={groups}
        onNavigate={onNavigate}
        placeholder='Search pages and actions'
      />
    </section>
  )
}

export { CommandMenu1, exampleProps as commandMenu1ExampleProps, type CommandMenu1Props }
