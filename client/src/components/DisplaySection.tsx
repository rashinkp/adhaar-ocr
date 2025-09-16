"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Calendar, CreditCard, Home, AlertCircle, CheckCircle } from "lucide-react";
import UserDetailsSkeleton from "./skeleton/UserDetailsSkeleton";
import type { UserDetailsDisplayProps } from "@/types/user";
import type { AadhaarData } from "@/types/adhaar";



const UserDetailsDisplay = ({ data, isProcessing, response, onRetry, onDismiss, onFetchByAadhaarDob }: UserDetailsDisplayProps) => {
  // Show loading state (skeleton)
  if (isProcessing) {
    return <UserDetailsSkeleton />;
  }

  // Show simple error state (no box, friendly copy)
  if (response && !response.success) {
    const isNotFound = response.message === "Record not found";
    const title = isNotFound
      ? "No matching record found"
      : response.message || "We couldn’t complete your request";
    const description = isNotFound
      ? "We couldn’t find an Aadhaar record for the number and DOB you entered. Try scanning and uploading the card, or double‑check the details."
      : (response.errors && response.errors.length > 0
          ? response.errors[0]!
          : "Please try again in a moment.");

    return (
      <div className="w-full mx-auto py-6 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h2 className="text-red-700 font-semibold text-base md:text-lg">{title}</h2>
        </div>
        <p className="text-gray-700 text-sm md:text-base max-w-lg mx-auto leading-relaxed">{description}</p>
        {response.suggestions && response.suggestions.length > 0 && (
          <ul className="text-gray-600 text-sm max-w-lg mx-auto list-disc list-inside space-y-1">
            {response.suggestions.slice(0, 2).map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-center gap-4 text-sm md:text-base pt-1">
          {onRetry && (
            <button type="button" className="text-blue-600 underline" onClick={onRetry}>
              Try again
            </button>
          )}
          {onDismiss && (
            <button type="button" className="text-gray-600 underline" onClick={onDismiss}>
              Dismiss
            </button>
          )}
        </div>
      </div>
    );
  }

  // On success, just show data card; toast is handled in submit/upload flows
  if (response && response.success) {
    return data ? <UserDetailsCard data={data} onFetch={onFetchByAadhaarDob} /> : null;
  }

  // Show empty state
  if (!data) {
    return (
      <Card className="max-w-md mx-auto p-4 text-center space-y-4 shadow-none border-none">
        <CardHeader>
          <CardTitle className="font-bold">User Details</CardTitle>
        </CardHeader>

        <CardContent className="text-gray-500 flex flex-col items-center space-y-4">
          <AlertCircle className="w-12 h-12 text-gray-400" />
          <p>
            No user details available. Please upload a file or enter number.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show data without validation info (fallback)
  return <UserDetailsCard data={data} onFetch={onFetchByAadhaarDob} />;
};

const UserDetailsCard = ({ data, onFetch }: { data: AadhaarData; onFetch?: (aadhaar: string, dob: string) => void }) => {

  return (
    <Card className="max-w-md mx-auto p-4 space-y-4 shadow-none border-none">
      <CardHeader>
        <CardTitle className="font-bold flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>User Details</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <span className="font-medium text-gray-700">Name:</span>{" "}
            <span className="text-gray-900">{data.name}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <span className="font-medium text-gray-700">Gender:</span>{" "}
            <span className="text-gray-900">{data.gender || "Not available"}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <span className="font-medium text-gray-700">DOB:</span>{" "}
            {onFetch && data.dob ? (
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => onFetch(data.aadhaarNumber, data.dob!.replace(/-/g, "/"))}
              >
                {data.dob}
              </button>
            ) : (
              <span className="text-gray-900">{data.dob || "Not available"}</span>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-3">
          <CreditCard className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <span className="font-medium text-gray-700">Aadhaar No:</span>{" "}
            {onFetch ? (
              <button
                type="button"
                className="text-blue-600 font-mono hover:underline"
                onClick={() => onFetch(data.aadhaarNumber, data.dob!.replace(/-/g, "/"))}
              >
                {data.aadhaarNumber}
              </button>
            ) : (
              <span className="text-gray-900 font-mono">{data.aadhaarNumber}</span>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-start space-x-3">
          <Home className="w-5 h-5 text-gray-500 mt-1" />
          <div className="flex-1">
            <span className="font-medium text-gray-700">Address:</span>{" "}
            <span className="text-gray-900 text-sm leading-relaxed whitespace-pre-line">{data.address || "Not available"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDetailsDisplay;
