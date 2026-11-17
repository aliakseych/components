import { CheckCircle2, History, Link2 } from "lucide-react";
import { PhoneListScreen, PhoneSplitFeature } from "../index";

export default function Demo() {
  return (
    <div className="w-full bg-background text-foreground">
      <PhoneSplitFeature
        reversed
        phonePosition="bottom"
        title="Nothing happens without you."
        description={
          <>
            Review each finding, trace where it came from, <br className="hidden min-[1200px]:inline" />
            and sign off on what follows.
          </>
        }
        bullets={[
          { icon: <Link2 />, text: "Trace every finding" },
          { icon: <CheckCircle2 />, text: "Sign off first" },
          { icon: <History />, text: "Review the outcome" },
        ]}
        cta={{ label: "Book a call", href: "#book" }}
        phoneLabel="Approval request on a phone"
        phone={
          <PhoneListScreen
            heading="Needs your approval"
            anchor="bottom"
            rows={[
              { title: "Invoice 4821 differs from the order", meta: "Two records disagree", tone: "bad" },
              { title: "Reschedule Friday pickup", meta: "Source: dispatch notes", tone: "warn" },
              { title: "Send reminder to vendor", meta: "Approved · sent 9:12", tone: "ok" },
            ]}
          />
        }
      />
    </div>
  );
}
