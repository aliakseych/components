import * as lucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

const ICONS = lucideIcons as unknown as Record<string, LucideIcon>

type IconPlaceholderProps = React.ComponentProps<LucideIcon> & {
  lucide: string
  tabler?: string
  hugeicons?: string
  phosphor?: string
  remixicon?: string
}

/** Renders the Lucide icon named by `lucide`; the other icon-set names are ignored. */
export function IconPlaceholder({
  lucide,
  tabler: _tabler,
  hugeicons: _hugeicons,
  phosphor: _phosphor,
  remixicon: _remixicon,
  ...props
}: IconPlaceholderProps) {
  const Icon = ICONS[lucide]
  return Icon ? <Icon {...props} /> : null
}
