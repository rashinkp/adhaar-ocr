export interface NumberInputSectionProps { 
  isSubmitting: boolean;
  onSubmit: (aadhaar: string, dob: Date) => void;
}

export type FormValues = {
  aadhaar: string;
  dob: Date | undefined;
};
