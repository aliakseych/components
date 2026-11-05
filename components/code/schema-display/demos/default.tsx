import { SchemaDisplay } from "../index";

export default function Demo() {
  return (
    <SchemaDisplay
      className="w-full max-w-xl"
      description="Returns one invoice."
      method="GET"
      parameters={[{ name: "id", type: "string", required: true, location: "path", description: "Invoice ID" }]}
      path="/invoices/{id}"
      responseBody={[{ name: "id", type: "string", required: true }, { name: "total", type: "number" }]}
    />
  );
}
