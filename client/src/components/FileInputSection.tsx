import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import type { FileInputSectionProps } from "@/types/file";
import { useState } from "react";



const FileInputSection = ({ isProcessing, onStartProcessing }: FileInputSectionProps) => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);

  const onClick = () => {
    if (file1 && file2) {
      onStartProcessing(file1, file2);
    }
  };

  const isButtonDisabled = isProcessing || !file1 || !file2;
  const buttonLabel = isProcessing ? "Processing.." : "Start OCR Processing";

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Front Side of Aadhaar Card
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Upload the front side containing your photo, name, DOB, and Aadhaar number
            </p>
            <FileUpload file={file1} setFile={setFile1} disabled={isProcessing} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Back Side of Aadhaar Card
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Upload the back side containing your address
            </p>
            <FileUpload file={file2} setFile={setFile2} disabled={isProcessing} />
          </div>
        </div>
        
        <div className="space-y-2">
          <Button onClick={onClick} disabled={isButtonDisabled} className="w-full sm:w-auto sm:self-start">
            {buttonLabel}
          </Button>
          {!file1 || !file2 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Please upload both front and back images to proceed
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default FileInputSection;
