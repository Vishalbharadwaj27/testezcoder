import { useVSCode } from '@/store/vscodeStore';
import { useRef, useEffect, useCallback, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Wand2, Play } from 'lucide-react';
import { TinyLlamaService, FixResponse } from '@/services/tinyLlamaService';
import { DiffViewer } from './DiffViewer';
import { ContextMenuComponent } from './ContextMenu';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VSCodeEditorProps {
  className?: string;
}

export default function VSCodeEditor({ className = '' }: VSCodeEditorProps) {
  const { activeFile, updateFileContent, executeCode, isExecuting } = useVSCode();
  const [selectedCode, setSelectedCode] = useState('');
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [diffData, setDiffData] = useState<{ original: string; corrected: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false
  });
  
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { toast } = useToast();

  const language = activeFile?.language || 'javascript';

  const initializeModel = useCallback(async () => {
    if (TinyLlamaService.isReady()) return;
    
    setIsModelLoading(true);
    try {
      await TinyLlamaService.initialize();
      toast({
        title: "🤖 TinyLlama Ready",
        description: "AI model loaded successfully. You can now use EZ-coder features!",
      });
    } catch (error) {
      toast({
        title: "❌ Model Loading Failed",
        description: "Unable to load AI model. Some features may not work.",
        variant: "destructive"
      });
    } finally {
      setIsModelLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    editor.onContextMenu((e: monaco.editor.IEditorMouseEvent) => {
      const selection = editor.getSelection();
      if (selection && !selection.isEmpty()) {
        const selectedText = editor.getModel()?.getValueInRange(selection) || '';
        setSelectedCode(selectedText);
        setContextMenu({
          x: e.event.posx || 0,
          y: e.event.posy || 0,
          visible: true
        });
      }
    });

    editor.onMouseDown(() => {
      setContextMenu(prev => ({ ...prev, visible: false }));
    });
  };

  const handleFixCode = async () => {
    if (!TinyLlamaService.isReady()) {
      toast({
        title: "⚠️ Model Not Ready",
        description: "Please wait for the AI model to load.",
        variant: "destructive"
      });
      return;
    }

    const codeToFix = selectedCode || getSelectedText() || (activeFile?.content || '');
    if (!codeToFix.trim()) {
      toast({
        title: "No Code Selected",
        description: "Please select some code to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setContextMenu(prev => ({ ...prev, visible: false }));

    try {
      const result: FixResponse = await TinyLlamaService.fixCode(codeToFix, language);
      
      if (result.hasError) {
        setDiffData({
          original: codeToFix,
          corrected: result.correctedCode
        });
        
        toast({
          title: "🔍 Issues Found",
          description: result.explanation,
        });
      } else {
        toast({
          title: "✅ Code Looks Good",
          description: result.explanation,
        });
      }
    } catch (error) {
      toast({
        title: "❌ Analysis Failed",
        description: "Unable to analyze code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!TinyLlamaService.isReady()) {
      toast({
        title: "⚠️ Model Not Ready",
        description: "Please wait for the AI model to load.",
        variant: "destructive"
      });
      return;
    }

    const content = activeFile?.content || '';
    const ezComments = content.match(/\/\/EZ:.*$/gm);
    if (!ezComments || ezComments.length === 0) {
      toast({
        title: "No EZ Comments Found",
        description: "Add a comment starting with '//EZ:' to generate code.",
        variant: "destructive"
      });
      return;
    }

    const lastComment = ezComments[ezComments.length - 1];
    const instruction = lastComment.replace('//EZ:', '').trim();

    if (!instruction) {
      toast({
        title: "Empty Instruction",
        description: "Please provide an instruction after '//EZ:'",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const generatedCode = await TinyLlamaService.generateCode(instruction, language);
      
      const commentIndex = content.lastIndexOf(lastComment);
      const beforeComment = content.substring(0, commentIndex + lastComment.length);
      const afterComment = content.substring(commentIndex + lastComment.length);
      
      const newCode = beforeComment + '\n' + generatedCode + '\n' + afterComment;
      if (activeFile) {
        updateFileContent(activeFile.path, newCode);
      }
      
      toast({
        title: "🪄 Code Generated",
        description: `Generated code for: ${instruction}`,
      });
    } catch (error) {
      toast({
        title: "❌ Generation Failed",
        description: "Unable to generate code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedText = () => {
    if (!editorRef.current) return '';
    const selection = editorRef.current.getSelection();
    if (!selection || selection.isEmpty()) return '';
    return editorRef.current.getModel()?.getValueInRange(selection) || '';
  };

  const applyFix = () => {
    if (!diffData) return;
    
    if (selectedCode) {
      const newCode = (activeFile?.content || '').replace(selectedCode, diffData.corrected);
      if (activeFile) {
        updateFileContent(activeFile.path, newCode);
      }
    } else {
      if (activeFile) {
        updateFileContent(activeFile.path, diffData.corrected);
      }
    }
    
    setDiffData(null);
    toast({
      title: "✅ Fix Applied",
      description: "Code has been updated with the suggested fix.",
    });
  };

  return (
    <div className={`vscode-editor-container ${className} h-full flex flex-col`}>
      {/* Toolbar */}
      <div className="vscode-toolbar border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {activeFile?.name || 'No File'}
          </Badge>
          <Badge variant={language === 'javascript' ? 'default' : 'outline'} className="text-xs">
            {language}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {isModelLoading ? (
            <Badge variant="secondary" className="animate-pulse">
              Loading AI Model...
            </Badge>
          ) : TinyLlamaService.isReady() ? (
            <Badge variant="default" className="bg-green-600">
              🤖 TinyLlama Ready
            </Badge>
          ) : (
            <Badge variant="destructive">
              ❌ Model Error
            </Badge>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleFixCode}
            disabled={isProcessing || !TinyLlamaService.isReady()}
            className="gap-1"
          >
            <Lightbulb className="h-3 w-3" />
            {isProcessing ? 'Analyzing...' : 'Fix Errors'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={handleGenerateCode}
            disabled={isProcessing || !TinyLlamaService.isReady()}
            className="gap-1"
          >
            <Wand2 className="h-3 w-3" />
            {isProcessing ? 'Generating...' : 'Generate'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={executeCode}
            disabled={isExecuting || !activeFile}
            className="gap-1"
          >
            <Play className="h-3 w-3" />
            {isExecuting ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <ScrollArea className="h-full w-full">
        <div className="vscode-editor-wrapper relative">
          <Editor
            height="calc(100vh - 200px)" // Keep a calculated height to not overflow
            language={language}
            value={activeFile?.content || ''}
            onChange={(value) => {
              if (activeFile) {
                updateFileContent(activeFile.path, value || '');
              }
            }}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: true, // Enable scrolling beyond last line
              automaticLayout: true,
              contextmenu: false, // Disable default context menu
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              mouseWheelZoom: true,
            }}
          />
          
          {/* Custom Context Menu */}
          <ContextMenuComponent
            visible={contextMenu.visible}
            x={contextMenu.x}
            y={contextMenu.y}
            onFixCode={handleFixCode}
            onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
            disabled={isProcessing || !TinyLlamaService.isReady()}
          />
        </div>
      </ScrollArea>

      {/* Diff Viewer */}
      {diffData && (
        <DiffViewer
          original={diffData.original}
          corrected={diffData.corrected}
          onApply={applyFix}
          onCancel={() => setDiffData(null)}
        />
      )}
    </div>
  );
}
