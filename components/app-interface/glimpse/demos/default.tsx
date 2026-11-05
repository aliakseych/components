import {
  Glimpse,
  GlimpseContent,
  GlimpseDescription,
  GlimpseImage,
  GlimpseTitle,
  GlimpseTrigger,
} from "../index";

// Stands in for a page's og:image, so its colors are data rather than theme tokens.
const ogImage = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="336"><rect width="640" height="336" fill="#18181b"/><text x="40" y="150" fill="#fafafa" font-family="sans-serif" font-size="44" font-weight="600">Release 4.2</text><text x="40" y="196" fill="#a1a1aa" font-family="sans-serif" font-size="22">Faster exports, new roles and audit logs</text><rect x="40" y="244" width="220" height="8" rx="4" fill="#3f3f46"/><rect x="40" y="244" width="150" height="8" rx="4" fill="#fafafa"/></svg>`
)}`;

const linkClass =
  "font-medium underline decoration-muted-foreground/50 underline-offset-4 hover:decoration-foreground";

export default function Demo() {
  return (
    <div className="flex min-h-96 w-full max-w-lg flex-col gap-1">
      <h2 className="font-semibold tracking-tight">Upgrade to 4.2</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Read the{" "}
        <Glimpse closeDelay={0} defaultOpen openDelay={0}>
          <GlimpseTrigger asChild>
            <a className={`${linkClass} text-foreground`} href="#release-notes">
              release notes
            </a>
          </GlimpseTrigger>
          <GlimpseContent align="start">
            <GlimpseImage alt="" src={ogImage} />
            <GlimpseTitle>Release notes for 4.2</GlimpseTitle>
            <GlimpseDescription>
              Exports run three times faster, and workspaces get custom roles and audit logs.
            </GlimpseDescription>
            <p className="mt-1 font-mono text-muted-foreground text-xs">docs.example.com/changelog</p>
          </GlimpseContent>
        </Glimpse>{" "}
        and the{" "}
        <Glimpse closeDelay={0} openDelay={0}>
          <GlimpseTrigger asChild>
            <a className={`${linkClass} text-foreground`} href="#migration">
              migration guide
            </a>
          </GlimpseTrigger>
          <GlimpseContent align="start">
            <GlimpseTitle>Migrating from 4.1</GlimpseTitle>
            <GlimpseDescription>
              One config change and a database migration. Most projects finish in ten minutes.
            </GlimpseDescription>
            <p className="mt-1 font-mono text-muted-foreground text-xs">docs.example.com/migrate</p>
          </GlimpseContent>
        </Glimpse>{" "}
        before upgrading.
      </p>
    </div>
  );
}
