import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Wand2, Play, Bug, Settings } from 'lucide-react';
import { TinyLlamaService, FixResponse } from '@/services/tinyLlamaService';
import { DiffViewer } from './DiffViewer';
import { ContextMenuComponent } from './ContextMenu';
import { useToast } from '@/hooks/use-toast';

const defaultCode = `// Welcome to EZ-coder Simulator!
// Try these features:
// 1. Select code and click "Fix Errors" 
// 2. Write a comment starting with "//EZ:" and click "Generate"

function calculateSum(a, b) {
  // This function has a bug - missing return statement
  const result = a + b;
}

// Example: Uncomment and generate code for this:
// //EZ: Create a function that sorts an array of numbers

console.log(calculateSum(5, 3)); // This will log undefined due to missing return
`;

interface VSCodeEditorProps {
  className?: string;
}

export function VSCodeEditor({ className = '' }: VSCodeEditorProps) {
  const [code, setCode] = useState(defaultCode);
  const [selectedCode, setSelectedCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [diffData, setDiffData] = useState<{ original: string; corrected: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false
  });
  
  const editorRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeModel();
  }, []);

  const initializeModel = async () => {
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
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Add context menu listener
    editor.onContextMenu((e: any) => {
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

    // Hide context menu on click
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

    const codeToFix = selectedCode || getSelectedText() || code;
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

    const ezComments = code.match(/\/\/EZ:.*$/gm);
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
      
      // Insert generated code after the EZ comment
      const commentIndex = code.lastIndexOf(lastComment);
      const beforeComment = code.substring(0, commentIndex + lastComment.length);
      const afterComment = code.substring(commentIndex + lastComment.length);
      
      const newCode = beforeComment + '\n' + generatedCode + '\n' + afterComment;
      setCode(newCode);
      
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
      const newCode = code.replace(selectedCode, diffData.corrected);
      setCode(newCode);
    } else {
      setCode(diffData.corrected);
    }
    
    setDiffData(null);
    toast({
      title: "✅ Fix Applied",
      description: "Code has been updated with the suggested fix.",
    });
  };

  return (
    <div className={`vscode-editor-container ${className}`}>
      {/* Toolbar */}
      <div className="vscode-toolbar border-b border-border bg-muted/30 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            main.js
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
        </div>
      </div>

      {/* Editor */}
      <div className="vscode-editor-wrapper relative">
        <Editor
          height="calc(100vh - 200px)"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
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