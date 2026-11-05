import { Pill } from "../index";

const filters = [
  "All",
  "Design",
  "Engineering",
  "Marketing",
  "Customer support",
  "Finance",
  "Operations",
  "Research",
  "Sales",
  "Legal",
];

export default function Demo() {
  return (
    <ul
      aria-label="Filter by team"
      className="-mx-4 flex w-[calc(100%+2rem)] snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      tabIndex={0}
    >
      {filters.map((filter) => (
        <li className="shrink-0 snap-start" key={filter}>
          <Pill>{filter}</Pill>
        </li>
      ))}
    </ul>
  );
}
