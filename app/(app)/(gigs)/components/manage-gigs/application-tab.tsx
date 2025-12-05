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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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

type Credit = {
    id: string;
    title: string;
    role: string;
    year: string | number;
    description?: string;
    imdbUrl?: string;
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
    const [creditsDialog, setCreditsDialog] = useState<{
        open: boolean;
        loading: boolean;
        applicantName: string;
        credits: Credit[];
    }>({
        open: false,
        loading: false,
        applicantName: '',
        credits: [],
    });

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
                        try {
                            // Fetch gig details
                            const gigResponse = await apiCalling({
                                method: 'get',
                                route: `/gigs/${gigId}`,
                            });

                            if (!gigResponse.status) {
                                console.error(`Failed to fetch gig ${gigId}:`, gigResponse.message);
                                toast.error(`Failed to fetch gig details: ${gigResponse.message}`);
                                return;
                            }

                            // Fetch applications
                            const appsResponse = await apiCalling({
                                method: 'get',
                                route: `/gigs/${gigId}/applications`,
                            });

                            if (!appsResponse.status) {
                                console.error(`Failed to fetch applications for gig ${gigId}:`, appsResponse.message);
                                // Don't show error toast for applications - might just be permission issue
                                return;
                            }

                            if (gigResponse.data?.data && appsResponse.data?.data) {
                                results[gigId] = {
                                    gig: {
                                        id: gigResponse.data.data.id,
                                        title: gigResponse.data.data.title,
                                        dateWindows: gigResponse.data.data.dateWindows || [],
                                    },
                                    applications: appsResponse.data.data.applications || [],
                                };
                            }
                        } catch (error) {
                            console.error(`Error fetching data for gig ${gigId}:`, error);
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

    const handleViewCredits = async (applicantId: string, applicantName: string) => {
        try {
            setCreditsDialog({
                open: true,
                loading: true,
                applicantName,
                credits: [],
            });

            const response = await apiCalling({
                method: 'get',
                route: `/explore/${applicantId}`,
            });

            if (response.status && response.data?.data) {
                const credits = response.data.data.credits || [];
                setCreditsDialog({
                    open: true,
                    loading: false,
                    applicantName,
                    credits,
                });
            } else {
                toast.error('Failed to fetch credits');
                setCreditsDialog(prev => ({ ...prev, open: false, loading: false }));
            }
        } catch (error) {
            console.error('Error fetching credits:', error);
            toast.error('Failed to load credits');
            setCreditsDialog(prev => ({ ...prev, open: false, loading: false }));
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
                <div className="flex flex-wrap gap-3 mt-3 sm:w-full justify-between items-center sm:justify-start bg-white rounded-[10px] p-4">
                    <button className="text-[#FA6E80] font-medium text-sm hover:underline">
                        See referrals
                    </button>
                    <Button className="bg-[#FA6E80] hover:bg-[#e55b6d] text-white rounded-lg px-6">
                        Invite crew for this Gig
                    </Button>
                </div>
            </div>
            {Object.entries(selectedGigs).map(([gigId, { gig, applications }]) => (
                <section key={gigId} className="space-y-4 ">
                    <header className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 no-scrollbar overflow-x-auto">
                            <p className="text-xl font-normal text-black">{gig.title}</p>
                            <CalendarDays className="h-5 w-5 text-black" />
                            {gig.dateWindows.map((window, index) => (
                                <span key={`${gigId}-window-${index}`} className="flex items-center gap-1">
                                    <span className="text-[#FA6E80] font-normal text-sm">
                                        {window.label.split(" ")[0]}
                                    </span>
                                    <span className="text-black font-normal text-sm">
                                        {window.label.split(" ")[1]}
                                    </span>
                                    <span className="bg-[#FA6E80] text-white px-3 py-1 rounded-full text-xs font-medium">
                                        {window.range}
                                    </span>
                                    {index < gig.dateWindows.length - 1 && <span className="mx-1 text-black">·</span>}
                                </span>
                            ))}
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
                                        <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Credits</th>
                                        <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000]">Referrals</th>
                                        <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000] text-center">Chat</th>
                                        <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000] text-center">Release</th>
                                        <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000] text-center">Shortlist</th>
                                        <th className="border-1 border-[#DEDEDE] px-4 py-3 font-[500] text-[#000000] text-center">Confirm</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-transparent">
                                    {applications.map((app) => (
                                        <tr key={app.id} className="text-gray-800">
                                            <td className="h-[60px] border border-[#DEDEDE] w-[205px] px-4 py-2 bg-white">
                                                <div className="flex items-center gap-3">
                                                    {app.applicant.profilePhoto ? (
                                                        <Image 
                                                            src={app.applicant.profilePhoto} 
                                                            alt={app.applicant.name} 
                                                            width={36} 
                                                            height={36} 
                                                            className="rounded-full object-cover h-9 w-9" 
                                                        />
                                                    ) : (
                                                        <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                                                            {app.applicant.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-[500] text-gray-900">{app.applicant.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="h-[60px] border border-[#DEDEDE] w-[100px] px-4 py-2 text-[#27B4BC] bg-white">
                                                {app.applicant.location}
                                            </td>
                                            <td className="h-[60px] border border-[#DEDEDE] w-[204px] px-4 py-2 bg-white text-[#444444]">
                                                <div className="flex flex-wrap gap-2">
                                                    {app.applicant.skills.slice(0, 2).map((s, idx) => (
                                                        <span key={idx} className="border-r border-gray-300 pr-2 last:border-0 last:pr-0">
                                                            {s.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="h-[60px] border border-[#DEDEDE] w-[100px] px-4 py-2 bg-white">
                                                <button 
                                                    onClick={() => handleViewCredits(app.applicant.id, app.applicant.name)}
                                                    className="text-[#27B4BC] hover:underline text-sm"
                                                    data-testid={`view-credits-${app.applicant.id}`}
                                                >
                                                    View credits
                                                </button>
                                            </td>
                                            <td className="h-[60px] border border-[#DEDEDE] w-[120px] px-4 py-2 bg-white">
                                                <div className="flex items-center gap-1">
                                                    <div className="flex -space-x-2">
                                                        <div className="h-6 w-6 rounded-full border-2 border-white bg-gray-200"></div>
                                                        <div className="h-6 w-6 rounded-full border-2 border-white bg-gray-300"></div>
                                                        <div className="h-6 w-6 rounded-full border-2 border-white bg-gray-400"></div>
                                                    </div>
                                                    <span className="bg-[#31A7AC] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
                                                        15
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="h-[60px] border border-[#DEDEDE] w-[60px] px-4 py-2 text-center bg-white">
                                                <button className="flex items-center justify-center w-full">
                                                    <Image 
                                                        src="/icons/chat-teal.png" 
                                                        alt="Chat" 
                                                        width={32} 
                                                        height={32} 
                                                        className="object-contain" 
                                                    />
                                                </button>
                                            </td>
                                            <td className="h-[60px] border border-[#DEDEDE] w-[80px] px-4 py-2 text-center bg-white">
                                                <button 
                                                    onClick={() => handleStatusChange(app.id, gigId, 'released')}
                                                    className="mx-auto transition-opacity hover:opacity-80"
                                                >
                                                    {app.status === 'released' ? (
                                                        <div className="h-10 w-10 bg-[#FA6E80] rounded flex items-center justify-center">
                                                            <X className="h-5 w-5 text-white" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-10 w-10 flex items-center justify-center">
                                                            <X className="h-5 w-5 text-[#FA6E80]" />
                                                        </div>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="h-[60px] border border-[#DEDEDE] w-[80px] px-4 py-2 text-center bg-white">
                                                <button 
                                                    onClick={() => handleStatusChange(app.id, gigId, 'shortlisted')}
                                                    className="mx-auto transition-opacity hover:opacity-80"
                                                >
                                                    {app.status === 'shortlisted' ? (
                                                        <div className="h-10 w-10 bg-[#31A7AC] rounded flex items-center justify-center">
                                                            <Plus className="h-5 w-5 text-white" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-10 w-10 flex items-center justify-center">
                                                            <Plus className="h-5 w-5 text-[#31A7AC]" />
                                                        </div>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="h-[60px] border border-[#DEDEDE] w-[80px] px-4 py-2 text-center bg-white">
                                                <button 
                                                    onClick={() => handleStatusChange(app.id, gigId, 'confirmed')}
                                                    className={`h-8 w-8 flex items-center justify-center rounded border mx-auto transition-colors ${
                                                        app.status === 'confirmed' 
                                                            ? 'bg-[#31A7AC] border-[#31A7AC] text-white' 
                                                            : 'border-gray-200 text-[#31A7AC] hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            ))}

            {/* Credits Dialog */}
            <Dialog open={creditsDialog.open} onOpenChange={(open) => setCreditsDialog(prev => ({ ...prev, open }))}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                            {creditsDialog.applicantName}&apos;s Credits
                        </DialogTitle>
                        <DialogDescription>
                            Professional work history and credits
                        </DialogDescription>
                    </DialogHeader>
                    
                    {creditsDialog.loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA6E80]"></div>
                        </div>
                    ) : creditsDialog.credits.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            No credits available for this applicant.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {creditsDialog.credits.map((credit) => (
                                <Card key={credit.id} className="p-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-900">
                                                    {credit.title}
                                                </h3>
                                                {credit.role && (
                                                    <p className="text-sm text-[#27B4BC] font-medium">
                                                        {credit.role}
                                                    </p>
                                                )}
                                            </div>
                                            {credit.year && (
                                                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                                    {credit.year}
                                                </span>
                                            )}
                                        </div>
                                        {credit.description && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                {credit.description}
                                            </p>
                                        )}
                                        {credit.imdbUrl && (
                                            <a
                                                href={credit.imdbUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-[#27B4BC] hover:underline inline-flex items-center gap-1 mt-2"
                                            >
                                                View on IMDb
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
