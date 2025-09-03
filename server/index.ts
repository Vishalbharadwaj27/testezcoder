import express from 'express';
import cors from 'cors';
import Docker from 'dockerode';

const app = express();
const port = 8000;
const docker = new Docker(); // For Windows, you might need: { socketPath: '//./pipe/docker_engine' }

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
        cmd: (fileName) => ['sh', '-c', 'javac ${fileName} && java Main'],
    },
};

const pullImage = (imageName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        console.log(`Pulling image: ${imageName}...`);
        docker.pull(imageName, (err: Error, stream: any) => {
            if (err) return reject(err);
            docker.modem.followProgress(stream, (err: Error, output: any) => {
                if (err) return reject(err);
                console.log(`Image ${imageName} pulled.`);
                resolve();
            });
        });
    });
};

app.post('/execute', async (req, res) => {
    const { language, code } = req.body;

    if (!language || !code) {
        return res.status(400).json({ error: 'Language and code are required.' });
    }

    const config = languageConfig[language];
    if (!config) {
        return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    const fileName = language === 'java' ? 'Main.java' : `script.${language}`;
    
    // Escape code to be safely passed inside a shell command
    const escapedCode = code.replace(/\/g, '\\').replace(/'/g, "'\''");
    const command = `echo '${escapedCode}' > ${fileName} && ${config.cmd(fileName).join(' ')}`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    try {
        await pullImage(config.image);

        docker.run(config.image, ['/bin/sh', '-c', command], res, {
            Tty: false,
            HostConfig: {
                AutoRemove: true,
            },
            StopTimeout: 15, // 15 seconds timeout
        }, (err, data, container) => {
            if (err) {
                console.error('Docker run error:', err);
                if (!res.headersSent) {
                    res.status(500).send(err.message);
                }
            }
        });

    } catch (error: any) {
        console.error('Execution setup error:', error);
        if (!res.headersSent) {
            res.status(500).send(error.message);
        }
    }
});

app.listen(port, () => {
    console.log(`Backend server is listening on http://localhost:${port}`);
});
