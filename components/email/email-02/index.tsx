import { email2ExampleProps as vendored } from "@/components/dashboardblocks/email/email-02";

export * from "@/components/dashboardblocks/email/email-02";

// An inline placeholder, so the example never depends on an external host.
const logo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Crect width='20' height='20' rx='4' fill='%230a0a0a'/%3E%3Cpath d='M5 11h2v4H5zM9 8h2v7H9zM13 5h2v10h-2z' fill='%23fff'/%3E%3C/svg%3E";

export const email2ExampleProps = { ...vendored, brand: { ...vendored.brand, logo } };
