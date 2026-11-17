import { IntegrationGrid } from "../index";
import { sampleItems } from "../sample-items";

export default function Default() {
  return (
    <IntegrationGrid
      title={<>Your assistant works with the tools<br className="max-[800px]:hidden" /> you already use.</>}
      items={sampleItems}
    />
  );
}
