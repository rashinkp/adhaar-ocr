import type { AadhaarData } from "./adhaar";


export interface UserDetailsDisplayProps {
  data?: AadhaarData | null;
  isProcessing?: boolean;
}
