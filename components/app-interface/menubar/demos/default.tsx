import { CopyIcon, DownloadIcon, FilePlusIcon, RedoIcon, Trash2Icon, UndoIcon } from "lucide-react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "../index";

export function ReportMenubar({ defaultValue }: { defaultValue?: string }) {
  return (
    <Menubar defaultValue={defaultValue}>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem><FilePlusIcon /> New report <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
          <MenubarItem><CopyIcon /> Duplicate <MenubarShortcut>⌘D</MenubarShortcut></MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger><DownloadIcon className="mr-2 size-4 text-muted-foreground" /> Export</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>CSV</MenubarItem>
              <MenubarItem>PDF</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem variant="destructive"><Trash2Icon /> Delete</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem><UndoIcon /> Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
          <MenubarItem disabled><RedoIcon /> Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem defaultChecked>Show gridlines</MenubarCheckboxItem>
          <MenubarCheckboxItem>Show legend</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel>Date range</MenubarLabel>
          <MenubarRadioGroup defaultValue="30">
            <MenubarRadioItem value="7">Last 7 days</MenubarRadioItem>
            <MenubarRadioItem value="30">Last 30 days</MenubarRadioItem>
            <MenubarRadioItem value="90">Last 90 days</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

export default function Demo() {
  return <ReportMenubar />;
}
