"use client";

import { Loader2, Upload, Eye, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LoadingDisplayProps {
  stage: "uploading" | "processing" | "validating" | "complete";
  message?: string;
}

const LoadingDisplay = ({ stage, message }: LoadingDisplayProps) => {
  const getStageInfo = () => {
    switch (stage) {
      case "uploading":
        return {
          icon: <Upload className="w-6 h-6" />,
          title: "Uploading Images",
          description: "Please wait while we upload your Aadhaar card images...",
          progress: 25
        };
      case "processing":
        return {
          icon: <Eye className="w-6 h-6" />,
          title: "Processing Images",
          description: "Analyzing your Aadhaar card images with OCR technology...",
          progress: 50
        };
      case "validating":
        return {
          icon: <FileText className="w-6 h-6" />,
          title: "Validating Data",
          description: "Verifying extracted information and checking for accuracy...",
          progress: 75
        };
      case "complete":
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          title: "Processing Complete",
          description: "Your Aadhaar data has been successfully processed!",
          progress: 100
        };
      default:
        return {
          icon: <Loader2 className="w-6 h-6" />,
          title: "Processing",
          description: "Please wait...",
          progress: 0
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            {stage === "complete" ? (
              stageInfo.icon
            ) : (
              <div className="animate-spin">
                {stageInfo.icon}
              </div>
            )}
          </div>
        </div>
        <CardTitle className="text-lg">{stageInfo.title}</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {message || stageInfo.description}
        </p>
      </CardHeader>

      <CardContent>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${stageInfo.progress}%` }}
          />
        </div>
        
        {/* Progress Percentage */}
        <div className="text-center mt-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {stageInfo.progress}%
          </span>
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
          <div className={`flex flex-col items-center ${stage === "uploading" ? "text-blue-600" : ""}`}>
            <Upload className="w-4 h-4 mb-1" />
            <span>Upload</span>
          </div>
          <div className={`flex flex-col items-center ${stage === "processing" ? "text-blue-600" : ""}`}>
            <Eye className="w-4 h-4 mb-1" />
            <span>OCR</span>
          </div>
          <div className={`flex flex-col items-center ${stage === "validating" ? "text-blue-600" : ""}`}>
            <FileText className="w-4 h-4 mb-1" />
            <span>Validate</span>
          </div>
          <div className={`flex flex-col items-center ${stage === "complete" ? "text-green-600" : ""}`}>
            <CheckCircle className="w-4 h-4 mb-1" />
            <span>Complete</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingDisplay;

