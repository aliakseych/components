import { CalendarCheck, Mail, SquareTerminal, UserRoundPlus } from "lucide-react";
import { ToolTimeline, type ToolTimelineItem } from "../index";

const items: ToolTimelineItem[] = [
  {
    id: "mail",
    icon: <Mail />,
    title: "Sent email to the team",
    tool: "Mail",
    status: "done",
    args: 'to: "team@example.com", subject: "Launch moved to Tuesday"',
    result: "Delivered to 6 recipients",
  },
  {
    id: "calendar",
    icon: <CalendarCheck />,
    title: "Created meeting for tomorrow at 2 PM",
    tool: "Calendar",
    status: "done",
    args: 'title: "Launch review", attendees: 6',
    result: "Invites sent",
  },
  {
    id: "executor",
    icon: <SquareTerminal />,
    title: "Ran code analysis",
    tool: "Executor",
    status: "error",
    args: "path: ./src",
    result: "Timed out after 30s",
  },
  {
    id: "handoff",
    icon: <UserRoundPlus />,
    title: "Handing off to scheduling assistant",
    tool: "Handoff",
    status: "running",
  },
];

export default function Demo() {
  return (
    <div className="flex w-full max-w-md px-3 py-2">
      <ToolTimeline items={items} />
    </div>
  );
}
