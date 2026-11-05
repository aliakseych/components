import { LatticeLoader } from "../index";

const colors = {
  color: "var(--chart-2)",
  doneColor: "var(--chart-4)",
  errorColor: "var(--destructive)",
} as const;

export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-4">
      <LatticeLoader {...colors} label="Searching" elapsed={1.2} />
      <LatticeLoader {...colors} status="done" doneLabel="Found in" elapsed={2.4} />
      <LatticeLoader {...colors} status="error" errorLabel="Failed after" elapsed={3.1} />
    </div>
  );
}
