# Engineering Status

A public status page. It renders a regions banner (worst status wins), per-service 90-day uptime strips, active incidents with response timelines, and the last N days of incident history with quiet days collapsed into one line. All times are UTC.

Ported from the Vibra block `@vibra/engineering-status`. The Vibra ui parts it used are inlined, the database reads are replaced by props, and Vibra tokens are mapped to library tokens.

## Props

- `brand` `{ name, initial, caption? }`: header lockup.
- `services` `StatusService[]`: `id`, `name`, `region`, `status`, `days` (oldest first), optional `uptime`.
- `incidents` `StatusIncident[]`: open ones (any status but `resolved`) show under Active; resolved ones fill History.
- `now`: the page's "now" (Date or ISO string).
- `title`, `historyDays` (14), `className`.
- `colors`: `success`, `warning`, `danger`, `info`, `brand`, `brandForeground` (CSS vars `--engineering-status-*`, defaulting to theme tokens).

## Notes

- Self-contained apart from `lucide-react`. The live pulse stops under `prefers-reduced-motion`.
- Renders a full page (header, main, footer); the page background belongs to the wrapper.
