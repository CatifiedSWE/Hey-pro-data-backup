'use client'

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Search } from "lucide-react"
import Image from "next/image"
import apiCalling from "@/lib/apiCalling"
import { toast } from "sonner"

type ReferralUser = {
    id: string
    name: string
    avatar: string | null
    location: string
    gigTitle?: string
}

type Referral = {
    id: string
    referrer: {
        id: string
        name: string
        avatar: string | null
    } | null
    referred: {
        id: string
        name: string
        avatar: string | null
    } | null
    contextType: string
    contextId: string
    message: string | null
    status: string
    createdAt: string
}

type SeeAllReferralsDialogProps = {
    selectedGigIds: string[]
}

export function SeeAllReferralsDialog({ selectedGigIds }: SeeAllReferralsDialogProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (open && selectedGigIds.length > 0) {
            fetchReferrals()
        }
    }, [open, selectedGigIds])

    const fetchReferrals = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await apiCalling({
                method: 'get',
                route: '/referrals',
            })

            if (response.status && response.data?.data) {
                // Filter referrals for selected gigs only
                const gigReferrals = response.data.data.filter((ref: Referral) => 
                    ref.contextType === 'gig' && selectedGigIds.includes(ref.contextId)
                )
                setReferrals(gigReferrals)
            } else {
                setError(response.message || 'Failed to load referrals')
                toast.error(response.message || 'Failed to load referrals')
            }
        } catch (err) {
            console.error('Error fetching referrals:', err)
            setError('Failed to load referrals')
            toast.error('Failed to load referrals')
        } finally {
            setLoading(false)
        }
    }

    const filteredReferrals = useMemo(() => {
        const query = searchTerm.trim().toLowerCase()
        if (!query) {
            return referrals
        }

        return referrals.filter((ref) => {
            return (
                ref.referred?.name.toLowerCase().includes(query) ||
                ref.referrer?.name.toLowerCase().includes(query)
            )
        })
    }, [searchTerm, referrals])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div>
                <DialogTrigger asChild>
                    <button 
                        className="text-[#FA6E80] font-medium text-sm hover:underline"
                        disabled={selectedGigIds.length === 0}
                    >
                        See referrals
                    </button>
                </DialogTrigger>
                <DialogContent className="rounded-[28px] px-10">
                    <div className="space-y-6 p-2 mt-10">
                        <DialogHeader className="space-y-1 text-left">
                            <DialogTitle className="text-2xl font-semibold text-[#1D1D1F]">
                                Referred people for your Gig{selectedGigIds.length > 1 ? 's' : ''}
                            </DialogTitle>
                            <p className="text-sm text-gray-600">
                                Showing referrals for {selectedGigIds.length} selected gig{selectedGigIds.length > 1 ? 's' : ''}
                            </p>
                        </DialogHeader>

                        <div className="">
                            <div className="relative">
                                <Input
                                    id="user-search"
                                    placeholder="Search referred people"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className="h-12 rounded-full border border-[#F7C7D2] bg-white pl-5 pr-16 text-sm text-[#515151] focus-visible:ring-0"
                                />
                                <button
                                    type="button"
                                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#FF5470] text-white shadow-md"
                                    aria-label="search"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <ScrollArea className="max-h-[460px]">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA6E80]"></div>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center py-20">
                                    <p className="text-sm text-red-500">{error}</p>
                                </div>
                            ) : filteredReferrals.length === 0 ? (
                                <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-muted-foreground">
                                    {searchTerm ? 'No referrals match your search.' : 'No referrals found for the selected gig(s).'}
                                </p>
                            ) : (
                                <div className="space-y-4 p-6">
                                    {filteredReferrals.map((referral) => {
                                        const user = referral.referred
                                        const referrer = referral.referrer
                                        
                                        if (!user) return null

                                        return (
                                            <div
                                                key={referral.id}
                                                className="flex flex-col gap-3 py-4 border-b border-[#F4F4F4] last:border-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {user.avatar ? (
                                                        <Image
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            width={48}
                                                            height={48}
                                                            className="h-12 w-12 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-600">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-base font-semibold text-[#1D1D1F]">
                                                            {user.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-sm text-[#6F6F6F]">
                                                            {referrer && (
                                                                <span>Referred by: <span className="font-medium text-[#31A7AC]">{referrer.name}</span></span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            referral.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                            referral.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {referral.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                {referral.message && (
                                                    <p className="text-sm text-gray-600 ml-[60px] italic">
                                                        &quot;{referral.message}&quot;
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </div>
        </Dialog>
    )
}
