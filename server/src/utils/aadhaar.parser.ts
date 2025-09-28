import type { AadhaarDto } from "../dto/aadhaar.dto.js";

export type ParsedAadhaarData = Partial<AadhaarDto>;

const normalize = (text: string): string => {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join("\n");
};

const normalizePunctuation = (text: string): string => {
  return text
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'") 
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"') 
    .replace(/[\u2012\u2013\u2014\u2015\u2212]/g, "-") 
    .replace(/[\u00A0\u2000-\u200B]/g, " ") 
    .replace(/[\u20AC-\u20CF]/g, " ") 
    .replace(/[\u02C6\u02DC\u02DD]/g, " ");
};

const validateAadhaarNumber = (aadhaarNumber: string): { isValid: boolean; error?: string } => {
  try {
    if (!aadhaarNumber) {
      return { isValid: false, error: "Aadhaar number is missing" };
    }
    
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return { isValid: false, error: "Aadhaar number must be exactly 12 digits" };
    }
    
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

const extractAadhaarNumber = (text: string): string | undefined => {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  type Candidate = { value: string; score: number; lineIndex: number };
  const candidates: Candidate[] = [];

  const addCandidate = (raw: string, score: number, lineIndex: number) => {
    const value = raw.replace(/\D/g, "");
    if (value.length !== 12) return;
    const { isValid } = validateAadhaarNumber(value);
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
      const isSimpleLine = /^[\d\s]+$/.test(line) || (!/[a-z]/i.test(line) && line.length <= 20);
      for (const m of contiguousMatches) addCandidate(m, isSimpleLine ? 2 : 1, i);
    }
  });

  if (candidates.length > 0) {
    candidates.sort((a, b) => (b.score - a.score) || (a.lineIndex - b.lineIndex));
    const top = candidates[0];
    return top ? top.value : undefined;
  }

  const justDigits = text.replace(/\D/g, "");
  const match = justDigits.match(/(\d{12})/);
  return match?.[1];
};

const extractDob = (text: string): string | undefined => {
  const labelDob = text.match(/\bdob\s*[:\-]\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
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
    if (yyyy.length === 2) {
      return undefined;
    }
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
};

const extractGender = (text: string): "Male" | "Female" | "Other" | undefined => {
  if (/\bfemale\b/i.test(text)) return "Female";
  if (/\bmale\b/i.test(text)) return "Male";
  if (/\btransgender\b|\bother\b/i.test(text)) return "Other";
  return undefined;
};

const isLikelyName = (line: string): boolean => {
  if (!line) return false;
  if (line.length < 3) return false;
  const digitsCount = (line.match(/\d/g) || []).length;
  const lettersCount = (line.match(/[A-Za-z]/g) || []).length;
  if (digitsCount > 2 && digitsCount >= lettersCount) return false;
  if (/uidai|gov|help@|india|unique|ident/i.test(line)) return false;
  if (/address|dob|yob|male|female/i.test(line)) return false;
  if (/\bc\s*\/\s*o\b/i.test(line)) return false;
  const letters = line.replace(/[^A-Za-z\s]/g, "");
  return letters.trim().length >= Math.min(line.trim().length * 0.8, line.trim().length);
};

const extractName = (front: string, back: string): string | undefined => {
  const lines = normalize(`${front}\n${back}`).split("\n");
  for (const line of lines) {
    if (!isLikelyName(line)) continue;
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

  let labelIndex = lines.findIndex((l) => /address\s*:?$/i.test(l) || /address\s*:/i.test(l));
  if (labelIndex !== -1) {
    const block: string[] = [];
    for (let i = labelIndex + 1; i < Math.min(lines.length, labelIndex + 8); i++) {
      const l = lines[i]!;
      if (/uidai|gov|help@|india|unique|ident/i.test(l)) break;
      const digitsOnly = l.replace(/\D/g, "");
      if (/(\d{12,})/.test(digitsOnly)) break;
      if (/^\s*$/.test(l)) break;
      const hasLetters = /[A-Za-z]/.test(l);
      if (!hasLetters) continue;
      block.push(l);
    }
    if (block.length > 0) return block.join(", ");
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
  
  return bestBlock || undefined;
};

export const parseAadhaarText = (frontText: string, backText: string): ParsedAadhaarData => {
  const normalizedFront = normalize(frontText);
  const normalizedBack = normalize(backText);
  const combined = `${normalizedFront}\n${normalizedBack}`;

  const aadhaarNumber = extractAadhaarNumber(combined);
  const dob = extractDob(combined);
  const gender = extractGender(combined);
  const name = extractName(normalizedFront, normalizedBack);
  const address = extractAddress(combined);

  const result: ParsedAadhaarData = {};
  if (aadhaarNumber) result.aadhaarNumber = aadhaarNumber;
  if (dob) result.dob = dob;
  if (gender) result.gender = gender;
  if (name) result.name = name;
  if (address) result.address = address;
  
  return result;
};