import { Router } from 'express';
import { DockerService } from '../services/docker-service';
import { DependencyManager } from '../services/dependency-manager';

const router = Router();
const dockerService = new DockerService();

// Language configuration
const languageConfig: { [key: string]: { image: string; cmd: string[] } } = {
    javascript: {
        image: 'node:18-alpine',
        cmd: ['node']
    },
    python: {
        image: 'python:3.10-alpine',
        cmd: ['python']
    },
    java: {
        image: 'openjdk:11-jdk-slim',
        cmd: ['java']
    },
    cpp: {
        image: 'gcc:latest',
        cmd: ['g++']
    },
    c: {
        image: 'gcc:latest',
        cmd: ['gcc']
    }
};

// Execute code endpoint
router.post('/execute', async (req, res) => {
    const { language, code, projectPath } = req.body;

    if (!language || !code) {
        return res.status(400).send({ error: 'Language and code are required.' });
    }

    const config = languageConfig[language];
    if (!config) {
        return res.status(400).send({ error: `Unsupported language: ${language}` });
    }

    try {
        // Ensure image is available
        await dockerService.ensureImage(config.image);

        // Create container with project volume mounted
        const container = await dockerService.createContainer({
            Image: config.image,
            Cmd: config.cmd,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            OpenStdin: true,
            Tty: false,
            HostConfig: {
                AutoRemove: true,
                Binds: projectPath ? [`${projectPath}:/workspace`] : []
            },
            WorkingDir: '/workspace'
        });

        // Handle project dependencies if project path is provided
        if (projectPath) {
            await DependencyManager.installDependencies(container, '/workspace');
        }

        // Start container and attach to it
        await container.start();
        const stream = await container.attach({
            stream: true,
            stdin: true,
            stdout: true,
            stderr: true
        });

        // Set up response streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        container.modem.demuxStream(stream, res, res);

        // Write code to container's stdin
        stream.write(code);
        stream.end();

        // Wait for execution to complete
        await container.wait();
        res.end();

    } catch (error) {
        console.error('Execution error:', error);
        if (!res.headersSent) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred during execution.';
            res.status(500).send(message);
        }
    }
});

export default router;
