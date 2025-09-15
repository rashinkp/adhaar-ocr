"use client";

import { CheckCircle, TrendingUp, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ValidationResult } from "@/types/adhaar";

interface SuccessDisplayProps {
  validation?: ValidationResult;
  message?: string;
}

const SuccessDisplay = ({ validation, message }: SuccessDisplayProps) => {
  const confidence = validation?.confidence || 0;
  const warnings = validation?.warnings || [];
  const suggestions = validation?.suggestions || [];

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600";
    if (confidence >= 70) return "text-yellow-600";
    return "text-orange-600";
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <CheckCircle className="w-4 h-4" />;
    if (confidence >= 70) return <TrendingUp className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  return (
    <Card className="w-full max-w-md mx-auto border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <CardTitle className="text-green-800 dark:text-green-200">
            {message || "OCR Processing Successful"}
          </CardTitle>
        </div>
        {validation && (
          <div className="flex items-center space-x-2 text-sm">
            {getConfidenceIcon(confidence)}
            <span className={`font-medium ${getConfidenceColor(confidence)}`}>
              Confidence: {confidence}%
            </span>
          </div>
        )}
      </CardHeader>

      {(warnings.length > 0 || suggestions.length > 0) && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Minor Issues
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-yellow-700 dark:text-yellow-300">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Tips for Better Results
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
                  {suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SuccessDisplay;

