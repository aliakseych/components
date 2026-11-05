import { EmailPreview } from "@/components/dashboardblocks/email/email-preview";
import { Email4, email4ExampleProps } from "../index";

const email = <Email4 {...email4ExampleProps} />;

export default function Demo() {
  return (
    <div className="w-full max-w-2xl">
      <EmailPreview email={email} title="Email preview" />
    </div>
  );
}
