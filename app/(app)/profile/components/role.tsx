"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import { RoleData } from "@/contexts/ProfileContext"

interface RoleDialogProps {
    roles?: RoleData[];
    onAddRole?: (role: string, sort_order?: number) => Promise<{ success: boolean; message: string }>;
    onDeleteRole?: (id: string) => Promise<{ success: boolean; message: string }>;
}

export function RoleDialog({ roles = [], onAddRole, onDeleteRole }: RoleDialogProps) {
    const [newRole, setNewRole] = useState("")
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen)
        if (nextOpen) {
            setNewRole("")
        }
    }

    const handleAddRole = async () => {
        const value = newRole.trim()
        if (!value) {
            return
        }
        
        if (roles.some(r => r.role_name.toLowerCase() === value.toLowerCase())) {
            toast.error("Role already exists")
            setNewRole("")
            return
        }

        if (onAddRole) {
            setIsSubmitting(true)
            const result = await onAddRole(value, roles.length)
            setIsSubmitting(false)

            if (result.success) {
                toast.success("Role added successfully")
                setNewRole("")
            } else {
                toast.error(result.message)
            }
        }
    }

    const handleRemoveRole = async (id: string) => {
        if (onDeleteRole) {
            const result = await onDeleteRole(id)
            if (result.success) {
                toast.success("Role removed successfully")
            } else {
                toast.error(result.message)
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <div
                    className="flex flex-row h-[44px] w-auto text-base font-medium rounded-[15px] bg-transparent border px-9 justify-center items-center cursor-pointer hover:bg-muted/50 border-[#444444]"
                >
                    Role
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px] rounded-[24px]">
                <DialogHeader>
                    <DialogTitle className="text-[22px] font-[400] flex items-start justify-start mt-4">Roles</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm font-[400] text-slate-500">Add your professional roles (e.g. Director, Photographer).</p>
                    <div className="flex flex-row items-center gap-2 w-full border border-[#31A7AC] h-[41px] rounded-[15px] px-3">
                        <Input
                            value={newRole}
                            onChange={(event) => setNewRole(event.target.value)}
                            placeholder="e.g. Cinematographer"
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault()
                                    handleAddRole()
                                }
                            }}
                            className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent h-full px-0"
                            disabled={isSubmitting}
                        />
                        <Button 
                            type="button" 
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-transparent"
                            onClick={handleAddRole}
                            disabled={isSubmitting}
                        >
                            <Plus className="h-6 w-6 text-[#31A7AC]" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {roles.length === 0 && (
                            <p className="text-xs text-slate-400 w-full text-center py-2">No roles yet.</p>
                        )}
                        {roles.map((role) => (
                            <span
                                key={role.id}
                                className="inline-flex items-center gap-2 rounded-[10px] bg-[#FA6E80] px-3 py-1 text-sm font-medium text-white"
                            >
                                {role.role_name}
                                <button
                                    type="button"
                                    className="text-white/80 hover:text-white ml-1"
                                    onClick={() => handleRemoveRole(role.id)}
                                    aria-label={`Remove ${role.role_name}`}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
                <DialogFooter className="flex flex-row justify-end items-center sm:justify-end mt-4">
                    <DialogClose asChild>
                        <Button type="button" className="h-[41px] w-[128px] rounded-[15px] border border-[#31A7AC] text-[#31A7AC] hover:text-[#31A7AC] bg-transparent hover:bg-transparent" variant="outline">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
