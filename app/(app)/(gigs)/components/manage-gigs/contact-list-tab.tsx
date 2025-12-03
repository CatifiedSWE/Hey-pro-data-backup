"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import apiCalling from "@/lib/apiCalling";
import { toast } from "sonner";

type Gig = {
    id: string;
    title: string;
    dateWindows: Array<{
        label: string;
        range: string;
    }>;
};

type Contact = {
    id: string;
    gig_id: string;
    role: string;
    company: string;
    name: string;
    phone: string;
    email: string;
    avatar: string | null;
    department: string;
};

type ContactListTabProps = {
    selectedGigIds: string[];
    actionIndicators: Record<string, Partial<Record<"release" | "shortlist" | "confirm", boolean>>>;
};

export function ContactListTab({ selectedGigIds, actionIndicators }: ContactListTabProps) {
    const [contactsData, setContactsData] = useState<Record<string, { gig: Gig; contacts: Contact[] }>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchContacts = async () => {
            if (selectedGigIds.length === 0) {
                setContactsData({});
                return;
            }

            try {
                setLoading(true);
                const results: Record<string, { gig: Gig; contacts: Contact[] }> = {};

                await Promise.all(
                    selectedGigIds.map(async (gigId) => {
                        // Fetch gig details
                        const gigResponse = await apiCalling({
                            method: 'get',
                            route: `/gigs/${gigId}`,
                        });

                        // Fetch contacts
                        const contactsResponse = await apiCalling({
                            method: 'get',
                            route: `/contacts/gig/${gigId}`,
                        });

                        if (gigResponse.status && contactsResponse.status) {
                            results[gigId] = {
                                gig: {
                                    id: gigResponse.data.data.id,
                                    title: gigResponse.data.data.title,
                                    dateWindows: gigResponse.data.data.dateWindows || [],
                                },
                                contacts: contactsResponse.data.data || [],
                            };
                        }
                    })
                );

                setContactsData(results);
            } catch (error) {
                console.error('Error fetching contacts:', error);
                toast.error('Failed to load contacts');
            } finally {
                setLoading(false);
            }
        };

        fetchContacts();
    }, [selectedGigIds]);

    if (selectedGigIds.length === 0) {
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
        <div className="space-y-6 rounded-2xl bg-[#F8F8F8] p-3">
            {Object.entries(contactsData).map(([gigId, { gig, contacts }]) => {
                // Group contacts by department
                const contactsByDepartment = contacts.reduce((acc, contact) => {
                    const dept = contact.department || 'Other';
                    if (!acc[dept]) {
                        acc[dept] = [];
                    }
                    acc[dept].push(contact);
                    return acc;
                }, {} as Record<string, Contact[]>);

                return (
                    <section key={gigId} className="space-y-4">
                        <div className="flex flex-col gap-3">
                            <div className="flex overflow-x-auto no-scrollbar flex-col gap-3 rounded-xl p-0">
                                <div className="flex flex-row overflow-x-auto no-scrollbar gap-3 text-sm text-[#000000] items-center w-[1050px] sm:flex-row sm:items-center sm:justify-start">
                                    <p className="text-lg font-normal text-[#000000]">{gig.title}</p>
                                    <div className="flex items-center gap-4 text-sm text-[#444444]">
                                        <CalendarDays className="h-5 w-5 text-black" />
                                        <div className="flex flex-wrap gap-4">
                                            {gig.dateWindows.map((window) => (
                                                <div key={window.label} className="flex items-center gap-2 px-3 py-1 text-sm text-[#444444]">
                                                    <span className="text-sm font-semibold text-[#444444]">{window.label.split(" ")[1]}</span>
                                                    <span className="rounded-[31px] h-[27px] bg-[#FA6E80] px-4 py-0.5 text-sm font-semibold text-[#ffffff] items-center justify-center flex">
                                                        {window.label.split(" ")[0]}
                                                    </span>
                                                    <span className="text-sm text-[#444444]">{window.range}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {contacts.length === 0 ? (
                                <p className="px-2 text-sm text-gray-500">No contacts added yet for this gig.</p>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(contactsByDepartment).map(([department, deptContacts]) => (
                                        <div key={`${gigId}-${department}`} className="overflow-x-auto no-scrollbar bg-white border border-[#DEDEDE] rounded-[10px]">
                                            <div className="min-w-[1057px]">
                                                {/* Department Header Row */}
                                                <div className="flex h-[55px] border-b border-[#DEDEDE]">
                                                    <div className="flex w-[160px] items-center border-r border-[#DEDEDE] px-4 bg-white">
                                                        <p className="text-base font-medium text-black">Department</p>
                                                    </div>
                                                    <div className="flex w-[160px] items-center border-r border-[#DEDEDE] px-4 bg-white">
                                                        <p className="text-sm text-[#444444]">{department}</p>
                                                    </div>
                                                    <div className="flex flex-1 items-center px-4 bg-white">
                                                        <p className="text-sm text-[#444444]">{gig.title}</p>
                                                    </div>
                                                </div>

                                                {/* Columns Header */}
                                                <div className="flex h-[55px] border-b border-[#DEDEDE] bg-white">
                                                    {[
                                                        { label: "Role", width: 160 },
                                                        { label: "Company", width: 160 },
                                                        { label: "Name", width: 250 },
                                                        { label: "Phone", width: 170 },
                                                        { label: "Email ID", width: 313 },
                                                    ].map((column, idx) => (
                                                        <div
                                                            key={`${department}-${column.label}`}
                                                            className={`flex items-center px-4 ${idx < 4 ? 'border-r border-[#DEDEDE]' : ''}`}
                                                            style={{ width: column.width }}
                                                        >
                                                            <p className="text-base font-medium text-black">{column.label}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Data Rows */}
                                                {deptContacts.map((contact, index) => (
                                                    <div key={`${department}-${contact.id}-${index}`} className="flex h-[60px] border-b border-[#DEDEDE] last:border-0 bg-white">
                                                        <div className="flex w-[160px] items-center border-r border-[#DEDEDE] px-4 text-[14px] text-[#444444]">
                                                            {contact.role}
                                                        </div>
                                                        <div className="flex w-[160px] items-center border-r border-[#DEDEDE] px-4 text-sm text-[#444444]">
                                                            {contact.company}
                                                        </div>
                                                        <div className="flex w-[250px] items-center gap-3 border-r border-[#DEDEDE] px-4">
                                                            <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-200 shrink-0">
                                                                {contact.avatar ? (
                                                                    <Image
                                                                        src={contact.avatar}
                                                                        alt={contact.name}
                                                                        width={36}
                                                                        height={36}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-xs">
                                                                        {contact.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-[#444444] truncate">{contact.name}</p>
                                                        </div>
                                                        <div className="flex w-[170px] items-center border-r border-[#DEDEDE] px-4 text-sm text-[#444444]">
                                                            {contact.phone}
                                                        </div>
                                                        <div className="flex w-[313px] items-center px-4 text-sm text-[#444444]">
                                                            {contact.email}
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
