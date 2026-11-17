import { BellRing, Clock3, Plug } from "lucide-react";
import { PhoneListScreen, PhoneSplitFeature } from "../index";

export default function Demo() {
  return (
    <div className="w-full bg-background text-foreground">
      <PhoneSplitFeature
        title="All your tools, one view."
        description="Browse each linked app, when it last synced, and any issue that needs a look."
        bullets={[
          { icon: <Plug />, text: "Every linked app on one screen" },
          { icon: <Clock3 />, text: "Sync times visible instantly" },
          { icon: <BellRing />, text: "Alerts whenever a link drops" },
        ]}
        cta={{ label: "Book a call", href: "#book" }}
        phoneLabel="Connected systems list on a phone"
        phone={
          <PhoneListScreen
            heading="Connected systems"
            rows={[
              { title: "Fleet telematics", meta: "Updated 2 min ago" },
              { title: "Accounting", meta: "Updated 14 min ago" },
              { title: "Bank alerts", meta: "Reconnect needed", tone: "warn" },
              { title: "Team chat", meta: "Updated just now" },
              { title: "Fuel cards", meta: "Updated 1 h ago" },
            ]}
          />
        }
      />
    </div>
  );
}
