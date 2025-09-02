import { useVSCode } from '@/store/vscodeStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { memo } from 'react';
import { 
  Files, 
  Search, 
  GitBranch, 
  Bug, 
  Package
} from 'lucide-react';
import { FileTree } from './FileTree';

interface VSCodeSidebarProps {
  className?: string;
}

const VSCodeSidebarComponent = ({ className = '' }: VSCodeSidebarProps) => {
  const activeSidebarTab = useVSCode((state) => state.activeSidebarTab);
  const setSidebarTab = useVSCode((state) => state.setSidebarTab);

  const renderTabContent = () => {
    switch (activeSidebarTab) {
      case 'explorer':
        return <FileTree />;
      case 'search':
        return (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">Search functionality coming soon...</p>
          </div>
        );
      case 'git':
        return (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">Git functionality coming soon...</p>
          </div>
        );
      case 'debug':
        return (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">Debug functionality coming soon...</p>
          </div>
        );
      case 'extensions':
        return (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">Extensions functionality coming soon...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`border-r h-full flex flex-col ${className}`}>
      {/* Sidebar Icons */}
      <div className="flex flex-col items-center border-r w-12 bg-muted/50">
        <Button
          variant="ghost"
          size="icon"
          className={`w-12 h-12 rounded-none hover:bg-muted ${ activeSidebarTab === 'explorer' ? 'bg-muted' : ''}`}
          onClick={() => setSidebarTab('explorer')}
        >
          <Files size={24} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`w-12 h-12 rounded-none hover:bg-muted ${ activeSidebarTab === 'search' ? 'bg-muted' : ''}`}
          onClick={() => setSidebarTab('search')}
        >
          <Search size={24} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`w-12 h-12 rounded-none hover:bg-muted ${ activeSidebarTab === 'git' ? 'bg-muted' : ''}`}
          onClick={() => setSidebarTab('git')}
        >
          <GitBranch size={24} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`w-12 h-12 rounded-none hover:bg-muted ${ activeSidebarTab === 'debug' ? 'bg-muted' : ''}`}
          onClick={() => setSidebarTab('debug')}
        >
          <Bug size={24} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`w-12 h-12 rounded-none hover:bg-muted ${ activeSidebarTab === 'extensions' ? 'bg-muted' : ''}`}
          onClick={() => setSidebarTab('extensions')}
        >
          <Package size={24} />
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-64 overflow-hidden flex flex-col">
        {/* Section Title */}
        <div className="p-2 text-xs font-medium uppercase tracking-wide text-muted-foreground border-b">
          {activeSidebarTab}
        </div>

        {/* Section Content */}
        <ScrollArea className="flex-1">
          {renderTabContent()}
        </ScrollArea>
      </div>
    </div>
  );
}

export const VSCodeSidebar = memo(VSCodeSidebarComponent);