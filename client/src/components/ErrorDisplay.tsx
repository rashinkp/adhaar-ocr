"use client";

import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ValidationResult } from "@/types/adhaar";

interface ErrorDisplayProps {
  validation?: ValidationResult;
  errors?: string[];
  suggestions?: string[];
  onRetry?: () => void;
  onDismiss?: () => void;
  showRawText?: boolean;
  rawText?: {
    frontText: string;
    backText: string;
  };
}

const ErrorDisplay = ({ 
  validation, 
  errors = [], 
  suggestions = [], 
  onRetry, 
  onDismiss,
  showRawText = false,
  rawText
}: ErrorDisplayProps) => {
  const allErrors = validation?.errors || errors;
  const allWarnings = validation?.warnings || [];
  const allSuggestions = validation?.suggestions || suggestions;

  if (allErrors.length === 0 && allWarnings.length === 0 && allSuggestions.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <CardTitle className="text-red-800 dark:text-red-200">
              {validation?.isValid === false ? "Validation Failed" : "Issues Found"}
            </CardTitle>
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-6 w-6 text-red-600 hover:text-red-800"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {validation?.confidence && (
          <div className="text-sm text-red-700 dark:text-red-300">
            Confidence Score: {validation.confidence}%
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Errors */}
        {allErrors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <h4 className="font-medium text-red-800 dark:text-red-200">Errors</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
              {allErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {allWarnings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Warnings</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
              {allWarnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {allSuggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-blue-800 dark:text-blue-200">Suggestions</h4>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
              {allSuggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Raw Text Display */}
        {showRawText && rawText && (
          <div className="space-y-2">
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Extracted Text</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Front Side</h5>
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono max-h-32 overflow-y-auto">
                    {rawText.frontText || "No text extracted"}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Back Side</h5>
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono max-h-32 overflow-y-auto">
                    {rawText.backText || "No text extracted"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {onRetry && (
          <div className="flex justify-end pt-2">
            <Button onClick={onRetry} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorDisplay;

