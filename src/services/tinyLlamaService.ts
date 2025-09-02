import { pipeline, env, TextGenerationPipeline } from '@xenova/transformers';

env.allowLocalModels = false;

interface GenerationOptions {
  max_new_tokens: number;
  temperature: number;
  top_p: number;
  repetition_penalty?: number;
}

export interface FixResponse {
  hasError: boolean;
  explanation: string;
  correctedCode: string;
}

export class TinyLlamaService {
  private static model: TextGenerationPipeline | null = null;
  private static isInitializing: boolean = false;

  private static readonly defaultOptions: GenerationOptions = {
    max_new_tokens: 1000,
    temperature: 0.7,
    top_p: 0.95,
    repetition_penalty: 1.2,
  };

  private static createPrompt(system: string, user: string): string {
    return `<|im_start|>system\n${system}<|im_end|>\n<|im_start|>user\n${user}<|im_end|>\n<|im_start|>assistant`;
  }

  private static async generateResponse(prompt: string, options: Partial<GenerationOptions> = {}): Promise<string> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const fullOptions = { ...this.defaultOptions, ...options };
    const response = await this.model(prompt, fullOptions);

    if (Array.isArray(response)) {
      const firstItem = response[0];
      if (typeof firstItem === 'string') {
        return firstItem;
      } else if (firstItem && typeof firstItem === 'object' && 'generated_text' in firstItem) {
        return firstItem.generated_text;
      }
    } else if (typeof response === 'string') {
      return response;
    }

    return '';
  }

  static async initialize(): Promise<void> {
    if (this.model || this.isInitializing) {
      return;
    }

    this.isInitializing = true;
    try {
      console.log('Initializing TinyLlama model...');
      this.model = await pipeline('text-generation', 'Xenova/TinyLlama-1.1B-Chat-v1.0');
      console.log('TinyLlama model loaded successfully');
    } catch (error) {
      console.error('Failed to initialize model:', error);
      throw new Error(`Failed to initialize model: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.isInitializing = false;
    }
  }

  static async fixCode(code: string, language: string = 'javascript'): Promise<FixResponse> {
    await this.initialize();

    const codeBlock = `\n      \n      ${code}\n      \n    `;
    const prompt = this.createPrompt(
      `You are a senior ${language} developer. Analyze the code and return JSON with errors and fixes.`,
      codeBlock
    );

    const response = await this.generateResponse(prompt);
    const jsonStr = response.split('<|im_start|>assistant')[1]?.trim() ?? '';
    
    if (!jsonStr) {
      throw new Error('Empty response from model');
    }

    const parsedResponse = JSON.parse(jsonStr);
    return {
      hasError: Boolean(parsedResponse.hasError),
      explanation: String(parsedResponse.explanation || ''),
      correctedCode: String(parsedResponse.correctedCode || '')
    };
  }

  static async generateCode(instruction: string, language: string = 'javascript'): Promise<string> {
    await this.initialize();

    const prompt = this.createPrompt(
      `You are an expert ${language} developer. Generate clean, efficient code.`,
      instruction
    );

    const response = await this.generateResponse(prompt);
    const assistantResponse = response.split('<|im_start|>assistant')[1]?.trim() ?? '';

    if (!assistantResponse) {
      throw new Error('Empty response from model');
    }

    return assistantResponse.replace(/^```\w*\n/, '').replace(/```$/, '').trim();
  }

  static isReady(): boolean {
    return this.model !== null;
  }

  static async destroy(): Promise<void> {
    if (this.model) {
      // await this.model.dispose(); // Depending on the library, there might be a dispose method
      this.model = null;
      console.log('TinyLlama model destroyed');
    }
  }
}
