import * as React from 'react';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from '@/components/ui/menubar';
import { useVSCode } from '../store/vscodeStore';

export function MenuBar() {
  const {
    activeFile,
    updateFileContent,
    sidebarVisible,
    setSidebarVisible,
  } = useVSCode();

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleCut = () => {
    if (!activeFile) return;
    const selection = window.getSelection()?.toString();
    if (selection) {
      navigator.clipboard.writeText(selection);
      const newContent = activeFile.content.replace(selection, '');
      updateFileContent(activeFile.path, newContent);
    }
  };

  const handleCopy = () => {
    const selection = window.getSelection()?.toString();
    if (selection) {
      navigator.clipboard.writeText(selection);
    }
  };

  const handlePaste = async () => {
    if (!activeFile) return;
    try {
      const text = await navigator.clipboard.readText();
      const selection = window.getSelection();
      if (selection?.rangeCount) {
        const range = selection.getRangeAt(0);
        const start = activeFile.content.substring(0, range.startOffset);
        const end = activeFile.content.substring(range.endOffset);
        updateFileContent(activeFile.path, start + text + end);
      }
    } catch (error) {
      console.error('Failed to paste:', error);
    }
  };

  return (
    <Menubar className="border-none px-2 bg-transparent">
      <MenubarMenu>
        <MenubarTrigger className="text-sm">File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New File... <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            Open... <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            Save <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="text-sm">Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={handleCut}>
            Cut <MenubarShortcut>⌘X</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={handleCopy}>
            Copy <MenubarShortcut>⌘C</MenubarShortcut>
          </MenubarItem>
          <MenubarItem onClick={handlePaste}>
            Paste <MenubarShortcut>⌘V</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="text-sm">View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Command Palette... <MenubarShortcut>⌘⇧P</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={toggleSidebar}>
            Toggle Sidebar <MenubarShortcut>⌘B</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
