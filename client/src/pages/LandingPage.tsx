"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileInputSection from "@/components/FileInputSection";
import NumberInputSection from "@/components/NumberInputSection";
import UserDetailsDisplay from "@/components/DisplaySection";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const sampleData = {
  name: "John Doe",
  gender: "Male",
  dob: "1990-05-15",
  aadhaarNo: "1234 5678 9012",
  address: "123 Main Street, City, Country",
};

const LandingPage = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
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

              <TabsContent value="file-upload">
                <FileInputSection />
              </TabsContent>

              <TabsContent value="number-input">
                <NumberInputSection />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Separator column */}
        <Separator orientation="vertical" className="hidden lg:block h-full" />

        {/* Right: Results */}
        <div className="w-full lg:sticky lg:top-6">
          <UserDetailsDisplay data={sampleData} />
        </div>

        {/* Horizontal separator for small screens */}
        <Separator className="lg:hidden" />
      </div>
    </div>
  );
};

export default LandingPage;
