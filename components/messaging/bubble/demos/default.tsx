import { Bubble, BubbleContent, BubbleGroup, BubbleReactions } from "../index";

export default function Demo() {
  return (
    <BubbleGroup className="w-full max-w-xl">
      <Bubble><BubbleContent>Default</BubbleContent></Bubble>
      <Bubble variant="secondary"><BubbleContent>Secondary</BubbleContent></Bubble>
      <Bubble variant="tinted"><BubbleContent>Tinted</BubbleContent></Bubble>
      <Bubble variant="outline"><BubbleContent>Outline, with a reaction</BubbleContent><BubbleReactions>👍 2</BubbleReactions></Bubble>
      <Bubble variant="destructive"><BubbleContent>This message failed to send.</BubbleContent></Bubble>
    </BubbleGroup>
  );
}
