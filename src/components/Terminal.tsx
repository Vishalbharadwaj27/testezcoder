import React, { useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { AttachAddon } from 'xterm-addon-attach';
import './Terminal.css';

interface TerminalProps {
    className?: string;
}

const TerminalComponent: React.FC<TerminalProps> = ({ className = '' }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);

    useEffect(() => {
        if (!terminalRef.current || xtermRef.current) return;

        const xterm = new XTerm({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: '#1e1e1e',
                foreground: '#d4d4d4',
                cursor: '#d4d4d4'
            },
            allowProposedApi: true
        });

        const fitAddon = new FitAddon();
        xterm.loadAddon(fitAddon);
        xterm.loadAddon(new WebLinksAddon());

        xterm.open(terminalRef.current);
        fitAddon.fit();
        xtermRef.current = xterm;

        const socket = new WebSocket('ws://localhost:8000');
        const attachAddon = new AttachAddon(socket);
        xterm.loadAddon(attachAddon);

        const handleResize = () => {
            fitAddon.fit();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            socket.close();
            if (xtermRef.current) {
                xtermRef.current.dispose();
            }
        };
    }, []);

    return (
        <div
            className={`terminal-container ${className} bg-black text-white h-full font-mono text-xs`}
            ref={terminalRef}
        />
    );
};

export default TerminalComponent;
