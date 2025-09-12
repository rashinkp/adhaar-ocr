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
        <div className="gap-4">
          <FileUpload file={file1} setFile={setFile1} disabled={isProcessing} />
          <FileUpload file={file2} setFile={setFile2} disabled={isProcessing} />
        </div>
        <Button onClick={onClick} disabled={isButtonDisabled} className="w-full sm:w-auto sm:self-start">
          {buttonLabel}
        </Button>
      </div>
    </>
  );
};

export default FileInputSection;
