export const API_PREFIX = "/api";

export const Routes = {
  HEALTH: "/health",

  AADHAAR: {
    BASE: `${API_PREFIX}`,
    OCR: `${API_PREFIX}/ocr`,
    SEARCH: `${API_PREFIX}/search`,
    RECORDS: `${API_PREFIX}/records`,
    RECORD_BY_ID: (aadhaarNumber: string) => `${API_PREFIX}/records/${aadhaarNumber}`,
  },
} as const;

export type RoutePath = typeof Routes[keyof typeof Routes];

