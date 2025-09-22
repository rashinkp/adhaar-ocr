import { ParsedAadhaar, ParsedAadhaarWithValidation, RawText, ValidationResult } from "../types/aadhaar";


class AadhaarParser {
  private _normalize(text: string): string {
    return text
      .replace(/\r/g, "")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .join("\n");
  }

  private _sanitizeAddressHead(address: string): string {
    const stripLine = (line: string): string => {
      let s = line.trim();
      s = s.replace(/^(?:w[\s\.-]*){3,}/i, "");
      s = s.replace(/^(?:[A-Za-z]\s*){3,}(?=\b|$)/, "");
      return s.trim();
    };
    return address.split("\n").map(stripLine).join("\n").trim();
  }

  private _normalizePunctuation(text: string): string {
    return text
      .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
      .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
      .replace(/[\u2012\u2013\u2014\u2015\u2212]/g, "-")
      .replace(/[\u00A0\u2000-\u200B]/g, " ")
      .replace(/[\u20AC-\u20CF]/g, " ")
      .replace(/[\u02C6\u02DC\u02DD]/g, " ");
  }

  private _cleanAddressChunks(address: string): string[] {
    let chunks: string[] = this._normalizePunctuation(address)
      .split(/\s*,\s*/)
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk.length > 0)
      .map((chunk) => {
        const letters = (chunk.match(/[A-Za-z]/g) || []).length;
        if (letters === 0) return "";
        if (letters <= 2 && chunk.length <= 4) return "";
        let c = chunk.replace(/^(?:[A-Za-z]\s*){2,}$/g, "");
        c = c.replace(/^["'`]+|["'`]+$/g, "");
        c = c
          .replace(/\s+/g, " ")
          .replace(/\s*[,;]\s*/g, ", ")
          .replace(/\s*-\s*/g, "-")
          .replace(/,{2,}/g, ",")
          .replace(/^,|,$/g, "")
          .trim();
        c = c.replace(/^flat\s*-?\s*/i, "");
        return c;
      })
      .filter(Boolean)
      .filter(
        (chunk, idx, arr) =>
          idx === 0 || chunk.toLowerCase() !== arr[idx - 1]!.toLowerCase()
      );

    if (chunks.length > 6) {
      chunks = chunks.slice(0, 6);
    }
    return chunks;
  }

  private _selectAddressLines(chunks: string[]): string[] {
    if (chunks.length === 0) return [];
    const lower = (s: string) => s.toLowerCase();

    const careOfIdx = chunks.findIndex((c) => /\bc\s*\/\s*o\b/i.test(c));
    const careOf = careOfIdx !== -1 ? chunks[careOfIdx] : undefined;

    let locality: string | undefined;
    for (let i = careOfIdx !== -1 ? careOfIdx + 1 : 0; i < chunks.length; i++) {
      const c = chunks[i]!;
      if (/uidai|gov|help@|india|unique|ident/i.test(c)) continue;
      if (!/[A-Za-z]{3,}/.test(c)) continue;
      locality = c.replace(/\s*,\s*$/g, "").trim();
      break;
    }

    const pinChunk = [...chunks].reverse().find((c) => /\b\d{6}\b/.test(c));
    let statePin = pinChunk ? pinChunk : undefined;
    if (statePin) {
      const m = statePin.match(/([A-Za-z][A-Za-z\s\-']{2,}?)[^\d]*\b(\d{6})\b/);
      if (m) statePin = `${m[1]!.trim()} - ${m[2]}`;
    }

    const lines = [careOf, locality, statePin].filter((v): v is string =>
      Boolean(v)
    );
    const dedup: string[] = [];
    for (const l of lines) {
      const cleaned = l.replace(/^[-,\s]+|[-,\s]+$/g, "").trim();
      if (!cleaned) continue;
      if (!dedup.some((x) => lower(x) === lower(cleaned))) dedup.push(cleaned);
    }
    return dedup;
  }

  private _formatStatePinInline(text: string): string {
    return text.replace(
      /([A-Za-z][A-Za-z\s']{2,}?)\s*[—–-]?\s*(\b\d{6}\b)/,
      "$1 - $2"
    );
  }

  private _validateAadhaarNumber(aadhaarNumber: string): ValidationResult {
    try {
      if (!aadhaarNumber) {
        return { isValid: false, error: "Aadhaar number is missing" };
      }
      if (!/^\d{12}$/.test(aadhaarNumber)) {
        return {
          isValid: false,
          error: "Aadhaar number must be exactly 12 digits",
        };
      }
      if (/^(\d)\1{11}$/.test(aadhaarNumber)) {
        return {
          isValid: false,
          error: "Aadhaar number cannot have all identical digits",
        };
      }
      if (/^012345678901$|^123456789012$/.test(aadhaarNumber)) {
        return {
          isValid: false,
          error: "Aadhaar number appears to be sequential",
        };
      }
      return { isValid: true };
    } catch (error) {
      console.error("Aadhaar validation error:", error);
      return { isValid: false, error: "Aadhaar number validation failed" };
    }
  }

  private _validateDOB(dob: string): ValidationResult {
    try {
      if (!dob) {
        return { isValid: false, error: "Date of birth is missing" };
      }
      const dateRegex = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/;
      const match = dob.match(dateRegex);
      if (!match) {
        return {
          isValid: false,
          error: "Invalid date format. Expected DD/MM/YYYY or DD-MM-YYYY",
        };
      }
      const [, day, month, year] = match;
      const dayNum = parseInt(day!);
      const monthNum = parseInt(month!);
      const yearNum = parseInt(year!);
      if (monthNum < 1 || monthNum > 12) {
        return {
          isValid: false,
          error: "Invalid month. Must be between 01-12",
        };
      }
      if (dayNum < 1 || dayNum > 31) {
        return { isValid: false, error: "Invalid day. Must be between 01-31" };
      }
      const date = new Date(yearNum, monthNum - 1, dayNum);
      if (
        date.getFullYear() !== yearNum ||
        date.getMonth() !== monthNum - 1 ||
        date.getDate() !== dayNum
      ) {
        return {
          isValid: false,
          error: "Invalid date. Please check day, month, and year",
        };
      }
      const today = new Date();
      const age = today.getFullYear() - yearNum;
      if (age < 0) {
        return {
          isValid: false,
          error: "Date of birth cannot be in the future",
        };
      }
      if (age > 120) {
        return {
          isValid: false,
          error: "Invalid age. Please check the year of birth",
        };
      }
      if (age < 1) {
        return {
          isValid: true,
          warning: "Very young age detected. Please verify the date of birth",
        };
      }
      return { isValid: true };
    } catch (error) {
      console.error("DOB validation error:", error);
      return { isValid: false, error: "Date of birth validation failed" };
    }
  }

  private _validateName(name: string): ValidationResult {
    try {
      if (!name) {
        return { isValid: false, error: "Name is missing" };
      }
      if (name.length < 2) {
        return {
          isValid: false,
          error: "Name must be at least 2 characters long",
        };
      }
      if (name.length > 50) {
        return {
          isValid: false,
          error: "Name is too long. Maximum 50 characters allowed",
        };
      }
      if (!/^[A-Za-z\s\.\-']+$/.test(name)) {
        return {
          isValid: false,
          error:
            "Name contains invalid characters. Only letters, spaces, dots, hyphens, and apostrophes are allowed",
        };
      }
      if (name.trim().split(/\s+/).length < 2) {
        return {
          isValid: true,
          warning:
            "Name appears to be incomplete. Please ensure both first and last names are captured",
        };
      }
      return { isValid: true };
    } catch (error) {
      console.error("Name validation error:", error);
      return { isValid: false, error: "Name validation failed" };
    }
  }

  private _validateAddress(address: string): ValidationResult {
    try {
      if (!address) {
        return { isValid: false, error: "Address is missing" };
      }
      if (address.length < 10) {
        return {
          isValid: false,
          error:
            "Address is too short. Please ensure complete address is captured",
        };
      }
      if (address.length > 200) {
        return {
          isValid: false,
          error: "Address is too long. Maximum 200 characters allowed",
        };
      }
      const wordCount = address.trim().split(/\s+/).length;
      if (wordCount < 3) {
        return {
          isValid: true,
          warning:
            "Address appears incomplete. Please ensure all address components are captured",
        };
      }
      return { isValid: true };
    } catch (error) {
      console.error("Address validation error:", error);
      return { isValid: false, error: "Address validation failed" };
    }
  }

  private _validateGender(gender: string): ValidationResult {
    try {
      if (!gender) {
        return { isValid: false, error: "Gender is missing" };
      }
      const validGenders = ["Male", "Female", "Other"];
      if (!validGenders.includes(gender)) {
        return {
          isValid: false,
          error: `Invalid gender. Must be one of: ${validGenders.join(", ")}`,
        };
      }
      return { isValid: true };
    } catch (error) {
      console.error("Gender validation error:", error);
      return { isValid: false, error: "Gender validation failed" };
    }
  }

  private _calculateConfidence(
    parsed: ParsedAadhaar,
    rawText: RawText
  ): number {
    let confidence = 0;
    let totalFields = 0;
    if (parsed.aadhaarNumber) {
      confidence += 25;
      totalFields++;
    }
    if (parsed.dob) {
      confidence += 20;
      totalFields++;
    }
    if (parsed.name) {
      confidence += 20;
      totalFields++;
    }
    if (parsed.address) {
      confidence += 20;
      totalFields++;
    }
    if (parsed.gender) {
      confidence += 15;
      totalFields++;
    }
    const totalTextLength = rawText.frontText.length + rawText.backText.length;
    if (totalTextLength > 100) {
      confidence += 5;
    }
    return Math.min(confidence, 100);
  }

  private _extractAadhaarNumber(text: string): string | undefined {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    type Candidate = { value: string; score: number; lineIndex: number };
    const candidates: Candidate[] = [];

    const addCandidate = (raw: string, score: number, lineIndex: number) => {
      const value = raw.replace(/\D/g, "");
      if (value.length !== 12) return;
      const { isValid } = this._validateAadhaarNumber(value);
      if (!isValid) return;
      candidates.push({ value, score, lineIndex });
    };

    lines.forEach((line, i) => {
      if (/[\/-]/.test(line) && /(dob|yob|date)/i.test(line)) return;
      const groupedMatches = line.match(/\b(\d{4}\s\d{4}\s\d{4})\b/g);
      if (groupedMatches) {
        for (const m of groupedMatches) addCandidate(m, 3, i);
      }
      const mixedMatches = line.match(/\b(\d{4}[-_\.\s]\d{4}[-_\.\s]\d{4})\b/g);
      if (mixedMatches) {
        for (const m of mixedMatches) addCandidate(m, 2, i);
      }
      const contiguousMatches = line.match(/\b(\d{12})\b/g);
      if (contiguousMatches) {
        const isSimpleLine =
          /^[\d\s]+$/.test(line) || (!/[a-z]/i.test(line) && line.length <= 20);
        for (const m of contiguousMatches)
          addCandidate(m, isSimpleLine ? 2 : 1, i);
      }
    });

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score || a.lineIndex - b.lineIndex);
      const top = candidates[0];
      return top ? top.value : undefined;
    }

    const justDigits = text.replace(/\D/g, "");
    const match = justDigits.match(/(\d{12})/);
    return match?.[1];
  }

  private _extractDob(text: string): string | undefined {
    const labelDob = text.match(
      /\bdob\s*[:\-]\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
    );
    const raw = labelDob?.[1];
    const candidate = raw || undefined;

    const normalizeDate = (d: string): string | undefined => {
      if (!d) return undefined;
      const parts = d.replace(/-/g, "/").split("/");
      if (parts.length !== 3) return undefined;
      const [day, month, year] = parts as [string, string, string];
      let dd = day;
      let mm = month;
      let yyyy = year;
      if (dd.length === 1) dd = `0${dd}`;
      if (mm.length === 1) mm = `0${mm}`;
      if (yyyy.length === 2) return undefined;
      return `${dd}/${mm}/${yyyy}`;
    };

    const normalized = candidate ? normalizeDate(candidate) : undefined;
    if (normalized) return normalized;

    const dobRegex = /(DOB\s*[:\-]?\s*)(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i;
    const m1 = text.match(dobRegex);
    if (m1 && m1[2]) return normalizeDate(m1[2]);

    const yobRegex = /(YOB|Year\s*of\s*Birth)\s*[:\-]?\s*(\d{4})/i;
    const m2 = text.match(yobRegex);
    if (m2 && m2[2]) return `01/01/${m2[2]}`;
    return undefined;
  }

  private _extractGender(text: string): ParsedAadhaar["gender"] | undefined {
    if (/\bfemale\b/i.test(text)) return "Female";
    if (/\bmale\b/i.test(text)) return "Male";
    if (/\btransgender\b|\bother\b/i.test(text)) return "Other";
    return undefined;
  }

  private _isLikelyName(line: string): boolean {
    if (!line) return false;
    if (line.length < 3) return false;
    const digitsCount = (line.match(/\d/g) || []).length;
    const lettersCount = (line.match(/[A-Za-z]/g) || []).length;
    if (digitsCount > 2 && digitsCount >= lettersCount) return false;
    if (/uidai|gov|help@|india|unique|ident/i.test(line)) return false;
    if (/address|dob|yob|male|female/i.test(line)) return false;
    if (/\bc\s*\/\s*o\b/i.test(line)) return false;
    const letters = line.replace(/[^A-Za-z\s]/g, "");
    return (
      letters.trim().length >=
      Math.min(line.trim().length * 0.8, line.trim().length)
    );
  }

  private _extractName(front: string, back: string): string | undefined {
    const lines = this._normalize(`${front}\n${back}`).split("\n");
    for (const line of lines) {
      if (!this._isLikelyName(line)) continue;
      const tokens = line.split(/\s+/).filter(Boolean);
      const cleanedTokens = tokens.filter(
        (t, idx) => idx === 0 || !/\d/.test(t)
      );
      const candidate = cleanedTokens.join(" ").replace(/\s+/g, " ").trim();
      if (candidate && /[A-Za-z]{3,}/.test(candidate)) return candidate;
    }
    return undefined;
  }

  private _extractAddress(text: string): string | undefined {
    const normalizedText = this._normalizePunctuation(this._normalize(text));
    const lines = normalizedText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let labelIndex = lines.findIndex(
      (l) => /address\s*:?$/i.test(l) || /address\s*:/i.test(l)
    );
    if (labelIndex !== -1) {
      const block: string[] = [];
      for (
        let i = labelIndex + 1;
        i < Math.min(lines.length, labelIndex + 8);
        i++
      ) {
        const l = lines[i]!;
        if (/uidai|gov|help@|india|unique|ident/i.test(l)) break;
        const digitsOnly = l.replace(/\D/g, "");
        if (/(\d{12,})/.test(digitsOnly)) break;
        if (/^\s*$/.test(l)) break;
        const hasLetters = /[A-Za-z]/.test(l);
        if (!hasLetters) continue;
        block.push(l);
      }
      let candidate = block.join(", ");
      candidate = this._formatStatePinInline(candidate);
      const chunks = this._cleanAddressChunks(candidate);
      const linesOut = this._selectAddressLines(chunks);
      if (linesOut.length > 0) return linesOut.join("\n");
    }

    const filtered = lines.filter((l) => {
      if (/uidai|gov|help@|india|unique|ident/i.test(l)) return false;
      const digitsOnly = l.replace(/\D/g, "");
      if (/(\d{12,})/.test(digitsOnly)) return false;
      const letters = (l.match(/[A-Za-z]/g) || []).length;
      const nonLetters = l.length - letters;
      if (letters === 0 || nonLetters > letters * 2) return false;
      return true;
    });

    let bestBlock = "";
    let current: string[] = [];
    const flush = () => {
      if (current.length >= 2 && current.length <= 6) {
        const block = current.join(", ");
        if (block.length > bestBlock.length) bestBlock = block;
      }
      current = [];
    };
    for (const l of filtered) {
      if (/[A-Za-z]/.test(l)) {
        current.push(l);
      } else {
        flush();
      }
    }
    flush();
    const chunks = this._cleanAddressChunks(
      this._formatStatePinInline(bestBlock)
    );
    const linesOut = this._selectAddressLines(chunks);
    const cleanedJoined = linesOut.join("\n");
    const sanitized = cleanedJoined
      ? this._sanitizeAddressHead(cleanedJoined)
      : "";
    return sanitized || undefined;
  }

  public parseAadhaarText(frontText: string, backText: string): ParsedAadhaar {
    const normalizedFront = this._normalize(frontText);
    const normalizedBack = this._normalize(backText);
    const combined = `${normalizedFront}\n${normalizedBack}`;

    const aadhaarNumber = this._extractAadhaarNumber(combined);
    const dob = this._extractDob(combined);
    const gender = this._extractGender(combined);
    const name = this._extractName(normalizedFront, normalizedBack);
    const address = this._extractAddress(combined);

    const result: ParsedAadhaar = {};
    if (aadhaarNumber) result.aadhaarNumber = aadhaarNumber;
    if (dob) result.dob = dob;
    if (gender) result.gender = gender;
    if (name) result.name = name;
    if (address) result.address = this._sanitizeAddressHead(address);
    return result;
  }

  public parseAadhaarTextWithValidation(
    frontText: string,
    backText: string
  ): ParsedAadhaarWithValidation {
    try {
      const normalizedFront = this._normalize(frontText);
      const normalizedBack = this._normalize(backText);
      const rawText: RawText = {
        frontText: normalizedFront,
        backText: normalizedBack,
      };
      const combined = `${normalizedFront}\n${normalizedBack}`;

      const aadhaarNumber = this._extractAadhaarNumber(combined);
      const dob = this._extractDob(combined);
      const gender = this._extractGender(combined);
      const name = this._extractName(normalizedFront, normalizedBack);
      const address = this._extractAddress(combined);

      const parsed: ParsedAadhaar = {};
      if (aadhaarNumber) parsed.aadhaarNumber = aadhaarNumber;
      if (dob) parsed.dob = dob;
      if (gender) parsed.gender = gender;
      if (name) parsed.name = name;
      if (address) parsed.address = this._sanitizeAddressHead(address);

      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      if (aadhaarNumber) {
        const aadhaarValidation = this._validateAadhaarNumber(aadhaarNumber);
        if (!aadhaarValidation.isValid) {
          errors.push(aadhaarValidation.error!);
        }
      } else {
        errors.push("Aadhaar number not found in the provided images");
        suggestions.push(
          "Ensure the front side of the Aadhaar card is clearly visible and not blurry"
        );
      }

      if (dob) {
        const dobValidation = this._validateDOB(dob);
        if (!dobValidation.isValid) {
          errors.push(dobValidation.error!);
        } else if (dobValidation.warning) {
          warnings.push(dobValidation.warning);
        }
      } else {
        errors.push("Date of birth not found in the provided images");
        suggestions.push(
          "Ensure the front side of the Aadhaar card is clearly visible and the DOB section is not covered"
        );
      }

      if (name) {
        const nameValidation = this._validateName(name);
        if (!nameValidation.isValid) {
          errors.push(nameValidation.error!);
        } else if (nameValidation.warning) {
          warnings.push(nameValidation.warning);
        }
      } else {
        errors.push("Name not found in the provided images");
        suggestions.push(
          "Ensure the front side of the Aadhaar card is clearly visible and the name section is not covered"
        );
      }

      if (address) {
        const addressValidation = this._validateAddress(address);
        if (!addressValidation.isValid) {
          errors.push(addressValidation.error!);
        } else if (addressValidation.warning) {
          warnings.push(addressValidation.warning);
        }
      } else {
        errors.push("Address not found in the provided images");
        suggestions.push(
          "Ensure the back side of the Aadhaar card is clearly visible and the address section is not covered"
        );
      }

      if (gender) {
        const genderValidation = this._validateGender(gender);
        if (!genderValidation.isValid) {
          errors.push(genderValidation.error!);
        }
      } else {
        warnings.push("Gender not found in the provided images");
        suggestions.push(
          "Ensure the front side of the Aadhaar card is clearly visible and the gender section is not covered"
        );
      }

      if (errors.length > 2) {
        suggestions.push(
          "The image quality might be poor. Try taking a clearer photo with good lighting"
        );
        suggestions.push(
          "Ensure the entire Aadhaar card is visible in the frame"
        );
        suggestions.push("Avoid shadows, glare, or reflections on the card");
      }

      const confidence = this._calculateConfidence(parsed, rawText);
      const isValid = errors.length === 0;

      return {
        ...parsed,
        validation: {
          isValid,
        },
        rawText,
      };
    } catch (error) {
      console.error("Validation parsing error:", error);
      return {
        validation: {
          isValid: false,
          error: "Please try again with clearer images",
        },
        rawText: { frontText, backText },
      };
    }
  }
}

export default AadhaarParser;
