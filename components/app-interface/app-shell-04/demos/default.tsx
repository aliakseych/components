import { AppShell4, appShell4ExampleProps } from "../index";

export default function Demo() {
  return (
    <div className="relative h-svh w-full overflow-hidden rounded-lg border [transform:translateZ(0)]">
      <AppShell4 {...appShell4ExampleProps} />
    </div>
  );
}
