import { CheckCheckIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageGroup, MessageHeader } from "../index";

export default function Demo() {
  return (
    <div className="w-full max-w-xl rounded-xl border bg-card shadow-xs">
      <header className="flex flex-col gap-0.5 border-b px-5 py-4">
        <h2 className="font-semibold tracking-tight">Ana Kim</h2>
        <p className="text-sm text-muted-foreground">Finance, last active 2 min. ago</p>
      </header>
      <MessageGroup className="p-5">
        <Message>
          <MessageAvatar><Avatar><AvatarFallback>AK</AvatarFallback></Avatar></MessageAvatar>
          <MessageContent>
            <MessageHeader>
              <span className="font-medium text-foreground">Ana Kim</span>
              <span>10:38</span>
            </MessageHeader>
            <Bubble variant="muted"><BubbleContent>Is the Q3 revenue report ready for the board pack?</BubbleContent></Bubble>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageContent>
            <Bubble><BubbleContent>Yes, sending it now. MRR closed at $184,320, up 4.2%.</BubbleContent></Bubble>
            <MessageFooter>
              <CheckCheckIcon aria-hidden="true" className="size-3.5" />
              Read 10:42
            </MessageFooter>
          </MessageContent>
        </Message>
      </MessageGroup>
    </div>
  );
}
