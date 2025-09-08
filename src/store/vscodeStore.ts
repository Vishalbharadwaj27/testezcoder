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
  name: string;
}

// VSCode UI and File System State
interface VSCodeState {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  tabSize: number;
  sidebarVisible: boolean;
  isTerminalOpen: boolean;
  activeSidebarTab: 'explorer' | 'search' | 'git' | 'debug' | 'extensions';
  isMaximized: boolean;
  isMinimized: boolean;
  activeFile: FileState | null;
  files: FileState[];
  fileTree: Array<File | Folder>;
  expandedPaths: string[];
  isCommandPaletteOpen: boolean;
  terminalOutput: string[];
  isExecuting: boolean;
}

// Actions for the store
interface VSCodeActions {
  setTheme: (theme: VSCodeState['theme']) => void;
  setFontSize: (size: number) => void;
  setTabSize: (size: number) => void;
  setSidebarVisible: (visible: boolean) => void;
  toggleTerminal: () => void;
  setSidebarTab: (tab: VSCodeState['activeSidebarTab']) => void;
  setMaximized: (maximized: boolean) => void;
  setMinimized: (minimized: boolean) => void;
  setActiveFile: (file: FileState | null) => void;
  addFile: (file: FileState) => void;
  updateFileContent: (path: string, content: string) => void;
  togglePath: (path: string) => void;
  fetchFileContent: (path: string) => Promise<void>;
  createNewFile: () => void;
  saveActiveFile: () => Promise<boolean>;
  addToFileTree: (file: FileState) => void;
  openFile: () => Promise<void>;
  renameFile: (oldPath: string, newName: string) => void;
  deleteFile: (path: string) => void;
  toggleCommandPalette: () => void;
  executeCode: () => Promise<void>;
  clearTerminal: () => void;
}

// The complete store type
type VSCodeStore = VSCodeState & VSCodeActions;

// Default state
const defaultState: VSCodeState = {
  theme: 'dark', // Default theme
  fontSize: 14,
  tabSize: 2,
  sidebarVisible: true,
  isTerminalOpen: false,
  activeSidebarTab: 'explorer',
  isMaximized: false,
  isMinimized: false,
  activeFile: null,
  files: [],
  fileTree: [], // Empty file tree by default
  expandedPaths: [],
  isCommandPaletteOpen: false,
  terminalOutput: [],
  isExecuting: false,
};

export const useVSCode = create<VSCodeStore>((set, get) => ({
  ...defaultState,

  // UI Actions
  setTheme: (theme) => set({ theme }),
  setFontSize: (fontSize) => set({ fontSize }),
  setTabSize: (tabSize) => set({ tabSize }),
  setSidebarVisible: (visible) => set({ sidebarVisible: visible }),
  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
  setSidebarTab: (tab) => set({ activeSidebarTab: tab }),
  setMaximized: (maximized) => set({ isMaximized: maximized }),
  setMinimized: (minimized) => set({ isMinimized: minimized }),

  // File System Actions
  setActiveFile: (file) => set({ activeFile: file }),
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  updateFileContent: (path, content) =>
    set((state) => ({
      activeFile: state.activeFile?.path === path
        ? { ...state.activeFile, content }
        : state.activeFile,
      files: state.files.map((f) => (f.path === path ? { ...f, content } : f)),
    })),
  togglePath: (path) =>
    set((state) => ({
      expandedPaths: state.expandedPaths.includes(path)
        ? state.expandedPaths.filter((p) => p !== path)
        : [...state.expandedPaths, path],
    })),

  addToFileTree: (file) =>
    set((state) => {
      const newTree = [...state.fileTree];
      // Add to root for simplicity, avoiding duplicates.
      if (!newTree.some(item => item.path === file.path)) {
        newTree.push({
          name: file.name,
          path: file.path,
          type: 'file',
        });
      }
      return { fileTree: newTree };
    }),

  createNewFile: () => {
    const state = get();
    const existingUntitled = state.files
      .filter(f => f.path.startsWith('untitled:'))
      .map(f => parseInt(f.path.match(/\d+/)?.[0] || '0', 10));

    const nextNumber = existingUntitled.length > 0
      ? Math.max(...existingUntitled) + 1
      : 1;

    const newFile: FileState = {
      path: `untitled:Untitled-${nextNumber}`,
      content: '', // Ensure content is empty
      language: 'plaintext', // Default to plaintext for new files
      name: `Untitled-${nextNumber}`,
    };

    set((state) => ({
      files: [...state.files, newFile],
      activeFile: newFile
    }));
    get().addToFileTree(newFile);
  },

  saveActiveFile: async () => {
    const state = get();
    if (!state.activeFile) return false;

    try {
      if (window.showSaveFilePicker && window.isSecureContext) {
        const handle = await window.showSaveFilePicker({
          suggestedName: state.activeFile.name,
          types: [
            {
              description: 'Java files',
              accept: { 'text/java': ['.java'] }
            },
            {
              description: 'JavaScript files',
              accept: { 'text/javascript': ['.js'] }
            },
            {
              description: 'TypeScript files',
              accept: { 'text/typescript': ['.ts', '.tsx'] }
            }
          ]
        });

        const writable = await handle.createWritable();
        await writable.write(state.activeFile.content);
        await writable.close();

        const filePath = `/${handle.name}`;
        const language = handle.name.split('.').pop() || 'plaintext';
        const updatedFile = {
          ...state.activeFile,
          path: filePath,
          language,
          name: handle.name,
        };

        set((state) => ({
          files: state.files.map(f =>
            f.path === state.activeFile?.path ? updatedFile : f
          ),
          activeFile: updatedFile
        }));

        get().addToFileTree(updatedFile);
      } else {
        const blob = new Blob([state.activeFile.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.activeFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      return true;
    } catch (error) {
      console.error('Error saving file:', error);
      return false;
    }
  },

  fetchFileContent: async (path) => {
    try {
      const content = `// Content for ${path}`;
      const name = path.split('/').pop() || 'file';
      set((state) => {
        const file = state.files.find(f => f.path === path);
        if (file) {
          return { activeFile: file };
        }
        const newFile = {
          path,
          content,
          language: path.split('.').pop() || 'plaintext',
          name,
        };
        return { activeFile: newFile, files: [...state.files, newFile] };
      });
    } catch (error) {
      console.error('Error fetching file content:', error);
    }
  },

  openFile: async () => {
    try {
      if (window['showOpenFilePicker']) {
        const [fileHandle] = await window['showOpenFilePicker']();
        const file = await fileHandle.getFile();
        const content = await file.text();
        const newFile: FileState = {
          path: `/${file.name}`,
          name: file.name,
          content,
          language: file.name.split('.').pop() || 'plaintext',
        };

        const state = get();
        if (!state.files.some(f => f.path === newFile.path)) {
          set({ files: [...state.files, newFile] });
          get().addToFileTree(newFile);
        }
        set({ activeFile: newFile });

      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const content = await file.text();
            const newFile: FileState = {
              path: `/${file.name}`,
              name: file.name,
              content,
              language: file.name.split('.').pop() || 'plaintext',
            };

            const state = get();
            if (!state.files.some(f => f.path === newFile.path)) {
              set({ files: [...state.files, newFile] });
              get().addToFileTree(newFile);
            }
            set({ activeFile: newFile });
          }
        };
        input.click();
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  },

  renameFile: (oldPath, newName) => {
    set((state) => {
      const newFileTree = JSON.parse(JSON.stringify(state.fileTree));
      const newFiles = [...state.files];
      const language = newName.split('.').pop() || 'plaintext';

      const findAndRenameInTree = (nodes: Array<File | Folder>) => {
        for (const node of nodes) {
          if (node.path === oldPath) {
            const newPath = node.path.substring(0, node.path.lastIndexOf('/') + 1) + newName;
            node.name = newName;
            node.path = newPath;
            return;
          }
          if (node.type === 'folder') {
            findAndRenameInTree(node.children);
          }
        }
      };

      findAndRenameInTree(newFileTree);

      const fileIndex = newFiles.findIndex(f => f.path === oldPath);
      let updatedActiveFile = state.activeFile;

      if (fileIndex !== -1) {
        const oldFile = newFiles[fileIndex];
        const newPath = oldFile.path.substring(0, oldFile.path.lastIndexOf('/') + 1) + newName;
        newFiles[fileIndex] = { ...oldFile, name: newName, path: newPath, language };

        if (state.activeFile?.path === oldPath) {
          updatedActiveFile = newFiles[fileIndex];
        }
      }

      return {
        fileTree: newFileTree,
        files: newFiles,
        activeFile: updatedActiveFile
      };
    });
  },

  deleteFile: (path) => {
    set((state) => {
      const newFileTree = JSON.parse(JSON.stringify(state.fileTree));
      const newFiles = state.files.filter((f) => f.path !== path);

      const findAndDeleteInTree = (nodes: Array<File | Folder>, pathToDelete: string) => {
        return nodes.filter(node => {
          if (node.path === pathToDelete) {
            return false;
          }
          if (node.type === 'folder' && node.children) {
            node.children = findAndDeleteInTree(node.children, pathToDelete);
          }
          return true;
        });
      };


      let updatedActiveFile = state.activeFile;
      if (state.activeFile?.path === path) {
        updatedActiveFile = null;
      }

      return {
        fileTree: findAndDeleteInTree(newFileTree, path),
        files: newFiles,
        activeFile: updatedActiveFile,
      };
    });
  },

  // THIS IS THE CORRECTED FUNCTION
  executeCode: async () => {
    const { activeFile, toggleTerminal, clearTerminal } = get();
    if (!activeFile) return;

    if (!get().isTerminalOpen) {
      toggleTerminal();
    }
    clearTerminal();
    set({ isExecuting: true });
    set(state => ({ terminalOutput: [...state.terminalOutput, `$ Executing ${activeFile.name}...\n`] }));

    // Map the file extension to the language string the server expects.
    let language;
    const extension = activeFile.name.split('.').pop();
    switch (extension) {
        case 'js':
            language = 'javascript';
            break;
        case 'py':
            language = 'python';
            break;
        case 'java':
            language = 'java';
            break;
        case 'cpp':
            language = 'cpp';
            break;
        case 'c':
            language = 'c';
            break;
        default:
            set(state => ({ terminalOutput: [...state.terminalOutput, `\n[ERROR] Unsupported language: ${extension}`] }));
            set({ isExecuting: false });
            return;
    }

    try {
      const response = await fetch('http://localhost:8000/execute', { // Ensure your server port is correct
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language, // Use the mapped language
          code: activeFile.content,
        }),
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        set(state => ({ terminalOutput: [...state.terminalOutput, chunk] }));
      }

    } catch (error: unknown) {
      console.error("Execution error:", error);
      const message = error instanceof Error ? error.message : String(error);
      set(state => ({ terminalOutput: [...state.terminalOutput, `\n[ERROR] Failed to execute code: ${message}`] }));
    } finally {
      set({ isExecuting: false });
    }
  },

  clearTerminal: () => set({ terminalOutput: [] }),

  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
}));