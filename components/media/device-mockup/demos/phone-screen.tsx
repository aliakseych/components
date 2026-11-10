import { DeviceMockup } from "../index";

export default function Demo() {
  return (
    <div className="mx-auto w-full max-w-3xl p-4">
      <DeviceMockup
        defaultDevice="phone"
        controls={false}
        screens={{
          phone: (
            <div className="flex size-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-primary/30 to-background text-foreground">
              <p className="text-3xl font-semibold">Hello</p>
              <p className="text-sm text-muted-foreground">Any React node renders on the glass.</p>
            </div>
          ),
        }}
      />
    </div>
  );
}
