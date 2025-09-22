import { Tesseract } from "tesseract.ts";
import { OcrResult, ParsedAadhaarWithValidation } from "../types/aadhaar";
import sharp from "sharp";
import AadhaarParser from "./aadhaar.parser.service";


class AadhaarOcrProcessor {

  constructor(
    private _parser = new AadhaarParser
  ) {
    
  }

  private async _convertToPng(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer).toFormat("png").toBuffer();
  }

  private async _performOcr(buffer: Buffer): Promise<string> {
    const pngBuffer = await this._convertToPng(buffer);
    const result = await Tesseract.recognize(pngBuffer, "eng");
    return result.text;
  }

  public async performOcrProcessing(
    frontBuffer: Buffer,
    backBuffer: Buffer
  ): Promise<OcrResult> {
    const [frontPng, backPng] = await Promise.all([
      this._convertToPng(frontBuffer),
      this._convertToPng(backBuffer),
    ]);

    const [frontResult, backResult] = await Promise.all([
      Tesseract.recognize(frontPng, "eng"),
      Tesseract.recognize(backPng, "eng"),
    ]);

    const frontText = frontResult.text;
    const backText = backResult.text;

    const parsed = this._parser.parseAadhaarText(frontText, backText);

    return {
      frontText,
      backText,
      parsed,
    };
  }

  public async performOcrProcessingWithValidation(
    frontBuffer: Buffer,
    backBuffer: Buffer
  ): Promise<ParsedAadhaarWithValidation> {
    const [frontPng, backPng] = await Promise.all([
      this._convertToPng(frontBuffer),
      this._convertToPng(backBuffer),
    ]);

    const [frontResult, backResult] = await Promise.all([
      Tesseract.recognize(frontPng, "eng"),
      Tesseract.recognize(backPng, "eng"),
    ]);

    const frontText = frontResult.text;
    const backText = backResult.text;

    return this._parser.parseAadhaarTextWithValidation(frontText, backText);
  }
}

export default AadhaarOcrProcessor;
