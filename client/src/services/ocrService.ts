import api from '@/services/api';
import type { AadhaarResponse, AadhaarData } from '@/types/adhaar';

type OcrBackendPayload = {
  data?: AadhaarData;
  parsed?: Partial<AadhaarData>;
  ocrText?: { frontText: string; backText: string };
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export const uploadAadhaarImages = async (formData: FormData): Promise<AadhaarResponse> => {
  const response = await api.post("/ocr", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // Backend returns ApiResponse<{ data, ocrText, parsed }>
  const r: ApiResponse<OcrBackendPayload> = response.data as ApiResponse<OcrBackendPayload>;
  const payload: OcrBackendPayload = r?.data ?? {};

  const normalized: AadhaarResponse = {
    success: Boolean(r?.success),
    message: r?.message,
    data: payload?.data, // use only typed AadhaarData when present
    parsed: payload?.parsed,
    rawText: payload?.ocrText,
  };

  return normalized;
};

export const searchAadhaar = async (aadhaarNumber: string, dob: string): Promise<AadhaarResponse> => {
  const response = await api.get("/search", {
    params: { aadhaarNumber, dob },
  });

  // Backend returns ApiResponse<AadhaarData>
  const r: ApiResponse<AadhaarData> = response.data as ApiResponse<AadhaarData>;
  const normalized: AadhaarResponse = {
    success: Boolean(r?.success),
    message: r?.message,
    data: r?.data,
  };

  return normalized;
};