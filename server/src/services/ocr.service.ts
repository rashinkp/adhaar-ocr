import Tesseract from "tesseract.js";
import sharp from "sharp";
import { parseAadhaarText, parseAadhaarTextWithValidation, type ParsedAadhaar, type ParsedAadhaarWithValidation } from "./aadhaar.parser.js";

export const performOcrProcessing = async (
  frontBuffer: Buffer,
  backBuffer: Buffer
) => {
  const [frontPng, backPng] = await Promise.all([
    sharp(frontBuffer).toFormat("png").toBuffer(),
    sharp(backBuffer).toFormat("png").toBuffer(),
  ]);

  // Perform OCR
  const [frontResult, backResult] = await Promise.all([
    Tesseract.recognize(frontPng, "eng"),
    Tesseract.recognize(backPng, "eng"),
  ]);

  const frontText = frontResult.text;
  const backText = backResult.text;

  const parsed: ParsedAadhaar = parseAadhaarText(frontText, backText);

  return {
    frontText,
    backText,
    parsed,
  };
};

export const performOcrProcessingWithValidation = async (
  frontBuffer: Buffer,
  backBuffer: Buffer
): Promise<ParsedAadhaarWithValidation> => {
  const [frontPng, backPng] = await Promise.all([
    sharp(frontBuffer).toFormat("png").toBuffer(),
    sharp(backBuffer).toFormat("png").toBuffer(),
  ]);

  // Perform OCR
  const [frontResult, backResult] = await Promise.all([
    Tesseract.recognize(frontPng, "eng"),
    Tesseract.recognize(backPng, "eng"),
  ]);

  const frontText = frontResult.text;
  const backText = backResult.text;

  return parseAadhaarTextWithValidation(frontText, backText);
};
