"use client";


import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isFuture, isToday } from "date-fns";
import type { FormValues, NumberInputSectionProps } from "@/types/input";
import { useState } from "react";


const NumberInputSection = ({
  isSubmitting,
  onSubmit,
}: NumberInputSectionProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onChange",
  });

  const [isOpen, setIsOpen] = useState<boolean>(false); // ← Move here

  const handleFormSubmit = (data: FormValues) => {
    onSubmit(data.aadhaar, data.dob!);
  };

  const handleSelect = (fieldOnChange: (date: Date | undefined) => void) => {
    return (selectedDate: Date | undefined) => {
      fieldOnChange(selectedDate);
      setIsOpen(false);
    };
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-6"
    >
      {/* Aadhaar Input */}
      <div className="space-y-2">
        <Label htmlFor="aadhaar">Aadhaar Number</Label>
        <Input
          id="aadhaar"
          type="number"
          placeholder="Enter your 12-digit Aadhaar number"
          {...register("aadhaar", {
            required: "Aadhaar number is required",
            pattern: {
              value: /^\d{12}$/,
              message: "Aadhaar number must be exactly 12 digits",
            },
          })}
        />
        {errors.aadhaar && (
          <p className="text-red-500 text-sm">{errors.aadhaar.message}</p>
        )}
      </div>

      {/* DOB Picker */}
      <div className="space-y-2">
        <Label>Date of Birth</Label>
        <Controller
          control={control}
          name="dob"
          rules={{
            required: "Date of Birth is required",
            validate: (value) =>
              (!isToday(value!) && !isFuture(value!)) ||
              "DOB must be before today",
          }}
          render={({ field }) => (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => setIsOpen(true)}
                >
                  {field.value
                    ? format(field.value, "yyyy-MM-dd")
                    : "Select your date of birth"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={handleSelect(field.onChange)}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.dob && (
          <p className="text-red-500 text-sm">{errors.dob.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
};


export default NumberInputSection;
