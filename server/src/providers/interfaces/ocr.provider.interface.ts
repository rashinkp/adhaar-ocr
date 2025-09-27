export interface IOcrProvider {
  extractText(buffer: Buffer): Promise<string>;
  extractTextFromMultiple(buffers: Buffer[]): Promise<string[]>;
}

