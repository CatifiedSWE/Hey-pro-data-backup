"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
interface EditAvalableProps {
    initialProfile: {
        availability: string
    }
    triggerClassName?: string
}
export default function AvalableDilog({ initialProfile, triggerClassName }: EditAvalableProps) {

    const [open, setOpen] = React.useState(false)
    const [availability, setAvailability] = React.useState(initialProfile.availability)
    const [draftAvailability, setDraftAvailability] = React.useState(initialProfile.availability)

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen)
        if (nextOpen) {
            setDraftAvailability(availability)
        }
    }

    // const handleCancel = () => {
    //     setDraftAvailability(availability)
    //     setOpen(false)
    // }

    const handleSave = () => {
        setAvailability(draftAvailability)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "flex items-center gap-2 border border-none text-white",
                        availability
                            ? "bg-[#34A353]"
                            : availability === "Unavailable"
                                ? "bg-slate-800"
                                : "bg-[#31A7AC]",
                        triggerClassName
                    )}
                >
                    {availability}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="">
                    <DialogTitle>Availability</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                    <Select value={draftAvailability} onValueChange={setDraftAvailability} >
                        <SelectTrigger className={cn("w-full bg-[#34A353] rounded-full px-5 border-none text-white",
                            draftAvailability === "Busy" ? "bg-[#444444]" : draftAvailability === "Unavailable" ? "bg-[#31A7AC]" : "bg-[#34A353]")}>
                            <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="Available" className="bg-[#34A353]  rounded-t-[16px] text-white font-[600]">Available</SelectItem>
                            <SelectItem value="Busy" className="bg-[#444444] text-white font-[600] ">Busy</SelectItem>
                            <SelectItem value="Unavailable" className="bg-[#31A7AC]  rounded-b-[16px] text-white font-[600]">Select From Calender</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter className=" flex flex-row justify-start  items-start">
                    <DialogClose asChild>
                        <Button type="button" className="h-11 w-32 rounded-[15px] border-[#31A7AC]" variant="outline">
                            <span className="text-[#31A7AC]">Cancel</span>
                        </Button>
                    </DialogClose>
                    <Button type="button" className="h-11 rounded-[15px] bg-[#31A7AC]" onClick={handleSave}>
                        Save roles
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
