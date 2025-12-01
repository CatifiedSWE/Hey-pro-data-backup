"use client";

import { CalendarDays, Check, Mail, MessageCircle, MessageCircleMore, Plus, Send, X } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import apiCalling from "@/lib/apiCalling";
import { toast } from "sonner";

import { SeeAllReferralsDialog } from "./see-all-referrals";
import Image from "next/image";
import { SendRecommendationDialog } from "../recommend-gigs";

type Applicant = {
    id: string;
    gigId: string;
    status: string;
    applicant: {
        id: string;
        name: string;
        profilePhoto: string | null;
        location: string;
        email: string | null;
        phone: string | null;
        skills: Array<{ name: string; level: string }>;
        recentExperience: any[];
    };
};

type Gig = {
    id: string;
    title: string;
    dateWindows: Array<{
        label: string;
        range: string;
    }>;
};

type ApplicationTabProps = {
    selectedGigIds: string[];
    actionIndicators: Record<string, Partial<Record<"release" | "shortlist" | "confirm", boolean>>>;
    onActionChange: (rowKey: string, action: "release" | "shortlist" | "confirm") => void;
};

export function ApplicationTab({ selectedGigIds, actionIndicators, onActionChange }: ApplicationTabProps) {
    const [selectedGigs, setSelectedGigs] = useState<Record<string, { gig: Gig; applications: Applicant[] }>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchApplications = async () => {
            if (selectedGigIds.length === 0) {
                setSelectedGigs({});
                return;
            }

            try {
                setLoading(true);
                const results: Record<string, { gig: Gig; applications: Applicant[] }> = {};

                // Fetch applications for each selected gig
                await Promise.all(
                    selectedGigIds.map(async (gigId) => {
                        // Fetch gig details
                        const gigResponse = await apiCalling({
                            method: 'get',
                            route: `/gigs/${gigId}`,
                        });

                        // Fetch applications
                        const appsResponse = await apiCalling({
                            method: 'get',
                            route: `/gigs/${gigId}/applications`,
                        });

                        if (gigResponse.status && appsResponse.status) {
                            results[gigId] = {
                                gig: {
                                    id: gigResponse.data.data.id,
                                    title: gigResponse.data.data.title,
                                    dateWindows: gigResponse.data.data.dateWindows || [],
                                },
                                applications: appsResponse.data.data.applications || [],
                            };
                        }
                    })
                );

                setSelectedGigs(results);
            } catch (error) {
                console.error('Error fetching applications:', error);
                toast.error('Failed to load applications');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [selectedGigIds]);

    const handleStatusChange = async (applicationId: string, gigId: string, newStatus: string) => {
        try {
            const response = await apiCalling({
                method: 'patch',
                route: `/gigs/${gigId}/applications/${applicationId}/status`,
                data: { status: newStatus },
            });

            if (response.status) {
                toast.success(`Application status updated to ${newStatus}`);
                // Refresh applications
                const appsResponse = await apiCalling({
                    method: 'get',
                    route: `/gigs/${gigId}/applications`,
                });

                if (appsResponse.status) {
                    setSelectedGigs(prev => ({
                        ...prev,
                        [gigId]: {
                            ...prev[gigId],
                            applications: appsResponse.data.data.applications || [],
                        },
                    }));
                }
            } else {
                toast.error('Failed to update application status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    if (selectedGigIds.length === 0) {
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
        <div className="space-y-8 w-full sm:w-full mx-auto ">
            <div className="sm:px-4 mx-auto">
                <div className="flex flex-wrap gap-3 mt-3 sm:w-full justify-between items-center sm:justify-start bg-white rounded-[10px]">
                    <SeeAllReferralsDialog />
                    <SendRecommendationDialog className="h-[30px]" />
                </div>
            </div>
            {Object.entries(selectedGigs).map(([gigId, { gig, applications }]) => (
                <section key={gigId} className="space-y-4 ">
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

                    {applications.length === 0 ? (
                        <Card className="bg-white">
                            <CardHeader>
                                <CardDescription>No applications yet for this gig.</CardDescription>
                            </CardHeader>
                        </Card>
                    ) : (
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="min-w-[1057px] border-separate border-spacing-x-[2px] border-spacing-y-0 text-sm">
                                <thead className="bg-[#FFFFFF] border text-left h-[55px]">
                                    <tr className="space-x-1">
                                        <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Name</th>
                                        <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">City</th>
                                        <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Skill Set</th>
                                        <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Status</th>
                                        <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-transparent">
                                    {applications.map((app) => (
                                        <tr key={app.id} className="text-gray-800">
                                            <td className="h-[41px] border border-[#DEDEDE] w-[205px] px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {app.applicant.profilePhoto && (
                                                        <Image 
                                                            src={app.applicant.profilePhoto} 
                                                            alt={app.applicant.name} 
                                                            width={30} 
                                                            height={30} 
                                                            className="rounded-full" 
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-[400] text-gray-900">{app.applicant.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="h-[41px] border border-[#DEDEDE] w-[100px] px-4 py-3 text-[#27B4BC]">
                                                {app.applicant.location}
                                            </td>
                                            <td className="h-[41px] border border-[#DEDEDE] w-[204px] px-4 py-3">
                                                {app.applicant.skills.slice(0, 2).map(s => s.name).join(' | ')}
                                            </td>
                                            <td className="h-[41px] border border-[#DEDEDE] w-[100px] px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    app.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'shortlisted' ? 'bg-blue-100 text-blue-700' :
                                                    app.status === 'released' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="h-[41px] border border-[#DEDEDE] px-4 py-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStatusChange(app.id, gigId, 'shortlisted')}
                                                        disabled={app.status === 'shortlisted'}
                                                        className="text-xs"
                                                    >
                                                        Shortlist
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStatusChange(app.id, gigId, 'confirmed')}
                                                        disabled={app.status === 'confirmed'}
                                                        className="text-xs"
                                                    >
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStatusChange(app.id, gigId, 'released')}
                                                        disabled={app.status === 'released'}
                                                        className="text-xs"
                                                    >
                                                        Release
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            ))}
        </div>
    );
}
