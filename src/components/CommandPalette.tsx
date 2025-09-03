import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useVSCode } from "@/store/vscodeStore";
import { FileText, FolderOpen, TerminalSquare, Sidebar, Save, Command as CommandIcon } from "lucide-react";

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    toggleCommandPalette,
    createNewFile,
    openFile,
    saveActiveFile,
    toggleSidebar,
    toggleTerminal,
    activeFile,
  } = useVSCode();

  const runCommand = (command: () => void | Promise<void>) => {
    command();
    toggleCommandPalette();
  };

  return (
    <CommandDialog open={isCommandPaletteOpen} onOpenChange={toggleCommandPalette}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="File">
          <CommandItem onSelect={() => runCommand(createNewFile)}>
            <FileText className="mr-2 h-4 w-4" />
            <span>New File</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(openFile)}>
            <FolderOpen className="mr-2 h-4 w-4" />
            <span>Open File...</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(saveActiveFile)} disabled={!activeFile}>
            <Save className="mr-2 h-4 w-4" />
            <span>Save</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="View">
          <CommandItem onSelect={() => runCommand(toggleTerminal)}>
            <TerminalSquare className="mr-2 h-4 w-4" />
            <span>Toggle Terminal</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(toggleSidebar)}>
            <Sidebar className="mr-2 h-4 w-4" />
            <span>Toggle Sidebar</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(toggleCommandPalette)}>
            <CommandIcon className="mr-2 h-4 w-4" />
            <span>Command Palette</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
