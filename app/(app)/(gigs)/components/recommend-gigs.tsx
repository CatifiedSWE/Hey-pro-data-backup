'use client'

import { useMemo, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RecommendationUser, recommendationUsers } from "@/data/recommendUsers"
import { MapPin, Search } from "lucide-react"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"

export function SendRecommendationDialog({ className }: { className?: string }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedUsers, setSelectedUsers] = useState<RecommendationUser[]>([])

    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()
        if (!query) {
            return recommendationUsers
        }

        return recommendationUsers.filter((user) => {
            return (
                user.name.toLowerCase().includes(query) ||
                user.handle.toLowerCase().includes(query)
            )
        })
    }, [searchTerm])

    const handleToggleUser = (user: RecommendationUser) => {
        setSelectedUsers((prev) => {
            if (prev.some((existing) => existing.id === user.id)) {
                return prev.filter((existing) => existing.id !== user.id)
            }
            return [...prev, user]
        })
    }

    const handleSend = () => {
        console.log("Recommendation recipients:", selectedUsers)
    }

    return (
        <Dialog>
            <div>
                <DialogTrigger asChild>
                    <Button type="button" className={cn("inline-flex  items-center h-[44px] gap-2 rounded-[14px] px-6 py-3 text-sm font-medium text-white shadow-md", className)}>
                        Invite crew for this Gig
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-[582px] ] border-0 bg-[#F8F8F8] p-0 sm:rounded-[20px]">
                    <div className="relative flex  flex-col gap-6 p-6">
                        <DialogHeader className="items-start gap-1 border-b border-[#C8C8C8] pb-5">
                            <DialogTitle className="text-[18px] font-normal text-black">
                                Make someone’s day!
                            </DialogTitle>
                            <p className="text-[16px] text-black">
                                Invite someone for this Gig
                            </p>
                        </DialogHeader>

                        <div className="space-y-6 ">
                            <div className="relative">
                                <Input
                                    id="user-search"
                                    placeholder="Start typing to recommend for this role"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className="h-12 rounded-full border border-[#FA6E80] bg-white pr-14 text-[14px] text-[#646464] placeholder:text-[#646464]"
                                />
                                <button
                                    type="button"
                                    className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#FA6E80]"
                                    aria-label="Search"
                                >
                                    <Search className="h-4 w-4 text-white" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-medium text-black">Previously recommended</p>
                                <ScrollArea className="h-72 pr-2">
                                    <div className="space-y-4">
                                        {filteredUsers.map((user) => {
                                            const isSelected = selectedUsers.some((existing) => existing.id === user.id)

                                            return (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center justify-between rounded-[12px] bg-white px-4 py-3"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <Image
                                                            src={user.avatar || "/default-avatar.png"}
                                                            alt={user.name}
                                                            width={49}
                                                            height={49}
                                                            className="h-[49px] w-[49px] rounded-full object-cover"
                                                        />
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-base font-medium text-[#444444]">{user.name}</p>
                                                            <div className="flex items-center gap-2 text-sm text-[#444444]">
                                                                <MapPin className="h-4 w-4" />
                                                                <span>{user.location}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <label htmlFor={`recommend-${user.id}`} className="relative inline-flex items-center justify-center">
                                                        <Checkbox
                                                            id={`recommend-${user.id}`}
                                                            checked={isSelected}
                                                            onCheckedChange={() => handleToggleUser(user)}
                                                            aria-label={`Toggle recommendation for ${user.name}`}
                                                            style={{ width: 24, height: 24 }}
                                                            className="h-6 w-6 rounded-[4px] border border-[#444444] text-transparent transition data-[state=checked]:border-[#FCAF45] data-[state=checked]:bg-[#FCAF45] data-[state=checked]:text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                                                        />
                                                    </label>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-row w-full items-center justify-between border-t border-[#C8C8C8] px-6 py-4">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-[47px] rounded-[10px] border-[#828282] px-6 font-semibold text-[#828282]"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                disabled={selectedUsers.length === 0}
                                onClick={handleSend}
                                className="h-[47px] rounded-[10px] bg-[#31A7AC] px-6 font-semibold text-white disabled:opacity-50"
                            >
                                Recommend
                            </Button>
                        </DialogClose>
                    </DialogFooter>

                </DialogContent>
            </div>
        </Dialog>
    )
}
