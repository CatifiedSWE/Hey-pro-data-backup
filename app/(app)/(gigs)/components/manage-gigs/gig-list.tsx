'use client'

import { CalendarDays, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import apiCalling from "@/lib/apiCalling";
import { toast } from "sonner";

type Gig = {
    id: string;
    title: string;
    description: string;
    qualifyingCriteria: string;
    budgetLabel: string;
    dateWindows: Array<{
        label: string;
        range: string;
    }>;
    location: string;
};

type GigListProps = {
    selectedGigIds: string[];
    onToggleGig: (gigId: string, checked: boolean) => void;
};

export function GigList({ selectedGigIds, onToggleGig }: GigListProps) {
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyGigs = async () => {
            try {
                setLoading(true);
                const response = await apiCalling({
                    method: 'get',
                    route: '/gigs?createdBy=me&limit=100',
                });

                if (response.status && response.data?.data?.gigs) {
                    setGigs(response.data.data.gigs);
                } else {
                    toast.error('Failed to fetch your gigs');
                }
            } catch (error) {
                console.error('Error fetching gigs:', error);
                toast.error('Failed to load your gigs');
            } finally {
                setLoading(false);
            }
        };

        fetchMyGigs();
    }, []);

    if (loading) {
        return (
            <section className="space-y-4 bg-transparent p-3 sm:p-4 md:p-6">
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA6E80]"></div>
                </div>
            </section>
        );
    }

    if (gigs.length === 0) {
        return (
            <section className="space-y-4 bg-transparent p-3 sm:p-4 md:p-6">
                <div className="text-center py-10">
                    <p className="text-lg text-slate-600">No gigs found</p>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-4 bg-transparent p-3 sm:p-4 md:p-6">
            {gigs.map((gig) => (
                <article key={gig.id} className="flex flex-row gap-4 items-start sm:items-center">
                    <div className="flex sm:mt-0 mt-12">
                        <Checkbox
                            aria-label={`Select ${gig.title}`}
                            className="h-5 w-5 sm:h-6 sm:w-6 border-2 border-[#FA6E80] data-[state=checked]:border-[#FA6E80] data-[state=checked]:bg-[#FA6E80]"
                            checked={selectedGigIds.includes(gig.id)}
                            onCheckedChange={(checked) => onToggleGig(gig.id, Boolean(checked))}
                        />
                    </div>

                    <div className="w-full min-w-0 rounded-[17px] bg-white p-4 sm:p-5 ring-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <div className="flex-1 min-w-0 max-w-[500px] space-y-2">
                                <div>
                                    <p className="text-base sm:text-lg font-medium text-gray-900 break-words">{gig.title}</p>
                                    <p className="mt-1 text-sm text-gray-600 break-words">{gig.description}</p>
                                </div>
                                <p className="text-sm text-[#444444] break-words">
                                    <span className="font-semibold text-gray-900">Qualifying criteria:</span> {gig.qualifyingCriteria}
                                </p>
                            </div>

                            <div className="hidden sm:block w-px self-stretch bg-[#E1E1E1]" />
                            <div className="sm:hidden h-px w-full bg-[#E1E1E1]" />

                            <div className="w-full sm:w-auto flex flex-col gap-3 text-sm text-gray-700 min-w-0">
                                <span className="text-left text-[14px] font-normal text-[#000000]">
                                    <span className="font-semibold text-[#000000]">ADE</span> {gig.budgetLabel}
                                </span>

                                <div className="flex items-start gap-2 text-sm text-[#444444]">
                                    <CalendarDays className="h-4 w-4 text-gray-400 shrink-0" />
                                    <div className="space-y-1">
                                        {gig.dateWindows.map((window) => (
                                            <p key={`${gig.id}-${window.label}`} className="break-words">
                                                <span className="font-medium text-gray-900">{window.label}</span>
                                                <span className="mx-2">|</span>
                                                {window.range}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                                    <p className="break-words">{gig.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </section>
    );
}
