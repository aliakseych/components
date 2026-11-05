import type { ReactNode } from "react";
import {
  TreeExpander,
  TreeIcon,
  TreeLabel,
  TreeNode,
  TreeNodeContent,
  TreeNodeTrigger,
  TreeProvider,
  TreeView,
} from "../index";

function Row({ name, size, folder }: { name: string; size?: string; folder?: boolean }) {
  return (
    <TreeNodeTrigger>
      <TreeExpander hasChildren={folder} />
      <TreeIcon hasChildren={folder} />
      <TreeLabel>{name}</TreeLabel>
      {size && (
        <span className="ml-2 shrink-0 font-mono font-normal text-muted-foreground text-xs tabular-nums">
          {size}
        </span>
      )}
    </TreeNodeTrigger>
  );
}

function Folder({
  id,
  name,
  size,
  level,
  isLast,
  children,
}: {
  id: string;
  name: string;
  size: string;
  level?: number;
  isLast?: boolean;
  children: ReactNode;
}) {
  return (
    <TreeNode isLast={isLast} level={level} nodeId={id}>
      <Row folder name={name} size={size} />
      <TreeNodeContent hasChildren>{children}</TreeNodeContent>
    </TreeNode>
  );
}

function FileRow({
  id,
  name,
  size,
  level,
  isLast,
}: {
  id: string;
  name: string;
  size: string;
  level?: number;
  isLast?: boolean;
}) {
  return (
    <TreeNode isLast={isLast} level={level} nodeId={id}>
      <Row name={name} size={size} />
    </TreeNode>
  );
}

export default function Demo() {
  return (
    <TreeProvider
      className="flex w-full max-w-sm flex-col gap-3"
      defaultExpandedIds={["src", "ui", "hooks"]}
      selectedIds={["button"]}
    >
      <header className="flex flex-col gap-0.5">
        <h2 className="font-semibold tracking-tight">Project files</h2>
        <p className="text-muted-foreground text-sm">apps/web, 8 files, 62.4 KB</p>
      </header>
      <TreeView>
        <Folder id="src" name="src" size="48.1 KB">
          <Folder id="ui" level={1} name="ui" size="21.6 KB">
            <FileRow id="button" level={2} name="button.tsx" size="4.2 KB" />
            <FileRow id="dialog" level={2} name="dialog.tsx" size="9.8 KB" />
            <FileRow id="table" isLast level={2} name="table.tsx" size="7.6 KB" />
          </Folder>
          <Folder id="hooks" level={1} name="hooks" size="3.1 KB">
            <FileRow id="use-theme" isLast level={2} name="use-theme.ts" size="3.1 KB" />
          </Folder>
          <FileRow id="app" level={1} name="app.tsx" size="18.9 KB" />
          <FileRow id="main" isLast level={1} name="main.tsx" size="4.5 KB" />
        </Folder>
        <Folder id="public" name="public" size="12.8 KB">
          <FileRow id="logo" isLast level={1} name="logo.svg" size="12.8 KB" />
        </Folder>
        <FileRow id="readme" isLast name="README.md" size="1.5 KB" />
      </TreeView>
    </TreeProvider>
  );
}
