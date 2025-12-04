'use client'

import Image from "next/image";
import { Calendar, FileText, MapPin, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { gigsData } from "@/data/gigs";

import { MainGigHeader } from "../components/gigs-header";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function GigsPage() {
    return (
        <>
            <MainGigHeader />
            <div className="px-4 pb-10 overflow-x-auto">
                <section className="mx-auto max-w-[739px]">
                    <form
                        onSubmit={(event) => event.preventDefault()}
                        className="relative flex h-[38px] sm:h-[48px] w-full items-center justify-center rounded-full border border-[#FA6E80] bg-white"
                        role="search"
                        aria-label="Search gigs"
                    >
                        <Input
                            type="search"
                            placeholder="Search gigs..."
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
                    {gigsData.map((gig) => (
                        <Link
                            href={`/gigs/${gig.slug}`}
                            key={gig.id}
                            className="block p-[17px] transition mb-5"
                        >
                            <div className="flex flex-col gap-6 lg:flex-row">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-4">
                                        <Image src={gig.postedBy.avatar} alt={gig.postedBy.name} width={24} height={24} className="rounded-full" />
                                        <div>
                                            <p className="text-[12px] font-[400] text-slate-900">{gig.postedBy.name}</p>
                                            <p className="text-[9px] font-[400] text-[#444444]">Posted on {gig.postedOn}</p>
                                        </div>
                                    </div>
                                    <h3 className="mt-4 text-[18px] font-[400] text-[#444444]">{gig.title}</h3>
                                    <p className="mt-3 text-[14px] font-[400] text-[#444444]">{gig.description}</p>
                                    <p className="mt-4 text-[14px] font-[400] text-[#444444]">
                                        <span className="font-[600]">Qualifying criteria: </span>
                                        {gig.qualifyingCriteria}
                                    </p>
                                </div>

                                <div className="hidden lg:block lg:w-px max-h-[271px] mr-4 lg:bg-slate-200" aria-hidden />

                                <div className="flex w-full flex-wrap gap-4 sm:flex-col lg:w-[260px]">
                                    <div className="flex-col hidden sm:flex items-start gap-1 text-right lg:items-end">
                                        <span className="text-xs font-[400]  tracking-wide text-[#FA6E80]">Apply before {gig.applyBefore}</span>

                                    </div>
                                    <div>
                                        <p className="text-[14px] font-[400] text-[#444444] hidden sm:flex gap-1.5"><span className="text-[14px] font-[600]">AED </span> {gig.budgetLabel}</p>
                                        <div className="flex items-center justify-start gap-3">
                                            <div className="">
                                                <Calendar className="h-4 w-4" />
                                            </div>
                                            <div className=" text-sm font-[400] text-[#444444]">
                                                {gig.dateWindows.map((window, windowIndex) => (
                                                    <p key={`${gig.id}-window-${windowIndex}`}>
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

                                    <div className="flex items-start gap-3 text-sm text-slate-700">
                                        <div className="">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <p className="font-[400] text-[12px] text-[#444444]">{gig.supportingFileLabel}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator className="mt-8" />
                        </Link>

                    ))}
                </section>
            </div>
        </>
    )
}