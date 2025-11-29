import Image from "next/image";

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

import { gigsData } from "@/data/gigs";
import { contactGroups, sampleApplicants } from "./sample-data";

type ContactListTabProps = {
    selectedGigIds: string[];
    actionIndicators: Record<string, Partial<Record<"release" | "shortlist" | "confirm", boolean>>>;
};

export function ContactListTab({ selectedGigIds, actionIndicators }: ContactListTabProps) {
    const selectedGigs = gigsData.filter((gig) => selectedGigIds.includes(gig.id));

    if (!selectedGigs.length) {
        return (
            <Card className="bg-transparent border-none">
                <CardHeader>
                    <CardTitle>Select gigs to review contacts</CardTitle>
                    <CardDescription>
                        Choose at least one gig in the Gigs tab to view assigned department contacts.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-6 rounded-2xl bg-[#F8F8F8] p-3">
            {selectedGigs.map((gig) => {
                const shortlistedOrConfirmed = sampleApplicants.filter((person) => {
                    const state = actionIndicators[`${gig.id}-${person.id}`];
                    return Boolean(state?.shortlist || state?.confirm);
                });
                const selectedIds = new Set(shortlistedOrConfirmed.map((person) => person.id));

                const filteredGroups = contactGroups
                    .map((group) => ({
                        ...group,
                        entries: group.entries.filter((entry) => selectedIds.has(entry.person.id)),
                    }))
                    .filter((group) => group.entries.length > 0);

                return (
                    <section key={gig.id} className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex overflow-x-auto no-scrollbar flex-col gap-3 rounded-xl p-0">
                                <div className="flex flex-row overflow-x-auto no-scrollbar gap-3 text-sm text-[#000000] items-center w-[1050px] sm:flex-row sm:items-center sm:justify-start">
                                    <p className="text-lg font-normal text-[#000000]">{gig.title}</p>
                                    <div className="flex items-center gap-4 text-sm text-[#444444]">
                                        <CalendarDays className="h-5 w-5 text-black" />
                                        <div className="flex flex-wrap gap-4">
                                            {gig.dateWindows.map((window) => {
                                                const [month, year] = window.label.split(" ");
                                                return (
                                                    <div key={window.label} className="flex items-center gap-3  px-3 py-1 text-sm text-[#444444]">
                                                        <span className="text-sm font-semibold text-[#444444]">{year}</span>
                                                        <span className="rounded-[31px] h-[27px] bg-[#FA6E80] px-4 py-0.5 text-sm font-semibold text-[#ffffff] items-center justify-center flex">
                                                            {month}
                                                        </span>
                                                        <span className="text-sm text-[#444444]">{window.range}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {filteredGroups.length === 0 ? (
                                <p className="px-2 text-sm text-gray-500">No shortlisted or confirmed applicants yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {filteredGroups.map((group) => (
                                        <div key={`${gig.id}-${group.id}`} className="overflow-x-auto no-scrollbar bg-white">
                                            <div className="min-w-[1057px]">
                                                <div className="flex h-[55px] gap-px rounded-t-2xl px-0  bg-[#F8F8F8]">
                                                    <div className="flex w-[160px] flex-col justify-center border border-[#DEDEDE] px-1">
                                                        <p className="text-base font-medium text-black">Department</p>
                                                    </div>
                                                    <div className="flex w-[160px] flex-col justify-center border border-[#DEDEDE] px-1">
                                                        <p className="text-sm text-[#444444]">{group.department}</p>
                                                    </div>
                                                    <div className="flex flex-1 flex-col justify-center border border-[#DEDEDE] px-1">
                                                        <p className="text-sm text-[#444444]">{group.summary}</p>
                                                    </div>
                                                </div>

                                                <div className="flex h-[55px] gap-px bg-white">
                                                    {[
                                                        { label: "Role", width: 160 },
                                                        { label: "Company", width: 160 },
                                                        { label: "Name", width: 250 },
                                                        { label: "Phone", width: 170 },
                                                        { label: "Email ID", width: 313 },
                                                    ].map((column) => (
                                                        <div
                                                            key={`${group.id}-${column.label}`}
                                                            className="flex flex-col justify-center border border-[#DEDEDE] px-1"
                                                            style={{ width: column.width }}
                                                        >
                                                            <p className="text-base font-medium text-black">{column.label}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {group.entries.map((entry, index) => (
                                                    <div key={`${group.id}-${entry.person.id}-${index}`} className="flex h-[41px] gap-px bg-white">
                                                        <div className="flex w-[160px] flex-row justify-start border border-[#DEDEDE] px-1 text-[14px] text-[#444444]">
                                                            {entry.role}
                                                        </div>
                                                        <div className="flex w-[160px] flex-row justify-start border border-[#DEDEDE] px-1 text-sm text-[#444444]">
                                                            {entry.company}
                                                        </div>
                                                        <div className="flex w-[250px] items-center gap-3 border border-[#DEDEDE] px-1">
                                                            <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                                                                <Image
                                                                    src={entry.person.avatar}
                                                                    alt={entry.person.name}
                                                                    width={40}
                                                                    height={40}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <p className="text-sm text-[#444444]">{entry.person.name}</p>
                                                        </div>
                                                        <div className="flex w-[170px] flex-col justify-center border border-[#DEDEDE] px-5 text-sm text-[#444444]">
                                                            {entry.person.phone}
                                                        </div>
                                                        <div className="flex w-[313px] flex-col justify-center border border-[#DEDEDE] px-5 text-sm text-[#444444]">
                                                            {entry.person.email}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
