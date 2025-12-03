'use client'

import Image from "next/image";
import { Calendar, FileText, MapPin, Search } from "lucide-react";
import { useState, useEffect, FormEvent } from "react";

import { Input } from "@/components/ui/input";
import apiCalling from "@/lib/apiCalling";

import { MainGigHeader } from "../components/gigs-header";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Gig {
    id: string;
    slug: string;
    title: string;
    description: string;
    qualifyingCriteria: string;
    budgetLabel: string;
    postedOn: string;
    postedBy: {
        name: string;
        avatar: string;
    };
    dateWindows: Array<{
        label: string;
        range: string;
    }>;
    location: string;
    supportingFileLabel: string;
    applyBefore: string;
    applicationCount: number;
}

export default function GigsPage() {
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchGigs = async (search?: string) => {
        try {
            setLoading(true);
            const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
            const response = await apiCalling({
                method: 'get',
                route: `/gigs?page=${currentPage}&limit=20${searchParam}`,
            });

            if (response.status && response.data?.data?.gigs) {
                setGigs(response.data.data.gigs);
            } else {
                toast.error('Failed to fetch gigs');
            }
        } catch (error) {
            console.error('Error fetching gigs:', error);
            toast.error('Failed to load gigs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGigs();
    }, [currentPage]);

    const handleSearch = (event: FormEvent) => {
        event.preventDefault();
        fetchGigs(searchQuery);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <>
            <MainGigHeader />
            <div className="px-4 pb-10 overflow-x-auto">
                <section className="mx-auto max-w-[739px]">
                    <form
                        onSubmit={handleSearch}
                        className="relative flex h-[38px] sm:h-[48px] w-full items-center justify-center rounded-full border border-[#FA6E80] bg-white"
                        role="search"
                        aria-label="Search gigs"
                    >
                        <Input
                            type="search"
                            placeholder="Search gigs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-none bg-transparent pr-14 shadow-none text-sm text-slate-700 focus-visible:ring-0"
                            aria-label="Search gigs"
                        />
                        <button
                            type="submit"
                            className="absolute right-1 top-1/2 flex h-[30px] w-[30px] sm:h-[34px] sm:w-[34px] -translate-y-1/2 items-center justify-center rounded-full bg-[#FA6E80] text-white transition hover:bg-[#f95569]"
                            aria-label="Submit search"
                        >
                            <Search className="h-[18px] w-[18px]" />
                        </button>
                    </form>
                </section>

                <section className="mx-auto mt-10 w-full max-w-[729px] px-1 sm:px-0">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA6E80]"></div>
                        </div>
                    ) : gigs.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-lg text-slate-600">No gigs found</p>
                        </div>
                    ) : (
                        gigs.map((gig) => (
                            <Link
                                href={`/gigs/${gig.slug}`}
                                key={gig.id}
                                className="block p-[17px] transition mb-5"
                            >
                                <div className="flex flex-col gap-6 lg:flex-row">
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-4">
                                            {gig.postedBy.avatar && (
                                                <Image 
                                                    src={gig.postedBy.avatar} 
                                                    alt={gig.postedBy.name} 
                                                    width={24} 
                                                    height={24} 
                                                    className="rounded-full" 
                                                />
                                            )}
                                            <div>
                                                <p className="text-[12px] font-[400] text-slate-900">{gig.postedBy.name}</p>
                                                <p className="text-[9px] font-[400] text-[#444444]">Posted on {formatDate(gig.postedOn)}</p>
                                            </div>
                                        </div>
                                        <h3 className="mt-4 text-[18px] font-[400] text-[#444444]">{gig.title}</h3>
                                        <p className="mt-3 text-[14px] font-[400] text-[#444444]">{gig.description}</p>
                                        {gig.qualifyingCriteria && (
                                            <p className="mt-4 text-[14px] font-[400] text-[#444444]">
                                                <span className="font-[600]">Qualifying criteria: </span>
                                                {gig.qualifyingCriteria}
                                            </p>
                                        )}
                                    </div>

                                    <div className="hidden lg:block lg:w-px max-h-[271px] mr-4 lg:bg-slate-200" aria-hidden />

                                    <div className="flex w-full flex-wrap gap-4 sm:flex-col lg:w-[260px]">
                                        <div className="flex-col hidden sm:flex items-start gap-1 text-right lg:items-end">
                                            <span className="text-xs font-[400]  tracking-wide text-[#FA6E80]">Apply before {formatDate(gig.applyBefore)}</span>
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-[400] text-[#444444] hidden sm:flex gap-1.5">{gig.budgetLabel}</p>
                                            <div className="flex items-center justify-start gap-3">
                                                <div className="">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <div className=" text-sm font-[400] text-[#444444]">
                                                    {gig.dateWindows.map((window, idx) => (
                                                        <p key={`${gig.id}-${window.label}-${idx}`}>
                                                            <span className="font-[400] text-[14.19px] text-[#444444]">{window.label}</span>
                                                            <span className="text-[#444444] font-[400] text-sm"> | {window.range}</span>
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 text-sm text-slate-700">
                                            <div className="">
                                                <MapPin className="h-4 w-4" />
                                            </div>
                                            <p className="font-[400] text-[12px] text-[#444444]">{gig.location}</p>
                                        </div>

                                        {gig.supportingFileLabel && (
                                            <div className="flex items-start gap-3 text-sm text-slate-700">
                                                <div className="">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <p className="font-[400] text-[12px] text-[#444444]">{gig.supportingFileLabel}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Separator className="mt-8" />
                            </Link>
                        ))
                    )}
                </section>
            </div>
        </>
    )
}