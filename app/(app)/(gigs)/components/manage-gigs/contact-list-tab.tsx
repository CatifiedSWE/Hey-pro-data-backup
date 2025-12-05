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
    role: string;
    department: string;
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

                        // Fetch shortlisted applications for this gig
                        const shortlistedResponse = await apiCalling({
                            method: 'get',
                            route: `/gigs/${gigId}/applications?status=shortlisted`,
                        });

                        // Fetch confirmed applications for this gig
                        const confirmedResponse = await apiCalling({
                            method: 'get',
                            route: `/gigs/${gigId}/applications?status=confirmed`,
                        });

                        if (gigResponse.status && (shortlistedResponse.status || confirmedResponse.status)) {
                            const gigData = gigResponse.data.data;
                            const shortlistedApps = shortlistedResponse.status 
                                ? (shortlistedResponse.data.data.applications || [])
                                : [];
                            const confirmedApps = confirmedResponse.status 
                                ? (confirmedResponse.data.data.applications || [])
                                : [];
                            
                            // Combine shortlisted and confirmed applications
                            const applications = [...shortlistedApps, ...confirmedApps];

                            // Transform applications into contacts format
                            const contacts: Contact[] = applications.map((app: any) => {
                                // Extract company from work_identities if available
                                let company = 'N/A';
                                try {
                                    if (app.applicant.workIdentities) {
                                        const workIds = typeof app.applicant.workIdentities === 'string' 
                                            ? JSON.parse(app.applicant.workIdentities) 
                                            : app.applicant.workIdentities;
                                        
                                        if (workIds.employee?.enabled && workIds.employee?.company) {
                                            company = workIds.employee.company;
                                        } else if (workIds.businessOwner?.enabled && workIds.businessOwner?.businessName) {
                                            company = workIds.businessOwner.businessName;
                                        }
                                    }
                                } catch (e) {
                                    console.error('Error parsing work_identities:', e);
                                }

                                return {
                                    id: app.id,
                                    gig_id: gigId,
                                    role: gigData.role || 'N/A',
                                    company: company,
                                    name: app.applicant.name || 'Unknown',
                                    phone: app.applicant.phone || 'N/A',
                                    email: app.applicant.email || 'N/A',
                                    avatar: app.applicant.profilePhoto || null,
                                    department: gigData.department || 'N/A',
                                };
                            });

                            results[gigId] = {
                                gig: {
                                    id: gigData.id,
                                    title: gigData.title,
                                    role: gigData.role,
                                    department: gigData.department,
                                    dateWindows: gigData.dateWindows || [],
                                },
                                contacts: contacts,
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
                    <CardTitle>Select gigs to review shortlisted applicants</CardTitle>
                    <CardDescription>
                        Choose at least one gig in the Gigs tab to view contact details of shortlisted applicants.
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
                                            {gig.dateWindows.map((window, index) => (
                                                <div key={`${gigId}-window-${index}`} className="flex items-center gap-2 px-3 py-1 text-sm text-[#444444]">
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
                                <p className="px-2 text-sm text-gray-500">No shortlisted applicants for this gig yet.</p>
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
