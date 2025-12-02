"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"
import { cn } from "@/lib/utils";

export default function AboutSectionComponent({ icon, title, about: initialAbout, className }: { icon?: React.ReactNode, title: string, about: string, className?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [about, setAbout] = useState(initialAbout || "This is the about section. It contains information about the user. It can be edited by clicking the edit button.");
    const [error, setError] = useState<string | null>(null);
    const finalTitle = title

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // 1. Check if data has changed
        if (about.trim() === (initialAbout || "").trim()) {
            toast.info("No changes were made.");
            setIsOpen(false);
            return;
        }

        // 2. Check for invalid special characters
        const allowedCharsRegex = /^[a-zA-Z0-9\s.,'!?()-]*$/;
        if (!allowedCharsRegex.test(about)) {
            const errorMessage = "Special characters like @, #, $, %, etc., are not allowed.";
            setError(errorMessage);
            toast.error(errorMessage);
            return;
        }

        setError(null)
        // console.log("Submitting data:", { title: finalTitle, about });
        toast.success(`${finalTitle} updated successfully!`);
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div
                    className={cn(
                        "flex flex-row gap-5 h-[44px] w-auto text-base font-medium rounded-[15px]  bg-transparent border px-9 justify-center items-center cursor-pointer hover:bg-muted/50 border-[#444444]",
                        className
                    )}
                >
                    {finalTitle}{ }
                    {icon}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="flex flex-col items-start justify-start ">
                        <DialogTitle>Edit {finalTitle}</DialogTitle>
                        <div className="text-start text-[12px] font-[400]">
                            You can write about your years of experience, industry, or skills. People also talk about their achievements or previous job experiences.
                        </div>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-3">
                            <Textarea
                                id="about-textarea"
                                placeholder="Type your message here."
                                value={about}
                                onChange={(e) => {
                                    setAbout(e.target.value);
                                    if (error) setError(null); // Clear error when user starts typing
                                }}
                                className={`h-72 rounded-[15px] ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                        </div>
                    </div>
                    <DialogFooter className="flex flex-row ">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="rounded-[16px] h-[44px] w-[128px]">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" className="rounded-[16px] h-[44px]">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}