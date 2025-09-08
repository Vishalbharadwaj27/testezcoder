import express from 'express';
import cors from 'cors';
import Docker from 'dockerode';
import { PassThrough } from 'stream';

const app = express();
const port = 8000;
const docker = new Docker();

app.use(cors());
app.use(express.json());

// Updated language config with commands designed for streaming stdin
const languageConfig: { [key: string]: { image: string; cmd: string } } = {
    javascript: {
        image: 'node:18-alpine',
        cmd: 'cat > script.js && node script.js',
    },
    python: {
        image: 'python:3.10-alpine',
        cmd: 'cat > script.py && python script.py',
    },
    java: {
        image: 'openjdk:11-jdk-slim',
        cmd: 'cat > Main.java && javac Main.java && java Main',
    },
    cpp: {
        image: 'gcc:latest',
        cmd: 'cat > script.cpp && g++ script.cpp -o a.out && ./a.out',
    },
    c: {
        image: 'gcc:latest',
        cmd: 'cat > script.c && gcc script.c -o a.out && ./a.out',
    },
};

// Helper function to ensure images are available locally
const pullImage = (imageName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        docker.pull(imageName, (err: Error, stream: NodeJS.ReadableStream) => {
            if (err) return reject(err);
            docker.modem.followProgress(stream, (err: Error | null) => {
                if (err) return reject(err);
                console.log(`Image ${imageName} is ready.`);
                resolve();
            });
        });
    });
};

// Pre-pull all images on server startup for faster execution
Object.values(languageConfig).forEach(config => {
    pullImage(config.image).catch(err => console.error(`Failed to pull ${config.image}`, err));
});


app.post('/execute', async (req, res) => {
    const { language, code } = req.body;

    if (!language || !code) {
        return res.status(400).send({ error: 'Language and code are required.' });
    }

    const config = languageConfig[language];
    if (!config) {
        return res.status(400).send({ error: `Unsupported language: ${language}` });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    try {
        const container = await docker.createContainer({
            Image: config.image,
            Cmd: ['/bin/sh', '-c', config.cmd],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            OpenStdin: true,
            StdinOnce: false, // Keep stdin open until we explicitly close it
            Tty: false,
            HostConfig: {
                AutoRemove: true, // Automatically remove the container when it exits
            },
        });

        const stream = await container.attach({
            stream: true,
            stdin: true,
            stdout: true,
            stderr: true,
        });

        // Pipe container output (stdout & stderr) directly to the HTTP response
        // Docker multiplexes stdout and stderr, so we demux them to keep them separate if needed
        // For simplicity here, we'll pipe the combined stream.
        const output = new PassThrough();
        container.modem.demuxStream(stream, output, output);
        output.pipe(res);
        
        await container.start();

        // Write the user's code to the container's stdin
        stream.write(code);
        stream.end(); // Close stdin to signal that we're done sending code

        // Wait for the container to finish executing
        await container.wait();

        // Explicitly end the response to signal completion
        res.end();

    } catch (error: unknown) {
        console.error('Execution error:', error);
        if (!res.headersSent) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred during execution.';
            res.status(500).send(message);
        }
    }
});


app.listen(port, () => {
    console.log(`Backend server is listening on http://localhost:${port}`);
});