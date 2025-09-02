import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { VSCodeSidebar } from './VSCodeSidebar';
import { VSCodeEditor } from './VSCodeEditor';
import { MenuBar } from './MenuBar';
import { WindowControls } from './WindowControls';

export function VSCodeSimulator() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background p-4 md:p-8">
      <div className="w-full max-w-7xl h-[80vh] border rounded-lg overflow-hidden shadow-2xl flex flex-col bg-muted/20">
        {/* Title Bar */}
        <div className="flex items-center justify-between h-8 bg-muted/40 border-b px-2">
          <MenuBar />
          <div className="flex-1 text-center text-sm text-muted-foreground">
            main.js - EZ-AI-Coder
          </div>
          <WindowControls />
        </div>

        {/* Main Content */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <VSCodeSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            <VSCodeEditor />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
