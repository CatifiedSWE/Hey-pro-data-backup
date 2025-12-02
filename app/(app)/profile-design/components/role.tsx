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
import { profileData } from "@/data/profile"
import { Plus } from "lucide-react"

export function RoleDialog() {
    const [roles, setRoles] = useState<string[]>(profileData.roles ?? [])
    const [draftRoles, setDraftRoles] = useState<string[]>(roles)
    const [newRole, setNewRole] = useState("")
    const [open, setOpen] = useState(false)

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen)
        if (nextOpen) {
            setDraftRoles(roles)
            setNewRole("")
        }
    }

    const handleAddRole = () => {
        const value = newRole.trim()
        if (!value) {
            return
        }
        if (draftRoles.includes(value)) {
            setNewRole("")
            return
        }
        setDraftRoles((prev) => [...prev, value])
        setNewRole("")
    }

    const handleRemoveRole = (role: string) => {
        setDraftRoles((prev) => prev.filter((entry) => entry !== role))
    }

    const handleSaveRoles = () => {
        setRoles(draftRoles)
        profileData.roles = draftRoles
        console.log("Updated roles", draftRoles)
        setOpen(false)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <div

                        className="flex flex-row gap-5 h-[44px] w-auto text-base font-[400] rounded-[15px]  bg-transparent border px-9 justify-start items-center cursor-pointer hover:bg-muted/50 border-[#444444] "
                    >
                        Role
                    </div>
                </DialogTrigger>
                <DialogContent className="rounded-[24px]">
                    <DialogHeader>
                        <DialogTitle className="">Roles</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm font[400] text-slate-500">Let people know what all language you speak.</p>
                        <div className="flex justify-center items-center gap-2 w-full border border-[#31A7AC] h-[41px] rounded-[15px]">
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
                                className=" border-none focus:ring-0"
                            />
                            <Button type="button" className="bg-transparent" onClick={handleAddRole}>
                                <Plus className="h-7 w-7 text-[#31A7AC]" />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {draftRoles.length === 0 && (
                                <p className="text-xs text-slate-400">No roles yet.</p>
                            )}
                            {draftRoles.map((role) => (
                                <span
                                    key={role}
                                    className="inline-flex items-center gap-2 rounded-[15px] border border-[#31A7AC] h-[41px] px-3 py-1 text-sm text-slate-700"
                                >
                                    {role}
                                    <button
                                        type="button"
                                        className="text-xs text-slate-400 hover:text-slate-600"
                                        onClick={() => handleRemoveRole(role)}
                                        aria-label={`Remove ${role}`}
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <DialogFooter className=" flex flex-row justify-start items-start">
                        <DialogClose asChild>
                            <Button type="button" className="h-[44px] w-[128px] rounded-[15px] border-[#31A7AC]" variant="outline">
                                <span className="text-[#31A7AC]">Cancel</span>
                            </Button>
                        </DialogClose>
                        <Button type="button" className="h-[44px] rounded[15px] bg-[#31A7AC]" onClick={handleSaveRoles}>
                            Save roles
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>


    )
}
