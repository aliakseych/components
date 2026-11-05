import { EmailPreview } from "@/components/dashboardblocks/email/email-preview";
import { Email5, email5ExampleProps } from "../index";

const email = <Email5 {...email5ExampleProps} />;

export default function Demo() {
  return (
    <div className="w-full max-w-2xl">
      <EmailPreview email={email} title="Email preview" />
    </div>
  );
}
