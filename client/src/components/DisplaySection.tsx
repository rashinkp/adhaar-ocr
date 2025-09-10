"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Calendar, CreditCard, Home, AlertCircle } from "lucide-react";
import UserDetailsSkeleton from "./skeleton/UserDetailsSkeleton";

interface UserDetails {
  name: string;
  gender: string;
  dob: string;
  aadhaarNo: string;
  address: string;
}

interface UserDetailsDisplayProps {
  data?: UserDetails | null;
  isProcessing?: boolean;
}

const UserDetailsDisplay = ({ data, isProcessing }: UserDetailsDisplayProps) => {
  if (isProcessing) {
    return (
      <UserDetailsSkeleton />
    )
  }

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
 

  return (
    <Card className="max-w-md mx-auto p-4 space-y-4 shadow-none border-none">
      <CardHeader>
        <CardTitle className="font-bold">User Details</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-500" />
          <div>
            <span className="font-medium text-gray-700">Name:</span>{" "}
            <span className="text-gray-900">{data.name}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-500" />
          <div>
            <span className="font-medium text-gray-700">Gender:</span>{" "}
            <span className="text-gray-900">{data.gender}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-3">
          <Calendar className="w-5 h-5 text-gray-500" />
          <div>
            <span className="font-medium text-gray-700">DOB:</span>{" "}
            <span className="text-gray-900">{data.dob}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-3">
          <CreditCard className="w-5 h-5 text-gray-500" />
          <div>
            <span className="font-medium text-gray-700">Aadhaar No:</span>{" "}
            <span className="text-gray-900">{data.aadhaarNo}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center space-x-3">
          <Home className="w-5 h-5 text-gray-500" />
          <div>
            <span className="font-medium text-gray-700">Address:</span>{" "}
            <span className="text-gray-900">{data.address}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDetailsDisplay;
