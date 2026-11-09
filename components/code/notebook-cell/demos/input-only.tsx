import { useState } from "react";
import { NotebookCell } from "../index";

export default function Demo() {
  const [code, setCode] = useState(`SELECT region, COUNT(*) AS orders
FROM orders
WHERE created_at >= '2026-01-01' -- year to date
GROUP BY region
ORDER BY orders DESC;`);

  return (
    <div className="w-full max-w-2xl bg-background p-4 text-foreground">
      <NotebookCell language="sql" code={code} editable onCodeChange={setCode} />
    </div>
  );
}
