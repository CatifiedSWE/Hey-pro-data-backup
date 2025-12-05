"use client";

import { useState } from "react";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

import { GigList } from "../../components/manage-gigs/gig-list";
import { ApplicationTab } from "../../components/manage-gigs/application-tab";
import { AvailabilityTab } from "../../components/manage-gigs/availability-tab";
import { ContactListTab } from "../../components/manage-gigs/contact-list-tab";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package } from "lucide-react";
import apiCalling from "@/lib/apiCalling";
import { toast } from "sonner";

type PendingChange = {
    applicationId: string;
    gigId: string;
    newStatus: string;
};

export default function ManageGigsPage() {
    const [selectedGigIds, setSelectedGigIds] = useState<string[]>([]);
    const [currentTab, setCurrentTab] = useState<string>("gigs");
    const [actionIndicators, setActionIndicators] = useState<Record<string, Partial<Record<"release" | "shortlist" | "confirm", boolean>>>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggleGig = (gigId: string, checked: boolean) => {
        setSelectedGigIds((prev) => {
            if (checked) {
                if (prev.includes(gigId)) {
                    return prev;
                }
                return [...prev, gigId];
            }
            return prev.filter((id) => id !== gigId);
        });
    };

    const handleApplicantAction = (rowKey: string, action: "release" | "shortlist" | "confirm") => {
        setActionIndicators((prev) => ({
            ...prev,
            [rowKey]: {
                ...prev[rowKey],
                [action]: !prev[rowKey]?.[action],
            },
        }));
        // Mark that there are unsaved changes
        setHasChanges(true);
    };

    const handleAddPendingChange = (change: PendingChange) => {
        setPendingChanges((prev) => {
            // Remove any existing change for the same application
            const filtered = prev.filter(c => c.applicationId !== change.applicationId);
            // Add the new change
            return [...filtered, change];
        });
        setHasChanges(true);
    };

    const handleSaveChanges = async () => {
        if (pendingChanges.length === 0) {
            toast.info("No changes to save");
            return;
        }

        setIsSaving(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            // Process all pending changes
            for (const change of pendingChanges) {
                try {
                    const response = await apiCalling({
                        method: 'patch',
                        route: `/gigs/${change.gigId}/applications/${change.applicationId}/status`,
                        data: { status: change.newStatus },
                    });

                    if (response.status) {
                        successCount++;
                    } else {
                        errorCount++;
                        console.error('Failed to update application:', response.message);
                    }
                } catch (error) {
                    errorCount++;
                    console.error('Error updating application:', error);
                }
            }

            // Show results
            if (errorCount === 0) {
                toast.success(`Successfully saved ${successCount} change${successCount > 1 ? 's' : ''}`);
            } else if (successCount > 0) {
                toast.warning(`Saved ${successCount} change${successCount > 1 ? 's' : ''}, but ${errorCount} failed`);
            } else {
                toast.error('Failed to save changes');
            }

            // Reset state after successful save
            if (successCount > 0) {
                setPendingChanges([]);
                setHasChanges(false);
                // Force refresh by updating selectedGigIds
                setSelectedGigIds([...selectedGigIds]);
            }
        } catch (error) {
            console.error('Error saving changes:', error);
            toast.error('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-6xl -mt-5 flex-col gap-6 p-4">
            <div className="flex flex-col sm:flex-row items-start justify-start gap-y-2  sm:justify-between">
                <div className="text-2xl font-semibold">
                    <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-semibold">
                        {currentTab === "gigs" ? "Manage Gigs" : currentTab === "application" ? "Manage Gig Applications" : currentTab === "availability" ? "Manage Availability Check" : "View Crew Contacts"}
                    </span>
                </div>
                <div className="flex flex-row gap-3.5 justify-center items-center">
                    <Button asChild variant={"default"} className="h-11 rounded-2xl px-5 flex items-center bg-transparent text-[#31A7AC] border border-[#31A7AC] gap-2">
                        <Link href="/gigs/manage-gigs/add-new" className="flex items-center gap-2 whitespace-nowrap">
                            <Package className="h-4 w-4" />
                            Add Gigs
                        </Link>
                    </Button>
                    <Button 
                        onClick={handleSaveChanges}
                        disabled={!hasChanges || isSaving}
                        className={`h-[44px] w-[80px] ${
                            hasChanges && !isSaving
                                ? "bg-[#21B2C4] hover:bg-[#1AA5B8]"
                                : "bg-gray-300 cursor-not-allowed"
                        }`}
                        data-testid="save-button"
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>
            </div>
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
                <TabsList className="flex flex-wrap gap-[1px] sm:w-[680px">
                    <TabsTrigger value="gigs">Gigs</TabsTrigger>
                    <TabsTrigger value="application">Application</TabsTrigger>
                    <TabsTrigger value="availability">Availability Check</TabsTrigger>
                    <TabsTrigger value="contacts">Contact list</TabsTrigger>
                </TabsList>
                <span className="h-[10px] w-full bg-[#F8F8F8] -mt-8" />
                <TabsContent value="gigs" className="bg-[#F8F8F8] -mt-10">
                    <GigList selectedGigIds={selectedGigIds} onToggleGig={handleToggleGig} />
                </TabsContent>

                <TabsContent value="application" className="bg-[#F8F8F8] -mt-10 sm:w-[1060px]">
                    <ApplicationTab
                        selectedGigIds={selectedGigIds}
                        actionIndicators={actionIndicators}
                        onActionChange={handleApplicantAction}
                    />
                </TabsContent>

                <TabsContent value="availability" className="bg-[#F8F8F8] -mt-10 sm:w-[1060px]">
                    <AvailabilityTab selectedGigIds={selectedGigIds} />
                </TabsContent>

                <TabsContent value="contacts" className="bg-[#F8F8F8] -mt-10 sm:w-[1060px]">
                    <ContactListTab
                        selectedGigIds={selectedGigIds}
                        actionIndicators={actionIndicators}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
