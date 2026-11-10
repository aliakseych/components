import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "../index";

export default function Demo() {
  return (
    <BubbleGroup className="w-full max-w-md gap-3 rounded-xl border bg-card p-5">
      <Bubble variant="muted">
        <BubbleContent>Lunch at noon?</BubbleContent>
        <BubbleReactions align="start">👍 3</BubbleReactions>
      </Bubble>
      <Bubble align="end">
        <BubbleContent>Booked a table for four.</BubbleContent>
        <BubbleReactions>❤️ 2</BubbleReactions>
      </Bubble>
      <Bubble variant="muted">
        <BubbleReactions side="top" align="start">🎉</BubbleReactions>
        <BubbleContent>Reactions can sit on the top edge too.</BubbleContent>
      </Bubble>
    </BubbleGroup>
  );
}
