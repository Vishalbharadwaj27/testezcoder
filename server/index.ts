import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import pty from 'node-pty';
import os from 'os';

const app = express();
const port = 8000;

// Create HTTP server
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Create WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    const ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.env.HOME,
        env: process.env
    });

    ptyProcess.onData((data: any) => {
        ws.send(data);
    });

    ws.on('message', (message: any) => {
        ptyProcess.write(message);
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        ptyProcess.kill();
    });

    ptyProcess.onExit(() => {
        console.log('PTY process exited');
        ws.close();
    });
});

// Routes
// app.use('/api/execution', executionRouter); // This was in the original file but executionRouter is not defined

// Start the server
server.listen(port, () => {
    console.log(`Backend server is listening on http://localhost:${port}`);
});
