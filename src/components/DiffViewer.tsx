import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight } from 'lucide-react';
import { diffLines } from 'diff';

interface DiffViewerProps {
  original: string;
  corrected: string;
  onApply: () => void;
  onCancel: () => void;
}

export function DiffViewer({ original, corrected, onApply, onCancel }: DiffViewerProps) {
  const diff = diffLines(original, corrected);
  
  return (
    <Card className="diff-viewer border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <ArrowRight className="h-3 w-3" />
              Code Fix Suggestion
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              className="gap-1"
            >
              <X className="h-3 w-3" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onApply}
              className="gap-1"
            >
              <Check className="h-3 w-3" />
              Apply Fix
            </Button>
          </div>
        </div>

        <div className="diff-content rounded-md border bg-muted/30 p-4 font-mono text-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Original Code */}
            <div>
              <Badge variant="destructive" className="mb-2 text-xs">
                Original (Issues Found)
              </Badge>
              <pre className="diff-original bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded p-3 overflow-x-auto whitespace-pre-wrap text-xs">
                {diff.map((part, index) => (
                  <span
                    key={index}
                    className={
                      part.removed
                        ? 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                        : part.added
                        ? 'opacity-50'
                        : ''
                    }
                  >
                    {part.value}
                  </span>
                ))}
              </pre>
            </div>

            {/* Corrected Code */}
            <div>
              <Badge variant="default" className="mb-2 text-xs bg-green-600">
                Corrected (Fixed)
              </Badge>
              <pre className="diff-corrected bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3 overflow-x-auto whitespace-pre-wrap text-xs">
                {diff.map((part, index) => (
                  <span
                    key={index}
                    className={
                      part.added
                        ? 'bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                        : part.removed
                        ? 'opacity-50'
                        : ''
                    }
                  >
                    {part.value}
                  </span>
                ))}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            Review the changes above. Green highlights show additions, red highlights show removals.
            Click "Apply Fix" to update your code with the suggested improvements.
          </p>
        </div>
      </div>
    </Card>
  );
}