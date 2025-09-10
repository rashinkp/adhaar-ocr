"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  CreditCard,
  Home,
} from "lucide-react";

interface UserDetails {
  name: string;
  gender: string;
  dob: string;
  aadhaarNo: string;
  address: string;
}

interface UserDetailsDisplayProps {
  data: UserDetails;
}

const UserDetailsDisplay = ({ data }: UserDetailsDisplayProps) => {
 

  return (
    <Card className="max-w-md mx-auto p-4 space-y-4 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold">User Details</CardTitle>
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
