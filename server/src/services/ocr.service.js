import Tesseract from "tesseract.js";
import sharp from "sharp";
import { parseAadhaarText, parseAadhaarTextWithValidation } from "./aadhaar.parser.service.js";
export const performOcrProcessing = async (frontBuffer, backBuffer) => {
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
    const parsed = parseAadhaarText(frontText, backText);
    return {
        frontText,
        backText,
        parsed,
    };
};
export const performOcrProcessingWithValidation = async (frontBuffer, backBuffer) => {
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
//# sourceMappingURL=ocr.service.js.map