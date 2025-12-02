/** @format */

"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ChevronsUpDown, Check } from "lucide-react";
import { useState } from "react";
import { countries, type Country } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function WhatupNumbers({
    countryCode: initialCountryCode,
    phoneNumber: initialPhoneNumber,
}: {
    countryCode?: string;
    phoneNumber?: string;
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [open, setOpen] = useState(false);

    const defaultCountry =
        countries.find((c) => c.code === (initialCountryCode || "IN")) ||
        countries[0];
    const [selectedCountry, setSelectedCountry] =
        useState<Country>(defaultCountry);
    const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || "");
    const [email, setEmail] = useState("");

    const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
        if (value.length <= 15) {
            setPhoneNumber(value);
        }
    };
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!phoneNumber || phoneNumber.length < 5) {
            toast.error("Please enter a valid phone number.");
            return;
        }

        const countryChanged =
            selectedCountry.code !== (initialCountryCode || "IN");
        const numberChanged = phoneNumber !== (initialPhoneNumber || "");

        if (!countryChanged && !numberChanged) {
            toast.info("No changes were made.");
            setIsDialogOpen(false);
            return;
        }

        // const fullPhoneNumber = `${selectedCountry.dial_code}${phoneNumber}`
        // console.log("Submitted Phone Number:", fullPhoneNumber)
        // Here you can add logic to save the number
        toast.success("WhatsApp number updated successfully!");
        setIsDialogOpen(false);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <div className="flex flex-row gap-5 h-[44px] w-auto text-base font-medium rounded-[15px]  bg-transparent border px-9 justify-center items-center cursor-pointer hover:bg-muted/50 border-[#444444] ">
                    Contact Details
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Contact</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col items-center gap-4">
                            <div className="col-span-3 flex items-center w-full gap-2">
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-[80px] justify-between bg-transparent border rounded-full h-11 text-4xl border-[#31A7AC]"
                                        >
                                            {selectedCountry.flag}
                                            <ChevronsUpDown
                                                className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                                color="#31A7AC"
                                            />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command className="mt-2">
                                            <CommandInput
                                                placeholder="Search country..."
                                                className=""
                                            />
                                            <CommandList className="max-h-[300px] h-full overflow-y-auto  scroll-y-auto">
                                                <CommandEmpty>No country found.</CommandEmpty>
                                                <CommandGroup>
                                                    {countries.map((country) => (
                                                        <CommandItem
                                                            key={country.code}
                                                            value={`${country.name} ${country.code}`}
                                                            onSelect={() => {
                                                                setSelectedCountry(country);
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                color="#31A7AC"
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedCountry.code === country.code
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex justify-between w-full">
                                                                <span>
                                                                    {country.flag} {country.name}
                                                                </span>
                                                                <span className="text-muted-foreground">
                                                                    {country.dial_code}
                                                                </span>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-sm text-muted-foreground">
                                        {selectedCountry.dial_code} |
                                    </div>
                                    <Input
                                        className="pl-14 border border-[#31A7AC] focus-visible:border-[#31A7AC] focus-visible:ring-ring/10 rounded-[15px] h-11 w-full"
                                        id="phone"
                                        type="tel"
                                        placeholder="000-000-0000"
                                        value={phoneNumber}
                                        onChange={handlePhoneNumberChange}
                                        maxLength={15}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <Input
                                className="pl-3 border border-[#31A7AC] focus-visible:border-[#31A7AC] focus-visible:ring-ring/10 rounded-[15px] h-11 w-full"
                                id="email"
                                type="email"
                                placeholder="example@example.com"
                                value={email}
                                onChange={handleEmailChange}
                                maxLength={50}
                            />
                        </div>
                    </div>
                    <DialogFooter className="flexl flex-row">
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                className="border-[#31A7AC] h-[44px] w-[128px] text-[#31A7AC] rounded-xl"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            className="bg-[#31A7AC] h-[44px] hover:bg-[#31A7AC] text-[#FFFFFF] rounded-xl"
                        >
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
