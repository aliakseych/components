import { BeamGridHero } from "../index";

export default function Demo() {
  return (
    <BeamGridHero
      className="-m-8 w-[calc(100%+4rem)]"
      title="Queues that never lose a message"
      description="Durable, ordered and observable by default."
      actions={[{ label: "Get started", href: "#start" }]}
      command="acme queue create orders"
      output={["Queue orders created", "Replicated across 3 zones"]}
      beamCount={2}
    />
  );
}
