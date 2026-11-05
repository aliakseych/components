import { EmailPreview } from "@/components/dashboardblocks/email/email-preview";
import { Email6, email6ExampleProps } from "../index";

const email = <Email6 {...email6ExampleProps} />;

export default function Demo() {
  return (
    <div className="w-full max-w-2xl">
      <EmailPreview email={email} title="Email preview" />
    </div>
  );
}
