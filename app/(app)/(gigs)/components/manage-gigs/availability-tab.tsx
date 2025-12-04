"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import apiCalling from "@/lib/apiCalling";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";

type Gig = {
    id: string;
    title: string;
    dateWindows: Array<{
        label: string;
        range: string;
    }>;
};

type ApplicantAvailability = {
    applicantId: string;
    name: string;
    avatar: string | null;
    creditsStatus: 'added' | 'not_added';
    applicationStatus: string;
    schedule: { [key: string]: string };
};

type AvailabilityData = {
    gigDates: Array<{
        label: string;
        range: string;
    }>;
    applicantsAvailability: ApplicantAvailability[];
};

// Helper to build the calendar structure
type DateColumn = {
    fullKey: string; // "Sep 2025-12"
    day: string; // "12"
    dayName: string; // "F" (Friday) etc - For now assuming we simulate day names or calculate them
    monthLabel: string; // "Sep 2025"
};

const buildCalendarStructure = (windows: Array<{ label: string; range: string }>) => {
    const columns: DateColumn[] = [];
    
    // Mapping of windows to parsed dates
    // Window label example: "Sep 2025"
    
    windows.forEach((window) => {
        const [month, year] = window.label.split(" ");
        const monthIndex = new Date(`${month} 1, 2000`).getMonth(); // simplistic
        const yearNum = parseInt(year);
        
        const tokens = window.range
            .split(",")
            .map((token) => token.trim())
            .filter(Boolean);
            
        tokens.forEach((token) => {
            if (token.includes("-")) {
                const [startStr, endStr] = token.split("-");
                const start = Number(startStr);
                const end = Number(endStr);
                if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
                    for (let day = start; day <= end; day++) {
                        const date = new Date(yearNum, monthIndex, day);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'narrow' });
                        const fullKey = `${window.label}-${day}`;
                        columns.push({
                            fullKey,
                            day: day.toString(),
                            dayName: dayName || 'D',
                            monthLabel: window.label
                        });
                    }
                }
            } else {
                const day = Number(token);
                if (!Number.isNaN(day)) {
                    const date = new Date(yearNum, monthIndex, day);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'narrow' });
                    const fullKey = `${window.label}-${day}`;
                    columns.push({
                        fullKey,
                        day: day.toString(),
                        dayName: dayName || 'D',
                        monthLabel: window.label
                    });
                }
            }
        });
    });
    
    // Group by month label for the header
    const months: { label: string; colspan: number }[] = [];
    let currentMonth = "";
    let count = 0;
    
    columns.forEach((col, index) => {
        if (col.monthLabel !== currentMonth) {
            if (currentMonth) {
                months.push({ label: currentMonth, colspan: count });
            }
            currentMonth = col.monthLabel;
            count = 1;
        } else {
            count++;
        }
        
        if (index === columns.length - 1) {
            months.push({ label: currentMonth, colspan: count });
        }
    });
    
    return { columns, months };
};

type AvailabilityTabProps = {
    selectedGigIds: string[];
};

export function AvailabilityTab({ selectedGigIds }: AvailabilityTabProps) {
    const [availabilityData, setAvailabilityData] = useState<Record<string, { gig: Gig; availability: AvailabilityData }>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (selectedGigIds.length === 0) {
                setAvailabilityData({});
                return;
            }

            try {
                setLoading(true);
                const results: Record<string, { gig: Gig; availability: AvailabilityData }> = {};

                await Promise.all(
                    selectedGigIds.map(async (gigId) => {
                        // Fetch gig details
                        const gigResponse = await apiCalling({
                            method: 'get',
                            route: `/gigs/${gigId}`,
                        });

                        // Fetch availability
                        const availabilityResponse = await apiCalling({
                            method: 'get',
                            route: `/gigs/${gigId}/availability`,
                        });

                        if (gigResponse.status && availabilityResponse.status) {
                            results[gigId] = {
                                gig: {
                                    id: gigResponse.data.data.id,
                                    title: gigResponse.data.data.title,
                                    dateWindows: gigResponse.data.data.dateWindows || [],
                                },
                                availability: availabilityResponse.data.data,
                            };
                        }
                    })
                );

                setAvailabilityData(results);
            } catch (error) {
                console.error('Error fetching availability:', error);
                toast.error('Failed to load availability data');
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, [selectedGigIds]);

    if (selectedGigIds.length === 0) {
        return (
            <Card className="bg-transparent border-none">
                <CardHeader>
                    <CardTitle>Select gigs to review availability</CardTitle>
                    <CardDescription>
                        Choose at least one gig in the Gigs tab to inspect talent availability across requested dates.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (loading) {
        return (
            <Card className="bg-transparent border-none">
                <CardHeader>
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA6E80]"></div>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {Object.entries(availabilityData).map(([gigId, { gig, availability }]) => {
                const { columns, months } = buildCalendarStructure(gig.dateWindows);
                const applicants = availability.applicantsAvailability || [];

                return (
                    <section key={gigId} className="space-y-6 bg-transparent">
                        <header className="space-y-3 overflow-x-auto no-scrollbar">
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                <p className="text-lg font-semibold text-gray-900">{gig.title}</p>
                                <span className="flex items-center gap-1 justify-center text-[#000000]">
                                    <CalendarDays className="h-4 w-4" />
                                    {gig.dateWindows.map((window, index) => (
                                        <span key={`${gigId}-window-${index}`} className="">
                                            <span className="font-[500] text-[14px]">
                                                <span className="text-[#FA6E80] text-[14px]">{window.label.split(" ")[1]}</span>
                                                <span className="bg-[#FA6E80] text-white px-2 py-0.5 rounded-full text-[12px] ml-1"> {window.label.split(" ")[0]}</span>
                                            </span>
                                            <span className="mx-1">|</span>
                                            {window.range}
                                            {index < gig.dateWindows.length - 1 && <span className="mx-1">·</span>}
                                        </span>
                                    ))}
                                </span>
                            </div>
                        </header>

                        {applicants.length === 0 ? (
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardDescription>No applicants with availability data yet for this gig.</CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <div className="overflow-x-auto no-scrollbar bg-white rounded-[10px]">
                                <table className="min-w-full border-separate border-spacing-0 text-sm">
                                    <thead>
                                        <tr className="bg-[#FFF0F2]">
                                            <th className="sticky left-0 z-20 w-[200px] border-b border-r bg-[#FFF0F2] p-0">
                                                <div className="p-4 text-left font-medium text-[#FA6E80]">
                                                    {months.map(m => m.label).join(' - ')}
                                                </div>
                                            </th>
                                            {columns.map((col, idx) => (
                                                <th 
                                                    key={idx} 
                                                    className="min-w-[40px] border-b border-r border-[#FFE4E8] p-2 text-center last:border-r-0"
                                                >
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="text-xs text-[#FA6E80] font-medium">{col.dayName}</span>
                                                        <span className="text-sm font-bold text-gray-700">{col.day}</span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applicants.map((applicant, idx) => (
                                            <tr key={applicant.applicantId} className="group hover:bg-gray-50">
                                                <td className="sticky left-0 z-10 border-b border-r bg-white group-hover:bg-gray-50">
                                                    <div className="flex items-center gap-3 p-4">
                                                        {applicant.avatar ? (
                                                            <Image
                                                                src={applicant.avatar}
                                                                alt={applicant.name}
                                                                width={40}
                                                                height={40}
                                                                className="h-10 w-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                                {applicant.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-900">{applicant.name}</span>
                                                            {applicant.creditsStatus === 'added' ? (
                                                                <span className="text-xs text-[#31A7AC]">Credits added</span>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">N/A</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                {columns.map((col, cIdx) => {
                                                    const state = applicant.schedule[col.fullKey] || 'na';
                                                    return (
                                                        <td 
                                                            key={cIdx} 
                                                            className="border-b border-r border-gray-100 p-0 last:border-r-0"
                                                        >
                                                            {state === "na" && (
                                                                <div className="h-[72px] w-full flex items-center justify-center">
                                                                    <span className="text-xs text-gray-300">N/A</span>
                                                                </div>
                                                            )}
                                                            {state === "hold" && (
                                                                <div className="h-[72px] w-full bg-white flex items-center justify-center">
                                                                    {/* Use blank or specific style */}
                                                                </div>
                                                            )}
                                                            {state === "available" && (
                                                                <div className="h-[72px] w-full bg-white flex items-center justify-center">
                                                                    {/* Available cell content if needed */}
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}
