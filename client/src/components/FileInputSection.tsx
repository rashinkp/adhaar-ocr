import FileUpload from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const FileInputSection = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);

  const onClick = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 20000);
  };

  const isButtonDisabled = isProcessing || !file1 || !file2;
  const buttonLabel = isProcessing ? "Processing.." : "Start OCR Processing";

  return (
    <>
      <div className="container mx-auto p-8 flex flex-col items-center space-y-6">
        <div className="space-x-6">
          <FileUpload file={file1} setFile={setFile1} disabled={isProcessing} />
          <FileUpload file={file2} setFile={setFile2} disabled={isProcessing} />
        </div>
        <Button onClick={onClick} disabled={isButtonDisabled}>
          {buttonLabel}
        </Button>
      </div>
    </>
  );
};

export default FileInputSection;
