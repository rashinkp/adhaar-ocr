import Tesseract from "tesseract.js";
import sharp from "sharp";

export const performOcrProcessing = async (
  frontBuffer: Buffer,
  backBuffer: Buffer
) => {
  // Normalize images to PNG
  const [frontPng, backPng] = await Promise.all([
    sharp(frontBuffer).toFormat("png").toBuffer(),
    sharp(backBuffer).toFormat("png").toBuffer(),
  ]);

  // Perform OCR
  const [frontResult, backResult] = await Promise.all([
    Tesseract.recognize(frontPng, "eng"),
    Tesseract.recognize(backPng, "eng"),
  ]);

  return {
    frontText: frontResult.text,
    backText: backResult.text,
  };
};
