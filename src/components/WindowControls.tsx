import * as React from 'react';
import { useVSCode } from '../store/vscodeStore';
import { cn } from '../lib/utils';

interface WindowControlsProps {
  className?: string;
}

export function WindowControls({ className }: WindowControlsProps) {
  const isMaximized = useVSCode((state) => state.isMaximized);
  const setMaximized = useVSCode((state) => state.setMaximized);
  const setMinimized = useVSCode((state) => state.setMinimized);

  const handleClose = () => {
    // In a real VS Code extension, this would close the window
    // Here we'll just minimize it
    setMinimized(true);
  };

  const handleMinimize = () => {
    setMinimized(true);
  };

  const handleMaximize = () => {
    setMaximized(!isMaximized);
  };

  return (
    <div className={cn("flex items-center gap-2 px-4", className)}>
      <button
        onClick={handleClose}
        className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
        aria-label="Close"
      />
      <button
        onClick={handleMinimize}
        className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
        aria-label="Minimize"
      />
      <button
        onClick={handleMaximize}
        className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
        aria-label="Maximize"
      />
    </div>
  );
}
