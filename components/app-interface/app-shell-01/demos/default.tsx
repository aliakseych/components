import { AppShell1, appShell1ExampleProps } from "../index";

export default function Demo() {
  return (
    <div className="relative h-svh w-full overflow-hidden rounded-lg border [transform:translateZ(0)]">
      <AppShell1 {...appShell1ExampleProps} />
    </div>
  );
}
