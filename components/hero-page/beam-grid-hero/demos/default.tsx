import { BeamGridHero } from "../index";

export default function Demo() {
  return (
    <BeamGridHero
      className="-m-8 w-[calc(100%+4rem)]"
      eyebrow="Now in public beta"
      title="Ship infrastructure at the speed of thought"
      description="Provision, deploy and observe from one command line. Previews, rollbacks and logs without a single dashboard click."
      actions={[
        { label: "Start building", href: "#start" },
        { label: "Read the docs", href: "#docs", variant: "outline" },
      ]}
      install="npm i -g @acme/cli"
      command="acme deploy --env production"
      output={["Built 214 modules in 1.8s", "Deployed to 12 regions", "Live at https://app.acme.dev"]}
      beamCount={6}
    />
  );
}
