import Docker from 'dockerode';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

export class DockerService {
    private docker: Docker;
    private imageCache: Set<string>;
    private cacheFilePath: string;

    constructor() {
        this.docker = new Docker();
        this.imageCache = new Set();
        this.cacheFilePath = path.join(__dirname, '../.docker-cache.json');
        this.loadImageCache();
    }

    private async loadImageCache() {
        try {
            const data = await readFileAsync(this.cacheFilePath, 'utf-8');
            const cache = JSON.parse(data);
            this.imageCache = new Set(cache);
        } catch (error) {
            this.imageCache = new Set();
        }
    }

    private async saveImageCache() {
        const cache = Array.from(this.imageCache);
        await writeFileAsync(this.cacheFilePath, JSON.stringify(cache));
    }

    async hasImage(imageName: string): Promise<boolean> {
        try {
            const images = await this.docker.listImages();
            return images.some(image => 
                image.RepoTags && image.RepoTags.includes(imageName)
            );
        } catch {
            return false;
        }
    }

    async pullImage(imageName: string): Promise<void> {
        if (this.imageCache.has(imageName) && await this.hasImage(imageName)) {
            console.log(`Image ${imageName} is already cached and available locally.`);
            return;
        }

        return new Promise((resolve, reject) => {
            this.docker.pull(imageName, (err: Error, stream: NodeJS.ReadableStream) => {
                if (err) return reject(err);

                this.docker.modem.followProgress(stream, async (err: Error | null) => {
                    if (err) return reject(err);
                    console.log(`Image ${imageName} pulled successfully.`);
                    this.imageCache.add(imageName);
                    await this.saveImageCache();
                    resolve();
                });
            });
        });
    }

    async createContainer(options: Docker.ContainerCreateOptions) {
        return this.docker.createContainer(options);
    }

    async ensureImage(imageName: string) {
        if (!await this.hasImage(imageName)) {
            await this.pullImage(imageName);
        }
    }
}
