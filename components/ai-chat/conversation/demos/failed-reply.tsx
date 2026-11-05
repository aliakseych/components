import { Card } from "@/components/ui/card";
import { Conversation } from "../index";

const turns = [
  { id: "1", role: "user" as const, content: "Summarize last quarter.", footer: "09:12" },
  {
    id: "2",
    role: "assistant" as const,
    content: "The reply couldn't be generated. Nothing was saved.",
    error: true,
  },
];

export default function Demo() {
  return (
    <Card className="w-full max-w-2xl gap-0 py-0">
      <Conversation className="p-4" onRegenerate={() => {}} turns={turns} />
    </Card>
  );
}
