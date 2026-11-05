import { AppShell3, appShell3ExampleProps } from "../index";

export default function Demo() {
  return (
    <div className="relative h-svh w-full overflow-hidden rounded-lg border [transform:translateZ(0)]">
      <AppShell3 {...appShell3ExampleProps} />
    </div>
  );
}
