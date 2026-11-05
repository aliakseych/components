import {
  Snippet,
  SnippetCopyButton,
  SnippetHeader,
  SnippetTabsContent,
  SnippetTabsList,
  SnippetTabsTrigger,
} from "../index";

const commands = {
  pnpm: "pnpm add motion",
  npm: "npm install motion",
  bun: "bun add motion",
};

export default function Demo() {
  return (
    <Snippet className="w-full max-w-md" defaultValue="pnpm">
      <SnippetHeader>
        <SnippetTabsList>
          {Object.keys(commands).map((name) => (
            <SnippetTabsTrigger key={name} value={name}>
              {name}
            </SnippetTabsTrigger>
          ))}
        </SnippetTabsList>
        <SnippetCopyButton value={commands.pnpm} />
      </SnippetHeader>
      {Object.entries(commands).map(([name, command]) => (
        <SnippetTabsContent key={name} value={name}>
          {command}
        </SnippetTabsContent>
      ))}
    </Snippet>
  );
}
