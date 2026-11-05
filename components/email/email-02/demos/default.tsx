import { EmailPreview } from "@/components/dashboardblocks/email/email-preview";
import { Email2, email2ExampleProps } from "../index";

const email = <Email2 {...email2ExampleProps} />;

export default function Demo() {
  return (
    <div className="w-full max-w-2xl">
      <EmailPreview email={email} title="Email preview" />
    </div>
  );
}
