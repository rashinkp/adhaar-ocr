import api from '@/services/api';

export const uploadAadhaarImages = async(formData: FormData) => {
  return api.post("/ocr", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const searchAadhaar = async (aadhaarNumber: string, dob: string) => {
  const response = await api.get("/search", {
    params: { aadhaarNumber, dob },
  });
  return response.data;
};