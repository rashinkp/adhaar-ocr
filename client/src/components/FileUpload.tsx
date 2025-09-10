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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      const validTypes = [
        "image/png",
        "image/jpeg",
        "image/gif",
        "image/webp",
        "application/pdf",
      ];

      const maxSizeInBytes = 2 * 1024 * 1024; // 2MB

      if (!validTypes.includes(selectedFile.type)) {
        setError("Only images and PDF files are supported.");
        e.target.value = "";
        return;
      }

      if (selectedFile.size > maxSizeInBytes) {
        setError("File size must be less than 2MB.");
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
      setError(null); // Clear previous error
      e.target.value = ""; // Reset input so same file can be selected again
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
            <UploadCloud className="w-12 h-12 text-gray-400" />
            <div className="text-sm text-gray-600 dark:text-neutral-400">
              Drop your file here or{" "}
              <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
                browse
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-neutral-500">
              Max file size: 2MB
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
