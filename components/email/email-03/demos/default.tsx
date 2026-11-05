import { EmailPreview } from "@/components/dashboardblocks/email/email-preview";
import { Email3, email3ExampleProps } from "../index";

const email = <Email3 {...email3ExampleProps} />;

export default function Demo() {
  return (
    <div className="w-full max-w-2xl">
      <EmailPreview email={email} title="Email preview" />
    </div>
  );
}
