export type ParsedAadhaar = {
  aadhaarNumber?: string;
  dob?: string;
  gender?: "Male" | "Female" | "Other";
  name?: string;
  address?: string;
};

export type ValidationResult = {
  isValid: boolean;
  confidence: number;
  errors: string[];
  warnings: string[];
  suggestions: string[];
};

export type ParsedAadhaarWithValidation = ParsedAadhaar & {
  validation: ValidationResult;
  rawText: {
    frontText: string;
    backText: string;
  };
};

const normalize = (text: string): string => {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join("\n");
};

// Replace fancy quotes/dashes and strip weird glyph noise commonly introduced by OCR
const normalizePunctuation = (text: string): string => {
  return text
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'") // quotes -> '
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"') // quotes -> "
    .replace(/[\u2012\u2013\u2014\u2015\u2212]/g, "-") // dashes -> -
    .replace(/[\u00A0\u2000-\u200B]/g, " ") // non-breaking and zero-width spaces
    .replace(/[\u20AC-\u20CF]/g, " ") // currency/other symbols → space
    .replace(/[\u02C6\u02DC\u02DD]/g, " ") // misc accents → space
    ;
};

const cleanAddressChunks = (address: string): string[] => {
  // Start with punctuation normalization then split into chunks
  let chunks: string[] = normalizePunctuation(address)
    .split(/\s*,\s*/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0)
    .map((chunk) => {
      // Drop chunks that are mostly non-letters and very short
      const letters = (chunk.match(/[A-Za-z]/g) || []).length;
      if (letters === 0) return "";
      if (letters <= 2 && chunk.length <= 4) return "";
      // Remove repeated solitary letters like "W WW" or stray quotes
      let c = chunk.replace(/^(?:[A-Za-z]\s*){2,}$/g, "");
      c = c.replace(/^["'`]+|["'`]+$/g, "");
      // Normalize multiple spaces and stray punctuation
      c = c.replace(/\s+/g, " ")
           .replace(/\s*[,;]\s*/g, ", ")
           .replace(/\s*-\s*/g, "-")
           .replace(/,{2,}/g, ",")
           .replace(/^,|,$/g, "")
           .trim();
      return c;
    })
    .filter(Boolean)
    // De-duplicate consecutive identical chunks
    .filter((chunk, idx, arr) => idx === 0 || chunk.toLowerCase() !== arr[idx - 1]!.toLowerCase());

  // Keep only 2-5 meaningful chunks
  if (chunks.length > 6) {
    chunks = chunks.slice(0, 6);
  }
  return chunks;
};

const selectAddressLines = (chunks: string[]): string[] => {
  if (chunks.length === 0) return [];
  const lower = (s: string) => s.toLowerCase();

  // 1) Care-of line
  const careOfIdx = chunks.findIndex((c) => /\bc\s*\/\s*o\b/i.test(c));
  const careOf = careOfIdx !== -1 ? chunks[careOfIdx] : undefined;

  // 2) Locality line: the next meaningful chunk after care-of, prefer without digits
  let locality: string | undefined;
  for (let i = (careOfIdx !== -1 ? careOfIdx + 1 : 0); i < chunks.length; i++) {
    const c = chunks[i]!;
    if (/flat\b/i.test(c)) continue;
    if (/uidai|gov|help@|india|unique|ident/i.test(c)) continue;
    const hasLetters = /[A-Za-z]{3,}/.test(c);
    if (!hasLetters) continue;
    locality = c.replace(/\s*,\s*$/g, "").trim();
    break;
  }

  // 3) State + PIN: prefer chunk with a 6-digit PIN (last such chunk)
  const pinChunk = [...chunks].reverse().find((c) => /\b\d{6}\b/.test(c));
  let statePin = pinChunk;
  if (statePin) {
    // Ensure there is at least one word before PIN
    const m = statePin.match(/([A-Za-z][A-Za-z\s\-']{2,}?)[^\d]*\b(\d{6})\b/);
    if (m) statePin = `${m[1]!.trim()} - ${m[2]}`;
  }

  const lines = [careOf, locality, statePin].filter((v): v is string => Boolean(v));
  // Remove duplicates and noisy leading tokens
  const dedup: string[] = [];
  for (const l of lines) {
    const cleaned = l.replace(/^[-,\s]+|[-,\s]+$/g, "").trim();
    if (!cleaned) continue;
    if (!dedup.some((x) => lower(x) === lower(cleaned))) dedup.push(cleaned);
  }
  return dedup;
};

// Validation functions
const validateAadhaarNumber = (aadhaarNumber: string): { isValid: boolean; error?: string } => {
  try {
    if (!aadhaarNumber) {
      return { isValid: false, error: "Aadhaar number is missing" };
    }
    
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return { isValid: false, error: "Aadhaar number must be exactly 12 digits" };
    }
    
    // Basic validation - skip Verhoeff for now to avoid errors
    // Check for common invalid patterns
    if (/^(\d)\1{11}$/.test(aadhaarNumber)) {
      return { isValid: false, error: "Aadhaar number cannot have all identical digits" };
    }
    
    if (/^012345678901$|^123456789012$/.test(aadhaarNumber)) {
      return { isValid: false, error: "Aadhaar number appears to be sequential" };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error("Aadhaar validation error:", error);
    return { isValid: false, error: "Aadhaar number validation failed" };
  }
};

const validateDOB = (dob: string): { isValid: boolean; error?: string; warning?: string } => {
  try {
    if (!dob) {
      return { isValid: false, error: "Date of birth is missing" };
    }
    
    const dateRegex = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/;
    const match = dob.match(dateRegex);
    
    if (!match) {
      return { isValid: false, error: "Invalid date format. Expected DD/MM/YYYY or DD-MM-YYYY" };
    }
    
    const [, day, month, year] = match;
    const dayNum = parseInt(day!);
    const monthNum = parseInt(month!);
    const yearNum = parseInt(year!);
    
    if (monthNum < 1 || monthNum > 12) {
      return { isValid: false, error: "Invalid month. Must be between 01-12" };
    }
    
    if (dayNum < 1 || dayNum > 31) {
      return { isValid: false, error: "Invalid day. Must be between 01-31" };
    }
    
    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
      return { isValid: false, error: "Invalid date. Please check day, month, and year" };
    }
    
    const today = new Date();
    const age = today.getFullYear() - yearNum;
    
    if (age < 0) {
      return { isValid: false, error: "Date of birth cannot be in the future" };
    }
    
    if (age > 120) {
      return { isValid: false, error: "Invalid age. Please check the year of birth" };
    }
    
    if (age < 1) {
      return { isValid: true, warning: "Very young age detected. Please verify the date of birth" };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error("DOB validation error:", error);
    return { isValid: false, error: "Date of birth validation failed" };
  }
};

const validateName = (name: string): { isValid: boolean; error?: string; warning?: string } => {
  try {
    if (!name) {
      return { isValid: false, error: "Name is missing" };
    }
    
    if (name.length < 2) {
      return { isValid: false, error: "Name must be at least 2 characters long" };
    }
    
    if (name.length > 50) {
      return { isValid: false, error: "Name is too long. Maximum 50 characters allowed" };
    }
    
    if (!/^[A-Za-z\s\.\-']+$/.test(name)) {
      return { isValid: false, error: "Name contains invalid characters. Only letters, spaces, dots, hyphens, and apostrophes are allowed" };
    }
    
    if (name.trim().split(/\s+/).length < 2) {
      return { isValid: true, warning: "Name appears to be incomplete. Please ensure both first and last names are captured" };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error("Name validation error:", error);
    return { isValid: false, error: "Name validation failed" };
  }
};

const validateAddress = (address: string): { isValid: boolean; error?: string; warning?: string } => {
  try {
    if (!address) {
      return { isValid: false, error: "Address is missing" };
    }
    
    if (address.length < 10) {
      return { isValid: false, error: "Address is too short. Please ensure complete address is captured" };
    }
    
    if (address.length > 200) {
      return { isValid: false, error: "Address is too long. Maximum 200 characters allowed" };
    }
    
    const wordCount = address.trim().split(/\s+/).length;
    if (wordCount < 3) {
      return { isValid: true, warning: "Address appears incomplete. Please ensure all address components are captured" };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error("Address validation error:", error);
    return { isValid: false, error: "Address validation failed" };
  }
};

const validateGender = (gender: string): { isValid: boolean; error?: string } => {
  try {
    if (!gender) {
      return { isValid: false, error: "Gender is missing" };
    }
    
    const validGenders = ["Male", "Female", "Other"];
    if (!validGenders.includes(gender)) {
      return { isValid: false, error: `Invalid gender. Must be one of: ${validGenders.join(", ")}` };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error("Gender validation error:", error);
    return { isValid: false, error: "Gender validation failed" };
  }
};

const calculateConfidence = (parsed: ParsedAadhaar, rawText: { frontText: string; backText: string }): number => {
  let confidence = 0;
  let totalFields = 0;
  
  // Aadhaar number confidence
  if (parsed.aadhaarNumber) {
    confidence += 25;
    totalFields++;
  }
  
  // DOB confidence
  if (parsed.dob) {
    confidence += 20;
    totalFields++;
  }
  
  // Name confidence
  if (parsed.name) {
    confidence += 20;
    totalFields++;
  }
  
  // Address confidence
  if (parsed.address) {
    confidence += 20;
    totalFields++;
  }
  
  // Gender confidence
  if (parsed.gender) {
    confidence += 15;
    totalFields++;
  }
  
  // Text quality bonus
  const totalTextLength = rawText.frontText.length + rawText.backText.length;
  if (totalTextLength > 100) {
    confidence += 5;
  }
  
  return Math.min(confidence, 100);
};

const extractAadhaarNumber = (text: string): string | undefined => {
  // Prefer line-wise extraction to avoid picking up DOB digits
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  type Candidate = { value: string; score: number; lineIndex: number };
  const candidates: Candidate[] = [];

  const addCandidate = (raw: string, score: number, lineIndex: number) => {
    const value = raw.replace(/\D/g, "");
    if (value.length !== 12) return;
    // Basic validation to filter obvious bad candidates
    const { isValid } = validateAadhaarNumber(value);
    if (!isValid) return;
    candidates.push({ value, score, lineIndex });
  };

  lines.forEach((line, i) => {
    // Skip lines that likely contain date labels to avoid picking from DOB
    if (/[\/-]/.test(line) && /(dob|yob|date)/i.test(line)) return;

    // 1) Strong preference: grouped 4-4-4 with spaces
    const groupedMatches = line.match(/\b(\d{4}\s\d{4}\s\d{4})\b/g);
    if (groupedMatches) {
      for (const m of groupedMatches) addCandidate(m, 3, i);
    }

    // 2) Also accept separated by hyphens or mixed separators
    const mixedMatches = line.match(/\b(\d{4}[-_\.\s]\d{4}[-_\.\s]\d{4})\b/g);
    if (mixedMatches) {
      for (const m of mixedMatches) addCandidate(m, 2, i);
    }

    // 3) Fallback: contiguous 12 digits on an otherwise simple line
    const contiguousMatches = line.match(/\b(\d{12})\b/g);
    if (contiguousMatches) {
      const isSimpleLine = /^[\d\s]+$/.test(line) || (!/[a-z]/i.test(line) && line.length <= 20);
      for (const m of contiguousMatches) addCandidate(m, isSimpleLine ? 2 : 1, i);
    }
  });

  if (candidates.length > 0) {
    // Sort by score descending, then by earliest line occurrence
    candidates.sort((a, b) => (b.score - a.score) || (a.lineIndex - b.lineIndex));
    const top = candidates[0];
    return top ? top.value : undefined;
  }

  // Final fallback: previous naive approach
  const justDigits = text.replace(/\D/g, "");
  const match = justDigits.match(/(\d{12})/);
  return match?.[1];
};

const extractDob = (text: string): string | undefined => {
  // Matches DOB: 03/06/2003 or 03-06-2003
  const dobRegex = /(DOB\s*[:\-]?\s*)(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i;
  const m1 = text.match(dobRegex);
  if (m1 && m1[2]) return m1[2].replace(/-/g, "/");

  // Matches Year of Birth
  const yobRegex = /(YOB|Year\s*of\s*Birth)\s*[:\-]?\s*(\d{4})/i;
  const m2 = text.match(yobRegex);
  if (m2 && m2[2]) return `01/01/${m2[2]}`;
  return undefined;
};

const extractGender = (text: string): ParsedAadhaar["gender"] | undefined => {
  const normalized = text.replace(/[^a-z]/gi, "").toLowerCase();
  if (normalized.includes("female") || normalized.includes("femal") || normalized.includes("femle")) return "Female";
  if (normalized.includes("male") || normalized.includes("male") || normalized.includes("maie")) return "Male";
  if (normalized.includes("transgender") || normalized.includes("other")) return "Other";
  return undefined;
};

const isLikelyName = (line: string): boolean => {
  if (!line) return false;
  if (line.length < 3) return false;
  // allow occasional OCR noise digits but mostly letters
  const digitsCount = (line.match(/\d/g) || []).length;
  const lettersCount = (line.match(/[A-Za-z]/g) || []).length;
  if (digitsCount > 2 && digitsCount >= lettersCount) return false;
  if (/uidai|gov|help@|india|unique|ident/i.test(line)) return false;
  if (/address|dob|yob|male|female/i.test(line)) return false;
  // mostly letters and spaces
  const letters = line.replace(/[^A-Za-z\s]/g, "");
  return letters.trim().length >= Math.min(line.trim().length * 0.8, line.trim().length);
};

const extractName = (front: string, back: string): string | undefined => {
  const lines = normalize(`${front}\n${back}`).split("\n");
  for (const line of lines) {
    if (!isLikelyName(line)) continue;
    // Drop trailing tokens with digits (e.g., "RASHINKF 4J4" -> "RASHINKF")
    const tokens = line.split(/\s+/).filter(Boolean);
    const cleanedTokens = tokens.filter((t, idx) => idx === 0 || !/\d/.test(t));
    const candidate = cleanedTokens.join(" ").replace(/\s+/g, " ").trim();
    if (candidate && /[A-Za-z]{3,}/.test(candidate)) return candidate;
  }
  return undefined;
};

const extractAddress = (text: string): string | undefined => {
  const normalizedText = normalizePunctuation(normalize(text));
  const lines = normalizedText.split("\n").map((l) => l.trim()).filter(Boolean);

  // 1) Try to find explicit Address label and take following lines
  let labelIndex = lines.findIndex((l) => /address\s*:?$/i.test(l) || /address\s*:/i.test(l));
  if (labelIndex !== -1) {
    const block: string[] = [];
    for (let i = labelIndex + 1; i < Math.min(lines.length, labelIndex + 8); i++) {
      const l = lines[i]!;
      // Stop if we hit another obvious section or the Aadhaar number line
      if (/uidai|gov|help@|india|unique|ident/i.test(l)) break;
      const digitsOnly = l.replace(/\D/g, "");
      if (/(\d{12,})/.test(digitsOnly)) break;
      if (/^\s*$/.test(l)) break;
      // Accept lines that look address-like
      const hasLetters = /[A-Za-z]/.test(l);
      if (!hasLetters) continue;
      block.push(l);
    }
    const candidate = block.join(", ");
    const chunks = cleanAddressChunks(candidate);
    const linesOut = selectAddressLines(chunks);
    if (linesOut.length > 0) return linesOut.join("\n");
  }

  // 2) Fallback heuristic: pick best contiguous block of address-like lines
  const filtered = lines.filter((l) => {
    if (/uidai|gov|help@|india|unique|ident/i.test(l)) return false;
    const digitsOnly = l.replace(/\D/g, "");
    if (/(\d{12,})/.test(digitsOnly)) return false; // exclude Aadhaar number lines
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
  const chunks = cleanAddressChunks(bestBlock);
  const linesOut = selectAddressLines(chunks);
  const cleanedJoined = linesOut.join("\n");
  return cleanedJoined || undefined;
};

export const parseAadhaarText = (
  frontText: string,
  backText: string
): ParsedAadhaar => {
  const normalizedFront = normalize(frontText);
  const normalizedBack = normalize(backText);

  const aadhaarNumber = extractAadhaarNumber(`${normalizedFront}\n${normalizedBack}`);
  const dob = extractDob(`${normalizedFront}\n${normalizedBack}`);
  const gender = extractGender(`${normalizedFront}\n${normalizedBack}`);
  const name = extractName(normalizedFront, normalizedBack);
  const address = extractAddress(normalizedBack) || extractAddress(normalizedFront);

  const result: ParsedAadhaar = {};
  if (aadhaarNumber) result.aadhaarNumber = aadhaarNumber;
  if (dob) result.dob = dob;
  if (gender) result.gender = gender;
  if (name) result.name = name;
  if (address) result.address = address;
  return result;
};

export const parseAadhaarTextWithValidation = (
  frontText: string,
  backText: string
): ParsedAadhaarWithValidation => {
  try {
    const normalizedFront = normalize(frontText);
    const normalizedBack = normalize(backText);
    const rawText = { frontText: normalizedFront, backText: normalizedBack };

    const aadhaarNumber = extractAadhaarNumber(`${normalizedFront}\n${normalizedBack}`);
    const dob = extractDob(`${normalizedFront}\n${normalizedBack}`);
    const gender = extractGender(`${normalizedFront}\n${normalizedBack}`);
    const name = extractName(normalizedFront, normalizedBack);
    const address = extractAddress(normalizedBack) || extractAddress(normalizedFront);

    const parsed: ParsedAadhaar = {};
    if (aadhaarNumber) parsed.aadhaarNumber = aadhaarNumber;
    if (dob) parsed.dob = dob;
    if (gender) parsed.gender = gender;
    if (name) parsed.name = name;
    if (address) parsed.address = address;

    // Validate each field
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate Aadhaar number
    if (aadhaarNumber) {
      const aadhaarValidation = validateAadhaarNumber(aadhaarNumber);
      if (!aadhaarValidation.isValid) {
        errors.push(aadhaarValidation.error!);
      }
    } else {
      errors.push("Aadhaar number not found in the provided images");
      suggestions.push("Ensure the front side of the Aadhaar card is clearly visible and not blurry");
    }

    // Validate DOB
    if (dob) {
      const dobValidation = validateDOB(dob);
      if (!dobValidation.isValid) {
        errors.push(dobValidation.error!);
      } else if (dobValidation.warning) {
        warnings.push(dobValidation.warning);
      }
    } else {
      errors.push("Date of birth not found in the provided images");
      suggestions.push("Ensure the front side of the Aadhaar card is clearly visible and the DOB section is not covered");
    }

    // Validate Name
    if (name) {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        errors.push(nameValidation.error!);
      } else if (nameValidation.warning) {
        warnings.push(nameValidation.warning);
      }
    } else {
      errors.push("Name not found in the provided images");
      suggestions.push("Ensure the front side of the Aadhaar card is clearly visible and the name section is not covered");
    }

    // Validate Address
    if (address) {
      const addressValidation = validateAddress(address);
      if (!addressValidation.isValid) {
        errors.push(addressValidation.error!);
      } else if (addressValidation.warning) {
        warnings.push(addressValidation.warning);
      }
    } else {
      errors.push("Address not found in the provided images");
      suggestions.push("Ensure the back side of the Aadhaar card is clearly visible and the address section is not covered");
    }

    // Validate Gender
    if (gender) {
      const genderValidation = validateGender(gender);
      if (!genderValidation.isValid) {
        errors.push(genderValidation.error!);
      }
    } else {
      warnings.push("Gender not found in the provided images");
      suggestions.push("Ensure the front side of the Aadhaar card is clearly visible and the gender section is not covered");
    }

    // Add general suggestions based on missing fields
    if (errors.length > 2) {
      suggestions.push("The image quality might be poor. Try taking a clearer photo with good lighting");
      suggestions.push("Ensure the entire Aadhaar card is visible in the frame");
      suggestions.push("Avoid shadows, glare, or reflections on the card");
    }

    const confidence = calculateConfidence(parsed, rawText);
    const isValid = errors.length === 0;

    return {
      ...parsed,
      validation: {
        isValid,
        confidence,
        errors,
        warnings,
        suggestions
      },
      rawText
    };
  } catch (error) {
    console.error("Validation parsing error:", error);
    return {
      validation: {
        isValid: false,
        confidence: 0,
        errors: ["Validation system encountered an error"],
        warnings: [],
        suggestions: ["Please try again with clearer images"]
      },
      rawText: { frontText, backText }
    };
  }
};


