import { CrmTable } from "../index";

export default function Demo() {
  return (
    <CrmTable
      stages={[
        { id: "new", label: "New", tone: "chart-1" },
        { id: "won", label: "Won", tone: "chart-4" },
      ]}
      deals={[]}
    />
  );
}
