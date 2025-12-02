"use client"
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

type WorkIdentities = {
    freelance: boolean;
    employee: {
        enabled: boolean;
        company: string;
        designation: string;
    };
    businessOwner: {
        enabled: boolean;
        designation: string;
        businessName: string;
        businessType: string;
    };
};

type InitialIdentities = {
    freelance?: boolean;
    employee?: Partial<WorkIdentities["employee"]>;
    businessOwner?: Partial<WorkIdentities["businessOwner"]>;
};

interface WorkStatusSectionProps {
    statusProp?: string;
    initialIdentities?: InitialIdentities;
}

const defaultIdentities: WorkIdentities = {
    freelance: false,
    employee: { enabled: false, company: "", designation: "" },
    businessOwner: { enabled: false, designation: "", businessName: "", businessType: "" },
};

export default function WorkStatusSection({ statusProp, initialIdentities }: WorkStatusSectionProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const initialState = useMemo<WorkIdentities>(() => ({
        freelance:
            initialIdentities?.freelance ?? (statusProp?.toLowerCase() === "freelance" ? true : defaultIdentities.freelance),
        employee: {
            enabled: initialIdentities?.employee?.enabled ?? false,
            company: initialIdentities?.employee?.company ?? "",
            designation: initialIdentities?.employee?.designation ?? "",
        },
        businessOwner: {
            enabled: initialIdentities?.businessOwner?.enabled ?? false,
            designation: initialIdentities?.businessOwner?.designation ?? "",
            businessName: initialIdentities?.businessOwner?.businessName ?? "",
            businessType: initialIdentities?.businessOwner?.businessType ?? "",
        },
    }), [initialIdentities, statusProp]);

    const [identities, setIdentities] = useState<WorkIdentities>(initialState);

    useEffect(() => {
        setIdentities(initialState);
    }, [initialState]);

    const handleToggle = (key: keyof WorkIdentities) => (checked: boolean) => {
        if (key === "freelance") {
            setIdentities((prev) => ({ ...prev, freelance: checked }));
        } else {
            setIdentities((prev) => ({
                ...prev,
                [key]: {
                    ...(prev[key] as WorkIdentities[typeof key]),
                    enabled: checked,
                },
            }));
        }
    };

    const handleFieldChange = <K extends "employee" | "businessOwner">(
        key: K,
        field: keyof Omit<WorkIdentities[K], 'enabled'>,
        value: string,
    ) => {
        setIdentities((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value,
            },
        }));
    };

    const hasChanges = () => {
        return (
            identities.freelance !== initialState.freelance ||
            identities.employee.enabled !== initialState.employee.enabled ||
            identities.employee.company !== initialState.employee.company ||
            identities.employee.designation !== initialState.employee.designation ||
            identities.businessOwner.enabled !== initialState.businessOwner.enabled ||
            identities.businessOwner.designation !== initialState.businessOwner.designation ||
            identities.businessOwner.businessName !== initialState.businessOwner.businessName ||
            identities.businessOwner.businessType !== initialState.businessOwner.businessType
        );
    };

    const resetForm = () => {
        setIdentities(initialState);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!hasChanges()) {
            toast.info("No changes were made.");
            setIsDialogOpen(false);
            return;
        }

        console.log("Work identities submitted:", identities);
        toast.success("Work identities ready to submit!");
        setIsDialogOpen(false);
    };

    const handleCancel = () => {
        resetForm();
        setIsDialogOpen(false);
    };

    const inputClasses = "h-[38px] rounded-[15px] border border-[#31A7AC] px-5 text-sm text-black focus-visible:border-[#31A7AC] focus-visible:ring-[#31A7AC]/15";

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <div
                    className="flex flex-row gap-5 h-[44px] w-auto text-base font-medium rounded-[15px]  bg-transparent border px-9 justify-center items-center cursor-pointer hover:bg-muted/50 border-[#444444] "
                >
                    Work Status
                </div>
            </DialogTrigger>
            <DialogContent className="border-none p-0">
                <form onSubmit={handleSubmit}>
                    <div className="mx-auto flex h-full max-h-[642px] w-full  flex-col rounded-[20px] bg-white px-5 pb-6 pt-[25px] shadow-[0_8px_18px_rgba(0,0,0,0.1)]">
                        <div className="mx-auto mb-6 h-[5px] w-[150px] rounded-full bg-[#868686]" />
                        <div className="flex flex-col gap-[25px]">
                            <div className="space-y-2">
                                <h2 className="text-[22px] font-normal leading-[33px] text-black">Work Identities</h2>
                                <p className="text-xs leading-[18px] text-[#181818]">
                                    Many of us wear multiple hats and this section is focused specifically on those hats within film, media and events production. Please select the applicable work identities.
                                </p>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col gap-4">
                                    <label className="flex items-center gap-4 text-base text-black">
                                        <Checkbox
                                            checked={identities.freelance}
                                            onCheckedChange={(checked) => handleToggle("freelance")(Boolean(checked))}
                                            className="h-[20px] w-[20px] rounded-[3.33px] border border-[#FA6E80] data-[state=checked]:bg-[#FA6E80] data-[state=checked]:text-white"
                                        />
                                        Freelance
                                    </label>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-4 text-base text-black">
                                        <Checkbox
                                            checked={identities.employee.enabled}
                                            onCheckedChange={(checked) => handleToggle("employee")(Boolean(checked))}
                                            className="h-[20px] w-[20px] rounded-[3.33px] border border-[#FA6E80] data-[state=checked]:bg-[#FA6E80] data-[state=checked]:text-white"
                                        />
                                        Employee
                                    </label>
                                    <Input
                                        placeholder="Company"
                                        className={inputClasses}
                                        value={identities.employee.company}
                                        onChange={(e) => handleFieldChange("employee", "company", e.target.value)}
                                        disabled={!identities.employee.enabled}
                                    />
                                    <Input
                                        placeholder="Designation"
                                        className={inputClasses}
                                        value={identities.employee.designation}
                                        onChange={(e) => handleFieldChange("employee", "designation", e.target.value)}
                                        disabled={!identities.employee.enabled}
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-4 text-base text-black">
                                        <Checkbox
                                            checked={identities.businessOwner.enabled}
                                            onCheckedChange={(checked) => handleToggle("businessOwner")(Boolean(checked))}
                                            className="h-[20px] w-[20px] rounded-[3.33px] border border-[#FA6E80] data-[state=checked]:bg-[#FA6E80] data-[state=checked]:text-white"
                                        />
                                        Business Owner
                                    </label>
                                    <Input
                                        placeholder="Designation"
                                        className={inputClasses}
                                        value={identities.businessOwner.designation}
                                        onChange={(e) => handleFieldChange("businessOwner", "designation", e.target.value)}
                                        disabled={!identities.businessOwner.enabled}
                                    />
                                    <Input
                                        placeholder="Business Name"
                                        className={inputClasses}
                                        value={identities.businessOwner.businessName}
                                        onChange={(e) => handleFieldChange("businessOwner", "businessName", e.target.value)}
                                        disabled={!identities.businessOwner.enabled}
                                    />
                                    <Input
                                        placeholder="Business Type"
                                        className={inputClasses}
                                        value={identities.businessOwner.businessType}
                                        onChange={(e) => handleFieldChange("businessOwner", "businessType", e.target.value)}
                                        disabled={!identities.businessOwner.enabled}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto flex w-full gap-3 pt-6">
                            <Button
                                type="button"
                                onClick={handleCancel}
                                variant="outline"
                                className="h-11 flex-1 rounded-[16px] border border-[#31A7AC] text-base font-medium text-[#31A7AC]"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="h-11 flex-1 rounded-[16px] bg-[#31A7AC] text-base font-medium text-white hover:bg-[#2b9497]"
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}