"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, UploadCloud } from "lucide-react";

interface FileUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
  disabled?: boolean;
}

const FileUpload = ({ file, setFile, disabled = false }: FileUploadProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Check image quality by analyzing pixel data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Simple quality check - count non-white pixels
          let nonWhitePixels = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const alpha = data[i + 3];
            
            // Check if pixel is not white/transparent
            if (alpha > 0 && !(r > 240 && g > 240 && b > 240)) {
              nonWhitePixels++;
            }
          }
          
          // If less than 10% of pixels are non-white, image might be blank
          const quality = nonWhitePixels / (canvas.width * canvas.height);
          resolve(quality > 0.1);
        } else {
          resolve(false);
        }
      };
      
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setIsValidating(true);
      setError(null);

      const validTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];

      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      const minSizeInBytes = 10 * 1024; // 10KB

      // File type validation
      if (!validTypes.includes(selectedFile.type)) {
        setError("Only JPEG, PNG, and WebP images are supported. PDF files are not supported for OCR processing.");
        e.target.value = "";
        setIsValidating(false);
        return;
      }

      // File size validation
      if (selectedFile.size > maxSizeInBytes) {
        setError("File size must be less than 5MB. Please compress your image or use a smaller file.");
        e.target.value = "";
        setIsValidating(false);
        return;
      }

      if (selectedFile.size < minSizeInBytes) {
        setError("File size is too small. Please ensure the image is not corrupted.");
        e.target.value = "";
        setIsValidating(false);
        return;
      }

      // Image quality validation
      try {
        const isValidImage = await validateImage(selectedFile);
        if (!isValidImage) {
          setError("Image appears to be blank or of very poor quality. Please upload a clear image of your Aadhaar card.");
          e.target.value = "";
          setIsValidating(false);
          return;
        }
      } catch (error) {
        setError("Unable to validate image. Please try a different file.");
        e.target.value = "";
        setIsValidating(false);
        return;
      }

      setFile(selectedFile);
      setError(null);
      e.target.value = ""; // Reset input so same file can be selected again
      setIsValidating(false);
    },
    [disabled, setFile]
  );

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [setFile]);

  const triggerFileInput = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  return (
    <div className="p-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      <div
        onClick={!file && !disabled ? triggerFileInput : undefined}
        className={`relative cursor-pointer flex justify-center items-center bg-white border border-dashed border-gray-300 rounded-xl dark:bg-neutral-800 dark:border-neutral-600 w-96 h-64 ${
          disabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {file ? (
          <>
            {file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                alt="Selected file preview"
                className="object-cover w-full h-full rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500 text-lg">
                {file.name}
              </div>
            )}
            {!disabled && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </>
        ) : (
          <div className="text-center flex flex-col items-center space-y-2">
            {isValidating ? (
              <div className="animate-spin">
                <UploadCloud className="w-12 h-12 text-blue-400" />
              </div>
            ) : (
              <UploadCloud className="w-12 h-12 text-gray-400" />
            )}
            <div className="text-sm text-gray-600 dark:text-neutral-400">
              {isValidating ? (
                "Validating image..."
              ) : (
                <>
                  Drop your file here or{" "}
                  <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
                    browse
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-neutral-500">
              Max file size: 5MB • JPEG, PNG, WebP
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
