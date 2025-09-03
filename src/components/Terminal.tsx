import React, { useEffect, useRef } from 'react';
import { useVSCode } from '@/store/vscodeStore';

const Terminal: React.FC = () => {
  const { terminalOutput, isExecuting } = useVSCode();
  const endOfTerminalRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: "auto" });
  }, [terminalOutput]);

  return (
    <div className="bg-black text-white p-4 h-full font-mono text-xs overflow-y-auto">
      <pre className="whitespace-pre-wrap">
        {terminalOutput.join('')}
        {isExecuting && terminalOutput.length <= 1 && 'Executing...'}
      </pre>
      <div ref={endOfTerminalRef} />
    </div>
  );
};

export default Terminal;
