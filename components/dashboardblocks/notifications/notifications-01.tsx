'use client'

import { CheckCheckIcon, CircleCheckIcon, MessageSquareIcon, TriangleAlertIcon, UserPlusIcon } from 'lucide-react'
import {
  BlockReady,
  BlockStateProvider,
  BlockStateRows,
  type BlockStateProps,
  getBlockState,
} from '@/components/dashboardblocks/block-state'
import { Link } from '@/components/dashboardblocks/link'
import {
  type AppNotification,
  NotificationBell,
  NotificationItem,
  NotificationList,
  NotificationsHeader,
} from '@/components/dashboardblocks/notifications'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Notifications1Props extends BlockStateProps {
  /** Leave out, or pass none, to show the empty state. */
  notifications?: AppNotification[]
  /** Pass a fixed date, so times render the same on the server and in the browser. */
  now: Date
  title: string
  viewAllHref: string
}

const exampleNow = new Date(Date.UTC(2026, 8, 26, 12))
const minutesAgo = (minutes: number) => new Date(exampleNow.getTime() - minutes * 60_000)

const exampleProps: Notifications1Props = {
  notifications: [
    {
      at: minutesAgo(4),
      body: '“Can we ship the new pricing page before Friday?”',
      icon: (
        <MessageSquareIcon />
      ),
      id: '1',
      read: false,
      title: (
        <>
          <span className='font-medium'>Priya Nair</span> mentioned you in Pricing v3
        </>
      ),
      tone: 'info',
    },
    {
      at: minutesAgo(42),
      icon: (
        <TriangleAlertIcon />
      ),
      id: '2',
      read: false,
      title: 'Checkout error rate passed 2% in eu-central-1',
      tone: 'warning',
    },
    {
      at: minutesAgo(180),
      icon: (
        <CircleCheckIcon />
      ),
      id: '3',
      read: false,
      title: 'Your export of 2,481 customers is ready',
      tone: 'success',
    },
    {
      at: minutesAgo(1_500),
      icon: (
        <UserPlusIcon />
      ),
      id: '4',
      read: true,
      title: (
        <>
          <span className='font-medium'>Mateo Silva</span> joined your workspace
        </>
      ),
    },
  ],
  now: exampleNow,
  title: 'Dashboard',
  viewAllHref: '#',
}

const Notifications1 = (props: Notifications1Props) => {
  const {
    notifications: loaded = [],
    now,
    errorMessage,
    status,
    title,
    viewAllHref,
  } = props
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(() => new Set())
  const state = getBlockState(status, loaded)
  const notifications = loaded.map((notification) =>
    readIds.has(notification.id) ? { ...notification, read: true } : notification,
  )
  const unread = state
    ? 0
    : notifications.filter((notification) => !notification.read).length

  function markRead(ids: string[]) {
    setReadIds((current) => new Set([...current, ...ids]))
  }

  return (
    <BlockStateProvider errorMessage={errorMessage} state={state}>
      <Card>
        <CardContent>
          <section className='@container flex items-center justify-between gap-3'>
            <h2 className='font-semibold tracking-tight'>{title}</h2>
            <NotificationBell unreadCount={unread}>
              <NotificationsHeader
                description={
                  <BlockReady>
                    {unread > 0 ? `${unread} unread.` : 'You’re all caught up.'}
                  </BlockReady>
                }
                action={
                  unread > 0 && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() =>
                        markRead(notifications.map((notification) => notification.id))
                      }
                    >
                      <CheckCheckIcon data-icon='inline-start' />
                      Mark all as read
                    </Button>
                  )
                }
              />
              {state && (
                <div className='border-y px-4'>
                  <BlockStateRows rows={4} />
                </div>
              )}
              {!state && (
                <NotificationList className='max-h-96 overflow-y-auto border-y'>
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      now={now}
                      onOpen={() => markRead([notification.id])}
                    />
                  ))}
                </NotificationList>
              )}
              <Link
                href={viewAllHref}
                className='hover:bg-muted/50 focus-visible:bg-muted/50 rounded-b-[inherit] px-4 py-2.5 text-center text-sm font-medium outline-none'
              >
                View all notifications
              </Link>
            </NotificationBell>
          </section>
        </CardContent>
      </Card>
    </BlockStateProvider>
  )
}

export {
  Notifications1,
  exampleProps as notifications1ExampleProps,
  type Notifications1Props,
}
