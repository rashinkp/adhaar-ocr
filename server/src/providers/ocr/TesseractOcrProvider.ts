import Tesseract from "tesseract.js";
import sharp from "sharp";
import { IOcrProvider } from "./IOcrProvider.js";

export class TesseractOcrProvider implements IOcrProvider {
  private readonly language: string;

  constructor(language: string = "eng") {
    this.language = language;
  }

  async extractText(buffer: Buffer): Promise<string> {
    try {
      // Convert buffer to PNG for better OCR accuracy
      const pngBuffer = await sharp(buffer).toFormat("png").toBuffer();
      
      const result = await Tesseract.recognize(pngBuffer, this.language);
      return result.text;
    } catch (error) {
      console.error("OCR extraction failed:", error);
      throw new Error(`OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async extractTextFromMultiple(buffers: Buffer[]): Promise<string[]> {
    try {
      const pngBuffers = await Promise.all(
        buffers.map(buffer => sharp(buffer).toFormat("png").toBuffer())
      );

      const results = await Promise.all(
        pngBuffers.map(pngBuffer => Tesseract.recognize(pngBuffer, this.language))
      );

      return results.map(result => result.text);
    } catch (error) {
      console.error("Multiple OCR extraction failed:", error);
      throw new Error(`Multiple OCR extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

