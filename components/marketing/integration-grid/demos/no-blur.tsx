import { IntegrationGrid } from "../index";
import { sampleItems } from "../sample-items";

export default function NoBlur() {
  return (
    <IntegrationGrid
      title="Connect the tools you already use."
      items={sampleItems}
      blurBottom={false}
    />
  );
}
