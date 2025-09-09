import { Container } from 'dockerode';
import path from 'path';

export interface PackageConfig {
    packageFile: string;
    installCommand: string;
    image: string;
}

export class DependencyManager {
    private static packageConfigs: { [key: string]: PackageConfig } = {
        'package.json': {
            packageFile: 'package.json',
            installCommand: 'npm install',
            image: 'node:18-alpine'
        },
        'requirements.txt': {
            packageFile: 'requirements.txt',
            installCommand: 'pip install -r requirements.txt',
            image: 'python:3.10-alpine'
        },
        'pom.xml': {
            packageFile: 'pom.xml',
            installCommand: 'mvn install',
            image: 'maven:3.8-openjdk-11'
        }
    };

    static async installDependencies(container: Container, projectPath: string): Promise<void> {
        // Identify package files in the project
        for (const [fileName, config] of Object.entries(this.packageConfigs)) {
            const packagePath = path.join(projectPath, fileName);
            
            try {
                // Check if package file exists
                await container.getArchive({ path: packagePath });
                
                // Install dependencies
                await container.exec({
                    Cmd: config.installCommand.split(' '),
                    AttachStdout: true,
                    AttachStderr: true,
                    WorkingDir: projectPath
                });
                
                console.log(`Dependencies installed for ${fileName}`);
            } catch (error) {
                console.log(`No ${fileName} found or installation failed`);
            }
        }
    }
}
