import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lightbulb, Copy, Scissors, FileText, Search } from 'lucide-react';

interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  onFixCode: () => void;
  onClose: () => void;
  disabled?: boolean;
}

export function ContextMenuComponent({ 
  visible, 
  x, 
  y, 
  onFixCode, 
  onClose, 
  disabled = false 
}: ContextMenuProps) {
  if (!visible) return null;

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Card
      className="context-menu fixed z-50 bg-background/95 backdrop-blur-sm border shadow-lg min-w-48"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="p-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={() => handleAction(onFixCode)}
          disabled={disabled}
        >
          <Lightbulb className="h-3 w-3" />
          Fix with EZ-coder AI
        </Button>
        
        <div className="my-1 border-t" />
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={() => handleAction(() => document.execCommand('copy'))}
        >
          <Copy className="h-3 w-3" />
          Copy
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={() => handleAction(() => document.execCommand('cut'))}
        >
          <Scissors className="h-3 w-3" />
          Cut
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={() => handleAction(() => document.execCommand('paste'))}
        >
          <FileText className="h-3 w-3" />
          Paste
        </Button>
        
        <div className="my-1 border-t" />
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={() => handleAction(() => console.log('Search in files...'))}
        >
          <Search className="h-3 w-3" />
          Search in Files
        </Button>
      </div>
    </Card>
  );
}