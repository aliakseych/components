import { LogoCloud } from "../index";
import { placeholderLogos } from "../placeholders";

export default function Demo() {
  return (
    <LogoCloud
      eyebrow="Customers"
      heading="Companies we work with."
      description="Product, data and operations teams use the platform every day."
      logos={placeholderLogos}
      columns={4}
    />
  );
}
