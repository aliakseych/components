import { LogoCloud } from "../index";
import { placeholderLogos } from "../placeholders";

export default function Demo() {
  return (
    <LogoCloud
      heading="Trusted partners."
      logos={placeholderLogos.slice(0, 6)}
      columns={3}
      cellColor="color-mix(in oklab, var(--chart-2) 12%, transparent)"
    />
  );
}
