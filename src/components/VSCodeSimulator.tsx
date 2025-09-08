import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { VSCodeSidebar } from './VSCodeSidebar';
import VSCodeEditor from './VSCodeEditor';
import { MenuBar } from './MenuBar';
import { WindowControls } from './WindowControls';
import { useVSCode } from '../store/vscodeStore';
import { CommandPalette } from './CommandPalette';
import Terminal from './Terminal';
import { useTheme } from '../store/theme';
import { useEffect } from 'react';

// Simple Terminal Panel component
function TerminalPanel() {
  return <Terminal />;
}

export function VSCodeSimulator() {
  const { isTerminalOpen, activeFile } = useVSCode();
  const { theme } = useTheme();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-background p-4 md:p-8">
      <CommandPalette />
      <div className="w-full max-w-7xl h-[80vh] border rounded-lg overflow-hidden shadow-2xl flex flex-col bg-card">
        {/* Title Bar */}
        <div className="flex items-center justify-between h-8 bg-muted/40 border-b px-2">
          <MenuBar />
          <div className="flex-1 text-center text-sm text-muted-foreground">
            {activeFile ? `${activeFile.name} - EZ-AI-Coder` : 'EZ-AI-Coder'}
          </div>
          <WindowControls />
        </div>

        {/* Main Content */}
        <ResizablePanelGroup direction="vertical" className="flex-1">
          <ResizablePanel defaultSize={isTerminalOpen ? 80 : 100}>
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <VSCodeSidebar />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={80}>
                <VSCodeEditor />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          {isTerminalOpen && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={20}>
                <TerminalPanel />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}