import { create } from 'zustand';

// File system types
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

interface FileState {
  path: string;
  content: string;
  language: string;
}

// VSCode UI and File System State
interface VSCodeState {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  tabSize: number;
  sidebarVisible: boolean;
  activeSidebarTab: 'explorer' | 'search' | 'git' | 'debug' | 'extensions';
  isMaximized: boolean;
  isMinimized: boolean;
  activeFile: FileState | null;
  files: FileState[];
  fileTree: Array<File | Folder>;
  expandedPaths: string[];
}

// Actions for the store
interface VSCodeActions {
  setTheme: (theme: VSCodeState['theme']) => void;
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  setSidebarVisible: (visible: boolean) => void;
  setSidebarTab: (tab: VSCodeState['activeSidebarTab']) => void;
  setMaximized: (maximized: boolean) => void;
  setMinimized: (minimized: boolean) => void;
  setActiveFile: (file: FileState | null) => void;
  addFile: (file: FileState) => void;
  updateFileContent: (path: string, content: string) => void;
  togglePath: (path: string) => void;
  fetchFileContent: (path: string) => Promise<void>;
}

// The complete store type
type VSCodeStore = VSCodeState & VSCodeActions;

// Default state
const defaultState: VSCodeState = {
  theme: 'system',
  fontSize: 14,
  tabSize: 2,
  sidebarVisible: true,
  activeSidebarTab: 'explorer',
  isMaximized: false,
  isMinimized: false,
  activeFile: null,
  files: [],
  fileTree: [
    {
      name: 'src',
      path: '/src',
      type: 'folder',
      children: [
        {
          name: 'components',
          path: '/src/components',
          type: 'folder',
          children: [
            { name: 'App.tsx', path: '/src/components/App.tsx', type: 'file' },
          ],
        },
      ],
    },
  ],
  expandedPaths: ['/src'],
};

export const useVSCode = create<VSCodeStore>((set) => ({
  ...defaultState,

  // UI Actions
  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setTabSize: (tabSize) => set({ tabSize }),
  setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
  setSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  setMaximized: (maximized) => set({ isMaximized: maximized }),
  setMinimized: (minimized) => set({ isMinimized: minimized }),

  // File System Actions
  setActiveFile: (file) => set({ activeFile: file }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  updateFileContent: (path, content) =>
    set((state) => ({
      files: state.files.map((f) => (f.path === path ? { ...f, content } : f)),
    })),
  togglePath: (path) =>
    set((state) => ({
      expandedPaths: state.expandedPaths.includes(path)
        ? state.expandedPaths.filter((p) => p !== path)
        : [...state.expandedPaths, path],
    })),
  fetchFileContent: async (path) => {
    try {
      // In a real app, you'd fetch this from the file system or an API
      const content = `// Content for ${path}`;
      set({
        activeFile: {
          path,
          content,
          language: path.split('.').pop() || 'text',
        },
      });
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
  },
}));
