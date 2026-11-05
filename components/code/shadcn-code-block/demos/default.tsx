import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockHeader, CodeBlockTitle } from "../index";

const code = "pnpm add motion";

export default function Demo() {
  return (
    <CodeBlock className="w-full max-w-xl">
      <CodeBlockHeader>
        <CodeBlockTitle>install.sh</CodeBlockTitle>
        <CodeBlockActions><CodeBlockCopyButton value={code} /></CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent><code>{code}</code></CodeBlockContent>
    </CodeBlock>
  );
}
