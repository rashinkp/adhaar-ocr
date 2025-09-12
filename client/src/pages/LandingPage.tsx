"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileInputSection from "@/components/FileInputSection";
import NumberInputSection from "@/components/NumberInputSection";
import UserDetailsDisplay from "@/components/DisplaySection";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { searchAadhaar, uploadAadhaarImages } from "@/services/ocrService";
import type { AadhaarData } from "@/types/adhaar";


const LandingPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aadhaarData, setAadhaarData] = useState<AadhaarData | null>(null);

const startProcessing = async (frontFile: File, backFile: File) => {
  setIsProcessing(true);

  try {
    const formData = new FormData();
    formData.append("frontFile", frontFile);
    formData.append("backFile", backFile);

    const response = await uploadAadhaarImages(formData);
    const data = response.data as AadhaarData;

    setAadhaarData(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      alert(`Upload failed: ${error.message}`);
    } else {
      alert("Server error");
    }
  } finally {
    setIsProcessing(false);
  }
};

const handleSubmit = async (aadhaar: string, dob: Date) => {
  setIsProcessing(true);

  try {
    // Convert Date to string in 'YYYY-MM-DD' format
    const dobString = dob.toISOString().split('T')[0];
    const response = await searchAadhaar(aadhaar, dobString);
    const data = response.data as AadhaarData;

    setAadhaarData(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      alert(`Error: ${error.message}`);
    } else {
      alert("Something went wrong");
    }
  } finally {
    setIsProcessing(false);
  }
};


  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <div className="space-y-2 mb-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          QuickAadhaar
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Upload Aadhaar images or enter Aadhaar number with DOB to quickly
          extract and view details.
        </p>
      </div>
      <Separator className="mb-6" />
      <div className="grid items-start gap-6 lg:gap-8 lg:grid-cols-[1fr_auto_1fr]">
        {/* Left: Inputs */}
        <Card className="w-full border-none shadow-none">
          <CardHeader>
            <CardTitle className="font-bold">Aadhaar OCR Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="file-upload" className="space-y-4">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="file-upload">Upload File</TabsTrigger>
                <TabsTrigger value="number-input">Enter Number</TabsTrigger>
              </TabsList>

              <TabsContent value="file-upload" className="min-h-[220px]">
                <FileInputSection
                  isProcessing={isProcessing}
                  onStartProcessing={startProcessing}
                />
              </TabsContent>

              <TabsContent value="number-input" className="min-h-[220px]">
                <NumberInputSection onSubmit={handleSubmit} isSubmitting={isProcessing} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Separator column */}
        <Separator orientation="vertical" className="hidden lg:block h-full" />

        {/* Right: Results */}
        <div className="w-full lg:sticky lg:top-6">
          <UserDetailsDisplay isProcessing={isProcessing} data={aadhaarData} />
        </div>

        {/* Horizontal separator for small screens */}
        <Separator className="lg:hidden" />
      </div>
    </div>
  );
};

export default LandingPage;
