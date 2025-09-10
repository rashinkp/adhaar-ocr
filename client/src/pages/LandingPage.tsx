"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileInputSection from "@/components/FileInputSection";
import NumberInputSection from "@/components/NumberInputSection";
import UserDetailsDisplay from "@/components/DisplaySection";

const sampleData = {
  name: "John Doe",
  gender: "Male",
  dob: "1990-05-15",
  aadhaarNo: "1234 5678 9012",
  address: "123 Main Street, City, Country",
};

const LandingPage = () => {
  return (
    <div className="max-w-6xl mx-auto p-8">
  <div className="flex flex-col lg:flex-row gap-8">
    {/* Left Side: Tabs */}
    <div className="w-full lg:w-1/2 space-y-6">
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
    </div>

    {/* Right Side: Display Results */}
    <div className="w-full lg:w-1/2">
      <UserDetailsDisplay data={sampleData} />
    </div>
  </div>
</div>

  );
};

export default LandingPage;
