import type { Provenance } from '@/components/dashboardblocks/kpi-provenance'
import { formatDateRange } from '@/lib/dashboardblocks/format'

function formatProvenanceWindow(window: Provenance['window'], timeZone = 'UTC') {
  if (!window) return 'All time'
  return formatDateRange({ end: window.to, start: window.from }, { timeZone, year: true })
}

function formatProvenanceFilters(filters: Provenance['filters']) {
  return Object.entries(filters).map(([name, value]) => `${name}: ${value}`)
}

export { formatProvenanceFilters, formatProvenanceWindow }
