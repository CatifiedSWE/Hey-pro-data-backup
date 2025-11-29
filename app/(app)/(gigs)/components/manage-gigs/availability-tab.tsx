import Image from "next/image";

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { gigsData } from "@/data/gigs";

import { sampleApplicants, getAvailabilityState } from "./sample-data";

type CompactTimelineEntry = {
    key: string;
    monthLabel: string;
    dayLabel: string;
};

const buildTimelineEntries = (windows: typeof gigsData[number]["dateWindows"]): CompactTimelineEntry[] => {
    const entries: CompactTimelineEntry[] = [];
    windows.forEach((window) => {
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
                        const key = `${window.label}-${day}`;
                        entries.push({ key, monthLabel: window.label, dayLabel: day.toString() });
                    }
                }
            } else {
                const day = Number(token);
                if (!Number.isNaN(day)) {
                    const key = `${window.label}-${day}`;
                    entries.push({ key, monthLabel: window.label, dayLabel: day.toString() });
                }
            }
        });
    });
    return entries.slice(0, 40);
};

type AvailabilityTabProps = {
    selectedGigIds: string[];
};

export function AvailabilityTab({ selectedGigIds }: AvailabilityTabProps) {
    const selectedGigs = gigsData.filter((gig) => selectedGigIds.includes(gig.id));

    if (!selectedGigs.length) {
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

    return (
        <div className="space-y-8">
            {selectedGigs.map((gig) => {
                const timeline = buildTimelineEntries(gig.dateWindows);
                // console.log(timeline);
                const monthBadges = Array.from(new Set(timeline.map((entry) => entry.monthLabel)));
                return (
                    <section key={gig.id} className="space-y-4 bg-transparent">
                        <header className="space-y-3 overflow-x-auto no-scrollbar">
                            <p className="text-lg font-semibold text-gray-900">{gig.title}</p>
                            <div className="flex flex-row gap-2">
                            </div>
                            <div className="flex flex-row items-center gap-4 w-[950px] rounded-2xl border border-[#EFEFEF] bg-white px-4 py-3 text-sm text-gray-900">
                                {gig.dateWindows.map((window) => {
                                    const [month, year] = window.label.split(" ");
                                    return (
                                        <div key={`${gig.id}-${window.label}`} className="flex items-center gap-3">
                                            <span className="text-base font-semibold text-[#3B3B3B]">{year}</span>
                                            <span className="rounded-full bg-[#FA6E80] px-4 py-1 text-sm font-medium text-white">{month}</span>
                                            <span className="text-sm text-[#3B3B3B]">{window.range}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-sm text-gray-600">
                                Showing availability for every requested day; days without data default to N/A.
                            </p>
                        </header>
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="min-w-full border-separate border-spacing-x-[2px] border-spacing-y-[10px] text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600">
                                        <th className="sticky left-0 bg-gray-50 px-1 py-2 text-left font-medium text-gray-700 flex flex-row  justify-center items-center">
                                            {monthBadges.map((label) => (
                                                <span
                                                    key={label}
                                                    className=" px-1 py-1 text-[14px] font-[400] text-[#FA6E80] "
                                                >
                                                    {label}
                                                </span>
                                            ))}
                                        </th>
                                        {timeline.map((entry) => (
                                            <th
                                                key={entry.key}
                                                className="min-w-[32px] px-1 py-1 text-center text-xs font-semibold text-gray-500"
                                            >
                                                <span className="block text-[9px] uppercase tracking-wider text-gray-400">
                                                    {entry.monthLabel.split(" ")[0]}
                                                </span>
                                                <span className="text-sm text-gray-900">{entry.dayLabel}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {sampleApplicants.map((person) => (
                                        <tr key={`${gig.id}-availability-${person.id}`}>
                                            <td className="sticky left-0 flex w-[160px] items-center justify-center gap-2 bg-white px-4 py-2">
                                                <Image
                                                    src={person.avatar}
                                                    alt={person.name}
                                                    width={32}
                                                    height={32}
                                                    className="h-8 w-8 rounded-full bg-gray-200"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{person.name}</p>
                                                    {person.credits ? (
                                                        <p className="text-xs text-[#31A7AC]">Credits added</p>
                                                    ) : (
                                                        <p className="text-xs text-[#31A7AC]">Credits pending</p>
                                                    )}
                                                </div>
                                            </td>
                                            {timeline.map((entry) => {
                                                const dayKey = `${entry.monthLabel}-${entry.dayLabel}`;
                                                const state = getAvailabilityState(person.id, dayKey);
                                                if (state === "na") {
                                                    return (
                                                        <td key={entry.key} className="border h-[41px] w-[38px] px-2 py-1 text-center text-xs text-gray-400">
                                                            N/A
                                                        </td>
                                                    );
                                                }
                                                if (state === "hold") {
                                                    return (
                                                        <td key={entry.key} className="border h-[41px] w-[38px] bg-[#6A89BE] px-2 py-1 text-center">
                                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md text-xs font-semibold text-black">
                                                                C
                                                            </span>
                                                        </td>
                                                    );
                                                }
                                                return (
                                                    <td key={entry.key} className="border h-[41px] w-[38px] bg-[#FCAF45] px-2 py-1 text-center">
                                                        <span className="inline-flex h-5 w-5 items-center justify-center text-xs font-semibold text-black">
                                                            P1
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
