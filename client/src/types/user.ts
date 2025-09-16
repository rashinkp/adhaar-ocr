import type { AadhaarData, AadhaarResponse } from "./adhaar";

export interface UserDetailsDisplayProps {
  data?: AadhaarData | null;
  isProcessing?: boolean;
  response?: AadhaarResponse | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  onFetchByAadhaarDob?: (aadhaar: string, dob: string) => void;
}
