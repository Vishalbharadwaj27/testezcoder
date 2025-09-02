import { useVSCode } from '@/store/vscodeStore';
import { cn } from '@/lib/utils';
import {
  FileText,
  Folder as FolderIcon,
  FolderOpen,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

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
    setActiveFile,
    fetchFileContent,
  } = useVSCode();

  const isExpanded = expandedPaths.includes(node.path);
  const isActive = activeFile?.path === node.path;

  const handleClick = () => {
    if (node.type === 'folder') {
      togglePath(node.path);
    } else {
      fetchFileContent(node.path);
    }
  };

  return (
    <div>
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
        <span className="ml-1">{node.name}</span>
      </div>

      {node.type === 'folder' &&
        isExpanded &&
        node.children.map((child) => (
          <FileTreeNode key={child.path} node={child} level={level + 1} />
        ))}
    </div>
  );
}

export function FileTree() {
  const fileTree = useVSCode((state) => state.fileTree);

  return (
    <div className="py-2">
      {fileTree.map((item) => (
        <FileTreeNode key={item.path} node={item} level={0} />
      ))}
    </div>
  );
}
