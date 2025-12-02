/** @format */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import SkillFormCard from "./SkillFormCard";

export interface Skill {
    id: string;
    department: string;
    role: string;
    description: string;
    experience?: { value: string; title: string; description: string; };
    rate?: string;
    isPublic?: boolean;
}

const experienceOptions = [
    {
        value: "intern",
        title: "Intern",
        description: "helped on set, shadowed role",
    },
    {
        value: "learning",
        title: "Learning | Assisted",
        description: "assisted the role under supervision",
    },
    {
        value: "competent",
        title: "Competent | Independent",
        description: "can handle role solo",
    },
    {
        value: "expert",
        title: "Expert | Lead",
        description: "leads team, multiple projects",
    },
]

const primarySkillOptions = [
    "Camera",
    "Lighting",
    "Sound",
    "Production",
    "Cinematography",
    "Color Grading",
    "Editing",
]

const specialtyOptions = [
    "Camera Operator",
    "Assistant",
    "Director of Photography",
    "Producer",
    "Editor",
]



interface AddNewSkillProps {
    trigger: React.ReactNode;
}

export default function AddNewSkill({ trigger }: AddNewSkillProps) {
    const hydrateSkill = (skill: Skill): Skill => ({
        ...skill,
        experience: skill.experience ?? { value: "intern", title: "Intern", description: "helped on set, shadowed role" },
        rate: skill.rate ?? "",
        isPublic: skill.isPublic ?? true,
    });

    const generateSkillId = () => `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const createBlankSkill = (): Skill =>
        hydrateSkill({
            id: generateSkillId(),
            department: "",
            role: "",
            description: "",
        });

    const [skills, setSkills] = useState<Skill[]>([createBlankSkill()]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [experienceVisibility, setExperienceVisibility] = useState<Record<string, boolean>>({});









    const handleAddSkill = () => {
        setSkills((prev) => [...prev, createBlankSkill()]);
    };

    const handleRemoveSkill = (id: string) => {
        toast.success("Skill removed!");
        setSkills((prev) => {
            const updated = prev.filter((skill) => skill.id !== id);
            return updated.length ? updated : [createBlankSkill()];
        });
    };

    const handleSkillChange = <K extends keyof Skill>(
        id: string,
        field: K,
        value: Skill[K]
    ) => {
        setSkills(
            skills.map((skill) =>
                skill.id === id ? { ...skill, [field]: value } : skill
            )
        );
    };

    const toggleExperienceSection = (id: string) => {
        setExperienceVisibility((prev) => ({
            ...prev,
            [id]: !(prev[id] ?? true),
        }));
    };
    const resetForm = () => {
        setSkills([createBlankSkill()]);
        setExperienceVisibility({});
    };

    const handleSaveChanges = () => {
        setIsDialogOpen(false);
        console.log("New skill submission:", skills);
        toast.success("Skills ready to submit!");
        resetForm();
    };

    const handleCancel = () => {
        resetForm();
        setIsDialogOpen(false);
    };

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="w-[560px] sm:h-[874px] h-[500px] overflow-x-auto rounded-[15px] border-0 p-0 shadow-[2px_3px_8px_rgba(0,0,0,0.09)]">
                    <div className="flex  flex-col">
                        <div className="flex-1 overflow-y-auto">
                            <div className="flex flex-col gap-[35px] bg-white p-[30px]">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h1 className="text-[22px] font-normal leading-[33px] text-black">
                                                Add Skills
                                            </h1>
                                            <p className="mt-1 max-w-[484px] text-xs leading-[18px] text-[#181818]">
                                                Add skill details like your core department, specialty, experience, and visibility preference.
                                            </p>
                                        </div>

                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {skills.map((skill) => (
                                        <SkillFormCard
                                            key={skill.id}
                                            skill={skill}
                                            isExperienceOpen={experienceVisibility[skill.id] ?? true}
                                            experienceOptions={experienceOptions}
                                            primarySkillOptions={primarySkillOptions}
                                            specialtyOptions={specialtyOptions}
                                            onFieldChange={(field, value) => handleSkillChange(skill.id, field, value)}
                                            onToggleExperience={() => toggleExperienceSection(skill.id)}
                                            onRemove={() => handleRemoveSkill(skill.id)}
                                        />
                                    ))}
                                    <Button
                                        onClick={handleAddSkill}
                                        variant="ghost"
                                        className="w-full justify-center rounded-[10px] border border-dashed border-[#C8C8C8] text-sm text-[#31A7AC] hover:bg-[#F3F4F6]"
                                    >
                                        + Add another skill
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-6 border-t border-[#C8C8C8] px-[30px] py-4">
                            <Button
                                onClick={handleCancel}
                                variant="outline"
                                className="h-[47px] min-w-[120px] rounded-[10px] border border-[#FA6E80] px-6 text-sm font-semibold text-[#FA6E80] hover:bg-[#FFF3F5]"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveChanges}
                                className="h-[47px] min-w-[120px] rounded-[10px] bg-[#FA6E80] px-6 text-sm font-semibold text-white hover:bg-[#f2576b]"
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
