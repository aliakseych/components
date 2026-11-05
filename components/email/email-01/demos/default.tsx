import { EmailPreview } from "@/components/dashboardblocks/email/email-preview";
import { Email1, email1ExampleProps } from "../index";

const email = <Email1 {...email1ExampleProps} />;

export default function Demo() {
  return (
    <div className="w-full max-w-2xl">
      <EmailPreview email={email} title="Email preview" />
    </div>
  );
}
