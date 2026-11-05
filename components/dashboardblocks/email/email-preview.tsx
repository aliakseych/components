'use client'

import { renderEmail } from '@/components/dashboardblocks/email'
import { type ReactElement, useEffect, useState } from 'react'

/** Shows an email inside a page. An email is a whole HTML document, so it needs its own iframe. */
function EmailPreview({ email, title }: { email: ReactElement; title: string }) {
  const [html, setHtml] = useState<string>()
  const [height, setHeight] = useState(480)

  useEffect(() => {
    let current = true
    void renderEmail(email).then((rendered) => {
      if (current) setHtml(rendered.html)
    })
    return () => {
      current = false
    }
  }, [email])

  return (
    <iframe
      className='w-full rounded-xl border bg-white'
      onLoad={(event) => {
        const body = event.currentTarget.contentDocument?.documentElement
        if (body) setHeight(body.scrollHeight)
      }}
      srcDoc={html}
      style={{ height }}
      title={title}
    />
  )
}

export { EmailPreview }
