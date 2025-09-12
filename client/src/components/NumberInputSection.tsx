"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { searchAadhaar } from "@/services/ocrService";

const NumberInputSection = () => {
  const [aadhaar, setAadhaar] = useState<string>("");
  const [dob, setDob] = useState<Date | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await searchAadhaar(aadhaar, format(dob!, "yyyy-MM-dd"));
      alert(`Aadhaar Data:\n${JSON.stringify(response.data, null, 2)}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Aadhaar Input */}
      <div className="space-y-2">
        <Label htmlFor="aadhaar">Aadhaar Number</Label>
        <Input
          id="aadhaar"
          type="number"
          placeholder="Enter your Aadhaar number"
          value={aadhaar}
          onChange={(e) => setAadhaar(e.target.value)}
          required
        />
      </div>

      {/* DOB Picker */}
      <div className="space-y-2">
        <Label>Date of Birth</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left"
            >
              {dob ? format(dob, "yyyy-MM-dd") : "Select your date of birth"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={dob} onSelect={setDob} />
          </PopoverContent>
        </Popover>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || !aadhaar || !dob}
        className="w-full"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
};

export default NumberInputSection;
