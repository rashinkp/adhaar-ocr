import api from '@/services/api';

export const uploadAadhaarImages = (formData: FormData) => {
  return api.post("/ocr", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const searchAadhaar = (aadhaarNumber: string, dob: string) => {
  return api.get("/search", {
    params: { aadhaarNumber, dob },
  });
};