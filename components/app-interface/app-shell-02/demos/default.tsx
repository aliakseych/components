import { AppShell2, appShell2ExampleProps } from "../index";

export default function Demo() {
  return (
    <div className="relative h-svh w-full overflow-hidden rounded-lg border [transform:translateZ(0)]">
      <AppShell2 {...appShell2ExampleProps} />
    </div>
  );
}
