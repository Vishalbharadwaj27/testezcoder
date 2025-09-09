import { Server, Socket } from 'socket.io';
import http from 'http';
import Docker from 'dockerode';
import { PassThrough } from 'stream';

interface TerminalOptions {
    image: string;
}

interface ResizeOptions {
    cols: number;
    rows: number;
}

export class TerminalService {
    private io: Server;
    private docker: Docker;

    constructor(server: http.Server) {
        this.io = new Server(server, {
            cors: {
                origin: "http://localhost:8080",
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        this.docker = new Docker();
        this.setupWebSocket();
    }

    private setupWebSocket() {
        this.io.on('connection', (socket: Socket) => {
            console.log('Client connected to terminal');

            let container: Docker.Container | null = null;
            let stream: PassThrough | null = null;

            socket.on('terminal:start', async (options: TerminalOptions) => {
                try {
                    // Create a new container for the terminal session
                    container = await this.docker.createContainer({
                        Image: options.image,
                        Cmd: ['/bin/sh'],
                        AttachStdin: true,
                        AttachStdout: true,
                        AttachStderr: true,
                        Tty: true,
                        OpenStdin: true,
                        StdinOnce: false,
                        Env: ["TERM=xterm"]
                    });

                    await container.start();

                    // Attach to the container
                    const dockerStream = await container.attach({
                        stream: true,
                        stdin: true,
                        stdout: true,
                        stderr: true
                    });

                    // Create a PassThrough stream for handling the data
                    stream = new PassThrough();
                    
                    // Set up pipe for container output
                    container.modem.demuxStream(dockerStream, stream, stream);
                    
                    // Handle stream data
                    stream.on('data', (chunk: Buffer) => {
                        socket.emit('terminal:output', chunk.toString());
                    });

                    // Handle input by writing to the docker stream
                    socket.on('terminal:input', (data: string) => {
                        dockerStream.write(data);
                    });

                    socket.emit('terminal:started');
                } catch (error) {
                    console.error('Failed to start terminal:', error);
                    socket.emit('terminal:error', 'Failed to start terminal');
                }
            });

            socket.on('terminal:resize', async (data: ResizeOptions) => {
                if (container) {
                    try {
                        await container.resize(data);
                    } catch (error) {
                        console.error('Failed to resize terminal:', error);
                    }
                }
            });

            socket.on('disconnect', async () => {
                if (stream) {
                    stream.end();
                }
                if (container) {
                    try {
                        await container.stop();
                        await container.remove();
                    } catch (error) {
                        console.error('Error cleaning up container:', error);
                    }
                }
            });
        });
    }
}
