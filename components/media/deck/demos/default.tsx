import { Deck, DeckCards, DeckEmpty, DeckItem, DeckShuffleButton } from "../index";

const cards = [
  { front: "Review the launch plan", back: "Due Friday. Owner: Sam." },
  { front: "Approve the new logo", back: "Two options are in Figma." },
  { front: "Confirm the budget", back: "Finance needs a reply by Monday." },
];

export default function Demo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Deck className="size-72">
        <DeckCards>
          {cards.map((card) => (
            <DeckItem
              back={<p className="p-6 text-center text-muted-foreground text-sm">{card.back}</p>}
              className="cursor-pointer"
              key={card.front}
            >
              <p className="p-6 text-center font-medium">{card.front}</p>
            </DeckItem>
          ))}
        </DeckCards>
        <DeckEmpty />
        <p className="sr-only">Click a card to flip it. Drag it sideways to dismiss it.</p>
        <div className="absolute inset-x-0 -bottom-12 flex justify-center">
          <DeckShuffleButton />
        </div>
      </Deck>
      <div className="h-8" />
    </div>
  );
}
