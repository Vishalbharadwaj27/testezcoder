import { useVSCode } from '@/store/vscodeStore';
import { cn } from '@/lib/utils';
import {
  FileText,
  Folder as FolderIcon,
  FolderOpen,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useState } from 'react';

interface File {
  name: string;
  path: string;
  type: 'file';
}

interface Folder {
  name: string;
  path: string;
  type: 'folder';
  children: Array<File | Folder>;
}

type FileTreeNodeProps = {
  node: File | Folder;
  level: number;
};

function FileTreeNode({ node, level }: FileTreeNodeProps) {
  const {
    activeFile,
    expandedPaths,
    togglePath,
    fetchFileContent,
    renameFile,
    deleteFile, // Get deleteFile from the store
  } = useVSCode();

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);

  const isExpanded = expandedPaths.includes(node.path);
  const isActive = activeFile?.path === node.path;

  const handleClick = () => {
    if (node.type === 'folder') {
      togglePath(node.path);
    } else {
      fetchFileContent(node.path);
    }
  };

  const handleRename = () => {
    if (newName.trim() && newName !== node.name) {
      renameFile(node.path, newName);
    }
    setIsRenaming(false);
  };

  const handleDelete = () => {
    deleteFile(node.path);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            'flex items-center py-1 px-2 cursor-pointer hover:bg-secondary/50',
            isActive && 'bg-secondary',
            'text-sm'
          )}
          style={{ paddingLeft: `${(level + 1) * 12}px` }}
          onClick={handleClick}
        >
          {node.type === 'folder' &&
            (isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            ))}
          {node.type === 'folder' ? (
            isExpanded ? (
              <FolderOpen size={16} />
            ) : (
              <FolderIcon size={16} />
            )
          ) : (
            <FileText size={16} />
          )}
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') setIsRenaming(false);
              }}
              className="ml-1 bg-transparent border border-primary rounded-sm px-1"
              autoFocus
              onClick={(e) => e.stopPropagation()} // Prevent click from propagating
            />
          ) : (
            <span className="ml-1">{node.name}</span>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => setIsRenaming(true)}>Rename</ContextMenuItem>
        <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function renderTree(nodes: Array<File | Folder>, level: number) {
  return nodes.map((node) => (
    <div key={node.path}>
      <FileTreeNode node={node} level={level} />
      {node.type === 'folder' &&
        useVSCode.getState().expandedPaths.includes(node.path) &&
        renderTree(node.children, level + 1)}
    </div>
  ));
}

export function FileTree() {
  const fileTree = useVSCode((state) => state.fileTree);
  return <div className="py-2">{renderTree(fileTree, 0)}</div>;
}