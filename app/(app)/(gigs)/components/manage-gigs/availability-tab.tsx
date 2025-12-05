"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";

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

type DateColumn = {
    fullKey: string; // "Sep 2025-12"
    day: string; // "12"
    dayName: string; // "M", "T", "W"...
    monthLabel: string; // "Sep 2025"
    year: number;
    monthName: string; // "Sep"
    dateObj: Date;
};

const buildCalendarStructure = (windows: Array<{ label: string; range: string }>) => {
    const columns: DateColumn[] = [];
    
    windows.forEach((window) => {
        const [month, yearStr] = window.label.split(" ");
        const monthIndex = new Date(`${month} 1, 2000`).getMonth();
        const yearNum = parseInt(yearStr);
        
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
                            monthLabel: window.label,
                            year: yearNum,
                            monthName: month,
                            dateObj: date
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
                        monthLabel: window.label,
                        year: yearNum,
                        monthName: month,
                        dateObj: date
                    });
                }
            }
        });
    });

    // Sort columns by date
    columns.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    
    return columns;
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
                        const gigResponse = await apiCalling({
                            method: 'get',
                            route: `/gigs/${gigId}`,
                        });

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
        <div className="space-y-12">
            {Object.entries(availabilityData).map(([gigId, { gig, availability }]) => {
                const columns = buildCalendarStructure(gig.dateWindows);
                const applicants = availability.applicantsAvailability || [];

                // Group columns by Month/Year for the top navigation
                const timelineGroups = useMemo(() => {
                    const groups: { year: number; months: { name: string; fullLabel: string; rangeText: string }[] }[] = [];
                    
                    gig.dateWindows.forEach(window => {
                        const [month, yearStr] = window.label.split(" ");
                        const year = parseInt(yearStr);
                        
                        let yearGroup = groups.find(g => g.year === year);
                        if (!yearGroup) {
                            yearGroup = { year, months: [] };
                            groups.push(yearGroup);
                        }
                        
                        yearGroup.months.push({
                            name: month,
                            fullLabel: window.label,
                            rangeText: window.range
                        });
                    });
                    
                    return groups.sort((a, b) => a.year - b.year);
                }, [gig.dateWindows]);

                // Determine date range text for the first month (active one)
                const firstMonthLabel = timelineGroups[0]?.months[0]?.fullLabel;
                const lastMonthLabel = timelineGroups[timelineGroups.length - 1]?.months[timelineGroups[timelineGroups.length - 1]?.months.length - 1]?.fullLabel;
                
                const dateRangeTitle = firstMonthLabel && lastMonthLabel 
                    ? `${firstMonthLabel} - ${lastMonthLabel}`
                    : "";

                return (
                    <section key={gigId} className="space-y-6 bg-transparent">
                        <header className="overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-6 text-sm min-w-max">
                                {timelineGroups.map((yearGroup, yearIdx) => (
                                    <div key={yearGroup.year} className="flex items-center gap-4">
                                        <span className="font-semibold text-lg text-black">{yearGroup.year}</span>
                                        
                                        {yearGroup.months.map((month, monthIdx) => {
                                            // Logic to determine if 'active' - for now, let's make the first one active as in design
                                            const isActive = yearIdx === 0 && monthIdx === 0;
                                            
                                            return (
                                                <div key={month.fullLabel} className="flex items-center gap-4">
                                                    <span className={`
                                                        px-4 py-1.5 rounded-full font-medium cursor-pointer transition-colors
                                                        ${isActive 
                                                            ? "bg-[#FA6E80] text-white" 
                                                            : "text-gray-500 hover:bg-gray-100"}
                                                    `}>
                                                        {month.name}
                                                    </span>
                                                    
                                                    {isActive && (
                                                        <span className="text-gray-900 font-medium">
                                                            {month.rangeText}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </header>

                        {applicants.length === 0 ? (
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardDescription>No applicants with availability data yet for this gig.</CardDescription>
                                </CardHeader>
                            </Card>
                        ) : (
                            <div className="overflow-x-auto no-scrollbar bg-white rounded-[10px] border border-gray-200">
                                <table className="min-w-max border-separate border-spacing-0 text-sm">
                                    <thead>
                                        <tr>
                                            {/* Sticky User Column Header */}
                                            <th className="sticky left-0 z-20 w-[280px] border-b border-r bg-white p-0 h-[70px]">
                                                <div className="h-full w-full flex items-center px-6 font-medium text-gray-900 border-r-4 border-[#FA6E80] bg-gray-50">
                                                    {dateRangeTitle}
                                                </div>
                                            </th>
                                            
                                            {/* Date Columns */}
                                            {columns.map((col, idx) => (
                                                <th 
                                                    key={`${gigId}-col-${col.fullKey}`} 
                                                    className="min-w-[60px] border-b border-r border-gray-100 p-2 text-center h-[70px] last:border-r-0"
                                                >
                                                    <div className="flex flex-col items-center justify-center gap-1 h-full">
                                                        <span className={`text-xs font-bold ${['S', 'Sun', 'Sat'].some(s => col.dayName.startsWith(s)) ? 'text-[#FA6E80]' : 'text-[#31A7AC]'}`}>
                                                            {col.dayName}
                                                        </span>
                                                        <span className={`text-base font-bold ${['S', 'Sun', 'Sat'].some(s => col.dayName.startsWith(s)) ? 'text-[#FA6E80]' : 'text-black'}`}>
                                                            {col.day}
                                                        </span>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applicants.map((applicant, idx) => (
                                            <tr key={applicant.applicantId} className="group hover:bg-gray-50">
                                                <td className="sticky left-0 z-10 border-b border-r bg-white group-hover:bg-gray-50 h-[80px]">
                                                    <div className="flex items-center gap-3 px-6 h-full">
                                                        {applicant.avatar ? (
                                                            <Image
                                                                src={applicant.avatar}
                                                                alt={applicant.name}
                                                                width={40}
                                                                height={40}
                                                                className="h-10 w-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                                                                {applicant.name.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-medium text-gray-900 text-sm">{applicant.name}</span>
                                                            {applicant.creditsStatus === 'added' ? (
                                                                <button className="text-xs text-[#31A7AC] hover:underline text-left">
                                                                    Credits added
                                                                </button>
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
                                                            key={`${applicant.applicantId}-${col.fullKey}`} 
                                                            className="border-b border-r border-gray-100 p-0 last:border-r-0 h-[80px]"
                                                        >
                                                            <div className="h-full w-full flex items-center justify-center">
                                                                {state === "na" && (
                                                                    <span className="text-sm text-gray-400">N/A</span>
                                                                )}
                                                                {state === "available" && (
                                                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                                )}
                                                                {state === "hold" && (
                                                                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                                                )}
                                                            </div>
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
