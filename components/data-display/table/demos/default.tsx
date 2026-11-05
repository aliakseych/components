import {
  type ColumnDef,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "../index";

type Invoice = { id: string; customer: string; total: number };

const data: Invoice[] = [
  { id: "INV-104", customer: "Northwind", total: 1200 },
  { id: "INV-105", customer: "Acme", total: 860 },
  { id: "INV-106", customer: "Globex", total: 2410 },
];

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <TableColumnHeader column={column} title="Invoice" />,
  },
  {
    accessorKey: "customer",
    header: ({ column }) => <TableColumnHeader column={column} title="Customer" />,
  },
  {
    accessorKey: "total",
    header: ({ column }) => <TableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => `$${row.original.total.toLocaleString("en-US")}`,
  },
];

export default function Demo() {
  return (
    <div className="w-full max-w-2xl overflow-x-auto rounded-lg border">
      <TableProvider columns={columns} data={data}>
        <TableHeader>
          {({ headerGroup }) => (
            <TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
              {({ header }) => <TableHead header={header} key={header.id} />}
            </TableHeaderGroup>
          )}
        </TableHeader>
        <TableBody>
          {({ row }) => (
            <TableRow key={row.id} row={row}>
              {({ cell }) => <TableCell cell={cell} key={cell.id} />}
            </TableRow>
          )}
        </TableBody>
      </TableProvider>
    </div>
  );
}
