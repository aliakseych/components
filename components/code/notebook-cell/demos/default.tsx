import { NotebookCell } from "../index";

export default function Demo() {
  return (
    <div className="w-full max-w-2xl bg-background p-4 text-foreground">
      <NotebookCell
        language="python"
        executionCount={3}
        status="ok"
        durationMs={412}
        onRun={() => {}}
        code={`orders = load("orders")
by_region = orders.groupby("region").agg(
    count=("id", "count"),
    revenue=("total", "sum"),
)
by_region  # top regions first`}
        output={{
          type: "table",
          columns: ["Region", "Orders", "Revenue"],
          rows: [
            ["North", 1240, 182400],
            ["West", 1015, 149300],
            ["South", 860, 121950],
          ],
        }}
      />
    </div>
  );
}
