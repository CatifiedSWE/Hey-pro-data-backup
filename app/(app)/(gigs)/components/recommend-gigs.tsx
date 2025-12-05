'use client'

import { useEffect, useMemo, useState } from "react"
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
import { MapPin, Search, UserPlus } from "lucide-react"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import apiCalling from "@/lib/apiCalling"
import { toast } from "sonner"

type RecommendationUser = {
    id: string
    userId: string
    avatar: string | null
    name: string
    location: string
    roles: string[]
}

type ExploreProfile = {
    id: string
    userId: string
    name: string
    displayName: string
    avatar: string | null
    location: string
    roles: string[]
}

type ExploreApiResponse = {
    success: boolean
    message: string
    data: {
        profiles: ExploreProfile[]
        pagination: {
            currentPage: number
            totalPages: number
            totalProfiles: number
            limit: number
            hasNextPage: boolean
            hasPrevPage: boolean
        }
    }
}

type SendRecommendationDialogProps = {
    className?: string
    selectedGigIds: string[]
}

export function SendRecommendationDialog({ className, selectedGigIds }: SendRecommendationDialogProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedUsers, setSelectedUsers] = useState<RecommendationUser[]>([])
    const [users, setUsers] = useState<RecommendationUser[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [open, setOpen] = useState(false)

    // Fetch users from API when dialog opens
    useEffect(() => {
        if (open) {
            const fetchUsers = async () => {
                try {
                    setLoading(true)
                    setError(null)
                    
                    const response = await apiCalling<ExploreApiResponse>({
                        method: 'get',
                        route: '/explore',
                    })

                    // Check if response is successful and has profiles
                    if (response.status && response.data) {
                        // Handle the case where data might be nested differently
                        const profilesData = (response.data as ExploreApiResponse).data?.profiles || (response.data as any).profiles
                        
                        if (profilesData && Array.isArray(profilesData)) {
                            const profiles = profilesData.map((profile: any) => ({
                                id: profile.id,
                                userId: profile.userId,
                                avatar: profile.avatar,
                                name: profile.name || profile.displayName,
                                location: profile.location,
                                roles: profile.roles || []
                            }))
                            setUsers(profiles)
                        } else {
                            console.error('No profiles found in response:', response.data)
                            setError('Failed to load users')
                            toast.error('Failed to load users')
                        }
                    } else {
                        console.error('API call failed:', response)
                        setError(response.message || 'Failed to load users')
                        toast.error(response.message || 'Failed to load users')
                    }
                } catch (err) {
                    console.error('Error fetching users:', err)
                    setError('Failed to load users')
                    toast.error('Failed to load users')
                } finally {
                    setLoading(false)
                }
            }

            fetchUsers()
        }
    }, [open])

    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()
        if (!query) {
            return users
        }

        return users.filter((user) => {
            return (
                user.name.toLowerCase().includes(query) ||
                user.location.toLowerCase().includes(query) ||
                user.roles.some(role => role.toLowerCase().includes(query))
            )
        })
    }, [searchTerm, users])

    const handleToggleUser = (user: RecommendationUser) => {
        setSelectedUsers((prev) => {
            if (prev.some((existing) => existing.id === user.id)) {
                return prev.filter((existing) => existing.id !== user.id)
            }
            return [...prev, user]
        })
    }

    const handleSend = async () => {
        if (selectedUsers.length === 0 || selectedGigIds.length === 0) {
            toast.error('Please select at least one user and ensure gigs are selected')
            return
        }

        setSending(true)
        let successCount = 0
        let errorCount = 0

        try {
            // Send referrals for each selected user to each selected gig
            for (const gigId of selectedGigIds) {
                for (const user of selectedUsers) {
                    try {
                        const response = await apiCalling({
                            method: 'post',
                            route: '/referrals',
                            data: {
                                referred_user_id: user.userId,
                                context_type: 'gig',
                                context_id: gigId,
                                message: message.trim() || 'You have been invited to apply for this gig'
                            }
                        })

                        if (response.status) {
                            successCount++
                        } else {
                            errorCount++
                            console.error('Failed to send referral:', response.message)
                        }
                    } catch (error) {
                        errorCount++
                        console.error('Error sending referral:', error)
                    }
                }
            }

            // Show results
            if (errorCount === 0) {
                toast.success(`Successfully sent ${successCount} invitation${successCount > 1 ? 's' : ''}`)
                setOpen(false)
                setSelectedUsers([])
                setMessage('')
            } else if (successCount > 0) {
                toast.warning(`Sent ${successCount} invitation${successCount > 1 ? 's' : ''}, but ${errorCount} failed`)
            } else {
                toast.error('Failed to send invitations')
            }
        } catch (error) {
            console.error('Error sending invitations:', error)
            toast.error('Failed to send invitations')
        } finally {
            setSending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div>
                <DialogTrigger asChild>
                    <Button 
                        type="button" 
                        className="bg-[#31A7AC] hover:bg-[#2a9398] text-white rounded-lg px-6 flex items-center gap-2"
                        disabled={selectedGigIds.length === 0}
                    >
                        <UserPlus className="h-5 w-5" />
                        Recommend
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-[582px] max-w-[90vw] border-0 bg-[#F8F8F8] p-0 sm:rounded-[20px] max-h-[90vh] overflow-y-auto">
                    <div className="relative flex flex-col gap-6 p-6">
                        <DialogHeader className="items-start gap-1 border-b border-[#C8C8C8] pb-5">
                            <DialogTitle className="text-[18px] font-normal text-black">
                                Make someone’s day!
                            </DialogTitle>
                            <p className="text-[16px] text-black">
                                Invite someone for {selectedGigIds.length} selected gig{selectedGigIds.length > 1 ? 's' : ''}
                            </p>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div className="relative">
                                <Input
                                    id="user-search"
                                    placeholder="Start typing to search for crew members"
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
                            <div className="space-y-2">
                                <label htmlFor="invitation-message" className="text-sm font-medium text-black">
                                    Personal Message (Optional)
                                </label>
                                <textarea
                                    id="invitation-message"
                                    placeholder="Add a personal message to your invitation..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full min-h-[80px] px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:border-[#FA6E80] focus:outline-none focus:ring-1 focus:ring-[#FA6E80] resize-none"
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-500 text-right">{message.length}/500</p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-medium text-black">
                                    Crew members to invite ({selectedUsers.length} selected)
                                </p>
                                <ScrollArea className="h-72 pr-2">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA6E80]"></div>
                                        </div>
                                    ) : error ? (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-sm text-red-500">{error}</p>
                                        </div>
                                    ) : filteredUsers.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-sm text-gray-500">No users found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {filteredUsers.map((user) => {
                                                const isSelected = selectedUsers.some((existing) => existing.id === user.id)

                                                return (
                                                    <div
                                                        key={user.id}
                                                        className="flex items-center justify-between rounded-[12px] bg-white px-4 py-3"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            {user.avatar && user.avatar.trim() !== "" ? (
                                                                <Image
                                                                    src={user.avatar}
                                                                    alt={user.name}
                                                                    width={49}
                                                                    height={49}
                                                                    className="h-[49px] w-[49px] rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="h-[49px] w-[49px] rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-600">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
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
                                    )}
                                </ScrollArea>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-row w-full items-center justify-between border-t border-[#C8C8C8] px-6 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={sending}
                            className="h-[47px] rounded-[10px] border-[#828282] px-6 font-semibold text-[#828282]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={selectedUsers.length === 0 || sending}
                            onClick={handleSend}
                            className="h-[47px] rounded-[10px] bg-[#FA6E80] hover:bg-[#e55b6d] px-6 font-semibold text-white disabled:opacity-50"
                        >
                            {sending ? 'Sending...' : `Invite ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}`}
                        </Button>
                    </DialogFooter>

                </DialogContent>
            </div>
        </Dialog>
    )
}
