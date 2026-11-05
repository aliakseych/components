import { EmailPreview } from "@/components/dashboardblocks/email/email-preview";
import { Email7, email7ExampleProps } from "../index";

const email = <Email7 {...email7ExampleProps} />;

export default function Demo() {
  return (
    <div className="w-full max-w-2xl">
      <EmailPreview email={email} title="Email preview" />
    </div>
  );
}
