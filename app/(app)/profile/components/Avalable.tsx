"use client"
import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getAccessToken } from "@/lib/supabase/client"
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
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface EditAvalableProps {
    initialProfile: {
        availability: string
    }
    triggerClassName?: string
    onUpdate?: () => void
}

export default function AvalableDilog({ initialProfile, triggerClassName, onUpdate }: EditAvalableProps) {
    const [open, setOpen] = React.useState(false)
    const [availability, setAvailability] = React.useState(initialProfile.availability || "Available")
    const [draftAvailability, setDraftAvailability] = React.useState(initialProfile.availability || "Available")
    const [isSaving, setIsSaving] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    useEffect(() => {
        fetchAvailability()
    }, [])

    const fetchAvailability = async () => {
        setIsLoading(true)
        try {
            const token = await getAccessToken()
            if (!token) {
                toast.error('Not authenticated')
                return
            }

            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const data = await response.json()

            if (data.success && data.data) {
                const currentAvailability = data.data.availability || "Available"
                setAvailability(currentAvailability)
                setDraftAvailability(currentAvailability)
            }
        } catch (error) {
            console.error('Error fetching availability:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen)
        if (nextOpen) {
            setDraftAvailability(availability)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const token = await getAccessToken()
            if (!token) {
                toast.error('Not authenticated. Please log in again.')
                return
            }

            const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    availability: draftAvailability
                })
            })

            const data = await response.json()

            if (data.success) {
                setAvailability(draftAvailability)
                toast.success('Availability updated successfully!')
                setOpen(false)
                onUpdate?.()
            } else {
                toast.error(data.error || 'Failed to update availability')
            }
        } catch (error) {
            console.error('Error updating availability:', error)
            toast.error('Failed to update availability')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn("flex items-center gap-2 text-[#31A7AC]", triggerClassName)}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading...
                        </>
                    ) : (
                        availability
                    )}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Availability</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Select value={draftAvailability} onValueChange={setDraftAvailability} disabled={isSaving}>
                        <SelectTrigger className="w-full rounded-full border-none bg-[#34A353] text-white h-12">
                            <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Not Available">Not Available</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter className="flex flex-row justify-end gap-3">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            className="h-[44px] w-[128px] rounded-[15px] border-[#31A7AC]"
                            variant="outline"
                            disabled={isSaving}
                        >
                            <span className="text-[#31A7AC]">Cancel</span>
                        </Button>
                    </DialogClose>

                    <Button
                        type="button"
                        className="h-[44px] rounded-[15px] bg-[#31A7AC]"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
