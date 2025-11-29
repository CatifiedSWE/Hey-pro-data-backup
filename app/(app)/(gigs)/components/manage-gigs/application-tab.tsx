"use client";

import { CalendarDays, Check, Mail, MessageCircle, MessageCircleMore, Plus, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { gigsData } from "@/data/gigs";

import { sampleApplicants } from "./sample-data";
import { SeeAllReferralsDialog } from "./see-all-referrals";
import Image from "next/image";
import { SendRecommendationDialog } from "../recommend-gigs";

type ApplicationTabProps = {
    selectedGigIds: string[];
    actionIndicators: Record<string, Partial<Record<"release" | "shortlist" | "confirm", boolean>>>;
    onActionChange: (rowKey: string, action: "release" | "shortlist" | "confirm") => void;
};

export function ApplicationTab({ selectedGigIds, actionIndicators, onActionChange }: ApplicationTabProps) {
    const selectedGigs = gigsData.filter((gig) => selectedGigIds.includes(gig.id));

    if (!selectedGigs.length) {
        return (
            <Card className="bg-transparent border-none">
                <CardHeader>
                    <CardTitle>Select gigs to review applications</CardTitle>
                    <CardDescription>
                        Choose at least one gig in the Gigs tab to see its applicants here.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-8 w-full sm:w-full mx-auto ">
            <div className="sm:px-4 mx-auto">
                <div className="flex flex-wrap gap-3 mt-3 sm:w-full justify-between items-center sm:justify-start bg-white rounded-[10px]">
                    <SeeAllReferralsDialog />
                    <SendRecommendationDialog className="h-[30px]" />
                </div>
            </div>
            {selectedGigs.map((gig) => (
                <section key={gig.id} className="space-y-4 ">
                    <header className="space-y-3">

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 no-scrollbar overflow-x-auto">
                            <p className="text-lg font-semibold text-gray-900">{gig.title}</p>
                            <span className="flex items-center gap-1 justify-center text-[#000000]">
                                <CalendarDays className="h-4 w-4" />
                                {gig.dateWindows.map((window, index) => (
                                    <span key={window.label} className="">
                                        <span className="font-[500] text-[14px]">
                                            <span>{window.label.split(" ")[1]}</span>
                                            <span className="text-[#FA6E80] text-[14px]"> {window.label.split(" ")[0]}</span>

                                        </span>
                                        <span className="mx-1">|</span>
                                        {window.range}
                                        {index < gig.dateWindows.length - 1 && <span className="mx-1">·</span>}
                                    </span>
                                ))}
                            </span>
                        </div>
                    </header>

                    <div className="overflow-x-auto no-scrollbar">
                        <table className="min-w-[1057px] border-separate border-spacing-x-[2px] border-spacing-y-0 text-sm">
                            <thead className="bg-[#FFFFFF] border text-left h-[55px]">
                                <tr className="space-x-1">
                                    <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Name</th>
                                    <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">City</th>
                                    <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Skill Set</th>
                                    <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Credits</th>
                                    <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Referrals</th>
                                    <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Chat</th>
                                    <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Release</th>
                                    <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Shortlist</th>
                                    <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Confirm</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent">
                                {sampleApplicants.map((person) => {
                                    const rowKey = `${gig.id}-${person.id}`;
                                    const rowState = actionIndicators[rowKey] ?? {};
                                    const showReleaseEmail = Boolean(rowState.release);
                                    const showShortlistEmail = Boolean(rowState.shortlist);
                                    const showConfirmEmail = Boolean(rowState.confirm);

                                    return (
                                        <tr key={rowKey} className="text-gray-800">
                                            <td className="h-[41px] border border-[#DEDEDE] w-[205px] px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Image src={person.avatar} alt={person.name} width={30} height={30} className="rounded-full" />
                                                    <div>
                                                        <p className="font-[400] text-gray-900">{person.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="h-[41px] border border-[#DEDEDE] w-[100px] px-4 py-3 text-[#27B4BC]">{person.city}</td>
                                            <td className="h-[41px] border border-[#DEDEDE] w-[204px] px-4 py-3">{person.skills.join(" | ")}</td>
                                            <td className="h-[41px] border border-[#DEDEDE] w-[105px] px-4 py-3 text-[#27B4BC]">{person.credits}</td>
                                            <td className="h-[41px]  border border-[#DEDEDE] w-[115px] px-4 py-3">
                                                <div className="flex -space-x-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#27B4BC]/20 text-xs font-semibold text-[#27B4BC]">
                                                        {person.referrals}
                                                    </div>
                                                    <div className="h-8 w-8 rounded-full border-2 border-white bg-[#DEDEDE]" />
                                                </div>
                                            </td>
                                            <td className="h-[41px] border border-[#DEDEDE] w-[80px] px-4 py-3 text-center relative">
                                                <span className="inline-flex h-8 w-8 items-center justify-center relative">
                                                    <MessageCircleMore className="h-5 w-5" />
                                                    {/* Small red dot at the bottom left */}
                                                    <span
                                                        className="absolute bottom-2 right-2 h-1 w-1 rounded-full bg-[#FA596E]"
                                                        aria-label="Unread message indicator"
                                                    />
                                                </span>
                                            </td>
                                            <td className={`h-[50px] border text-center   border-[#DEDEDE] ${showReleaseEmail ? 'bg-[#FA596E]' : 'bg-[#ffffff]'}`}
                                                onClick={() => onActionChange(rowKey, "release")}
                                            >
                                                <span className="inline-flex h-8 w-8 items-center justify-center">{showReleaseEmail ? (
                                                    <Mail className="h-5 w-5 text-white" />
                                                ) : (
                                                    <X className="h-5 w-5 text-[#FA6E80]" />
                                                )}</span>


                                            </td>
                                            <td className={`h-[41px] border border-[#DEDEDE] w-[80px] bg-[#27B4BC] px-4 py-3 text-center ${showShortlistEmail ? 'bg-[#31A7AC]' : 'bg-[#ffffff]'}`}
                                                onClick={() => onActionChange(rowKey, "shortlist")}
                                            >
                                                <span
                                                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-[#ffffff]`}
                                                    aria-label="Shortlist via email"

                                                >
                                                    {showShortlistEmail ? (
                                                        <Mail className="h-5 w-5 text-white" />
                                                    ) : (
                                                        <Plus className="h-6 w-6 text-[#31A7AC]" />
                                                    )}
                                                </span>
                                            </td>
                                            <td className={`h-[41px] border border-[#DEDEDE] w-[80px] bg-[#27B4BC] px-4 py-3 text-center ${showConfirmEmail ? 'bg-[#31A7AC]' : 'bg-[#ffffff]'}`}
                                                onClick={() => onActionChange(rowKey, "confirm")}
                                            >
                                                <span
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full  text-white"
                                                    aria-label="Confirm via email"
                                                >
                                                    {showConfirmEmail ? (
                                                        <Mail className="h-5 w-5 text-white" />
                                                    ) : (
                                                        <Check className="h-6 w-6 text-[#27B4BC]" />
                                                    )}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            ))}
        </div>
    );
}
