export interface FileInputSectionProps {
  isProcessing: boolean;
  onStartProcessing: (frontFile: File, backFile: File) => void;
}