import express from 'express';
import cors from 'cors';
import Docker from 'dockerode';
import { Readable, Writable } from 'stream';
import { PassThrough } from 'stream';

const app = express();
const port = 8000;
// For Windows, you might need: { socketPath: '//./pipe/docker_engine' }
const docker = new Docker();

app.use(cors());
app.use(express.json());

const languageConfig: { [key: string]: { image: string; cmd: (fileName: string) => string[] } } = {
    javascript: {
        image: 'node:18-alpine',
        cmd: (fileName) => ['node', fileName],
    },
    python: {
        image: 'python:3.10-alpine',
        cmd: (fileName) => ['python', fileName],
    },
    java: {
        image: 'openjdk:11-jdk-slim',
        // This is the corrected command. It removes an unnecessary shell wrapper.
        cmd: (fileName) => [`javac ${fileName} && java Main`],
    },
     cpp: {
        image: 'gcc:latest', // Using the official GCC Docker image
        cmd: (fileName) => [`g++ ${fileName} -o a.out && ./a.out`], // Compiles the file to a.out and then executes it
    },
};

const pullImage = (imageName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        console.log(`Pulling image: ${imageName}...`);
        docker.pull(imageName, (err: unknown, stream: Readable) => {
            if (err) {
                return reject(err);
            }
            docker.modem.followProgress(stream, (err: unknown, output: unknown) => {
                if (err) {
                    return reject(err);
                }
                console.log(`Image ${imageName} pulled.`);
                resolve();
            });
        });
    });
};

app.post('/execute', async (req, res) => {
    const { language, code } = req.body;

    if (!language || !code) {
        return res.status(400).send({ error: 'Language and code are required.' });
    }

    const config = languageConfig[language];
    if (!config) {
        return res.status(400).send({ error: `Unsupported language: ${language}` });
    }

    const fileName = language === 'java' ? 'Main.java' : `script.${language}`;
    const escapedCode = code.replace(/'/g, "'\\''");
    const commandParts = config.cmd(fileName);
    const command = `echo '${escapedCode}' > ${fileName} && ${commandParts.join(' ')}`;

    res.setHeader('Content-Type', 'text/plain');

    try {
        await pullImage(config.image);

        const outputBuffer: Buffer[] = [];
        const outputStream = new Writable({
            write(chunk, encoding, callback) {
                outputBuffer.push(chunk);
                callback();
            }
        });

        const options = {
            Tty: false,
            HostConfig: {
                AutoRemove: true,
            },
            StopTimeout: 15,
        };

        const [data, container] = await docker.run(config.image, ['/bin/sh', '-c', command], outputStream, options);

        const fullOutput = Buffer.concat(outputBuffer).toString();

        if (data.StatusCode !== 0) {
            console.error(`Container exited with status code: ${data.StatusCode}`);
            res.status(400).send(fullOutput); // Send 400 with error output
        } else {
            res.status(200).send(fullOutput); // Send 200 with success output
        }

    } catch (error: unknown) {
        console.error('Execution setup error:', error);
        if (!res.headersSent) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            res.status(500).send(message);
        }
    }
});

app.listen(port, () => {
    console.log(`Backend server is listening on http://localhost:${port}`);
});
