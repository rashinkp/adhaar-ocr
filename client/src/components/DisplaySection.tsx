"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Calendar, CreditCard, Home, AlertCircle, CheckCircle } from "lucide-react";
import ErrorDisplay from "./ErrorDisplay";
import SuccessDisplay from "./SuccessDisplay";
import LoadingDisplay from "./LoadingDisplay";
import type { UserDetailsDisplayProps } from "@/types/user";
import type { AadhaarData } from "@/types/adhaar";



const UserDetailsDisplay = ({ data, isProcessing, response, onRetry, onDismiss }: UserDetailsDisplayProps) => {
  // Show loading state
  if (isProcessing) {
    return <LoadingDisplay stage="processing" message="Processing your Aadhaar card..." />;
  }

  // Show error state
  if (response && !response.success) {
    return (
      <ErrorDisplay
        validation={response.validation}
        errors={response.errors}
        suggestions={response.suggestions}
        onRetry={onRetry}
        onDismiss={onDismiss}
        showRawText={true}
        rawText={response.rawText}
      />
    );
  }

  // Show success state with validation info
  if (response && response.success && response.validation) {
    return (
      <div className="space-y-4">
        <SuccessDisplay validation={response.validation} message="Aadhaar data extracted successfully!" />
        {data && <UserDetailsCard data={data} />}
      </div>
    );
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
  return <UserDetailsCard data={data} />;
};

const UserDetailsCard = ({ data }: { data: AadhaarData }) => {

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
            <span className="text-gray-900">{data.gender || "Not specified"}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <span className="font-medium text-gray-700">DOB:</span>{" "}
            <span className="text-gray-900">{data.dob}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-3">
          <CreditCard className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <span className="font-medium text-gray-700">Aadhaar No:</span>{" "}
            <span className="text-gray-900 font-mono">{data.aadhaarNumber}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-start space-x-3">
          <Home className="w-5 h-5 text-gray-500 mt-1" />
          <div className="flex-1">
            <span className="font-medium text-gray-700">Address:</span>{" "}
            <span className="text-gray-900 text-sm leading-relaxed">{data.address}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDetailsDisplay;
