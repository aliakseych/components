import { NoteOutline } from "../index";
import type { NoteBlock, NoteNotebook } from "../index";

const notebooks: NoteNotebook[] = [
  { name: "Product", documents: ["Roadmap Q3", "Onboarding notes", "Pricing review"] },
  { name: "Engineering", documents: ["Incident runbook", "API conventions"] },
];

const blocks: NoteBlock[] = [
  {
    type: "paragraph",
    text: "These conventions apply to every public endpoint. Breaking changes need a new version and a deprecation window.",
  },
  { type: "heading", level: 1, text: "Versioning" },
  {
    type: "paragraph",
    text: "Versions live in the path. Additive changes stay in the current version; removals wait for the next one.",
  },
  {
    type: "list",
    text: "",
    items: ["Keep old versions for at least six months", "Announce removals in the changelog"],
  },
  { type: "heading", level: 2, text: "Deprecation headers" },
  {
    type: "code",
    text: 'Deprecation: Sat, 01 Nov 2026 00:00:00 GMT\nSunset: Tue, 01 May 2027 00:00:00 GMT',
  },
  { type: "heading", level: 1, text: "Errors" },
  {
    type: "quote",
    text: "Clients should branch on the error code, never on the message text.",
  },
  { type: "heading", level: 2, text: "Error shape" },
  {
    type: "paragraph",
    text: "Every error returns a code, a message and a request ID so support can find the call.",
  },
  { type: "heading", level: 1, text: "Pagination" },
  {
    type: "paragraph",
    text: "Lists use cursors. Pass the cursor from the last page to get the next one.",
  },
];

export default function Demo() {
  return (
    <div className="min-h-screen w-full bg-background p-4 text-foreground sm:p-8">
      <NoteOutline
        notebooks={notebooks}
        selected={{ notebook: "Engineering", document: "API conventions" }}
        blocks={blocks}
      />
    </div>
  );
}
