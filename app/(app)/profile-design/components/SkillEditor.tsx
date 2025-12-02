/** @format */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Menu, GripVertical } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

function SortableSkillItem({ skill }: { skill: Skill }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: skill.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-gray-200"
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none"
            >
                <GripVertical className="h-6 w-6 text-gray-400" />
            </div>
            <div className="flex-1">
                <p className="font-medium text-gray-900">{skill.department} . {skill.role}</p>
                <p className="text-sm text-gray-500 line-clamp-1">
                    {skill.description || "No description"}
                </p>
            </div>
        </div>
    );
}

interface SkillEditorProps {
    initialSkills: Skill[];
    trigger: React.ReactNode;
}

export default function SkillEditor({ initialSkills, trigger }: SkillEditorProps) {
    const hydrateSkill = (skill: Skill): Skill => ({
        ...skill,
        experience: skill.experience ?? { value: "intern", title: "Intern", description: "helped on set, shadowed role" },
        rate: skill.rate ?? "",
        isPublic: skill.isPublic ?? true,
    });

    const [skills, setSkills] = useState<Skill[]>(initialSkills.map(hydrateSkill));
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isReorderOpen, setIsReorderOpen] = useState(false);
    const [tempSkills, setTempSkills] = useState<Skill[]>([]);
    const [experienceVisibility, setExperienceVisibility] = useState<Record<string, boolean>>({});

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setTempSkills((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleReorderClick = () => {
        setTempSkills([...skills]);
        setIsReorderOpen(true);
    };

    const handleReorderSave = () => {
        setSkills(tempSkills);
        setIsReorderOpen(false);
        toast.success("Skill order saved!");
    };



    const handleRemoveSkill = (id: string) => {
        toast.success("Skill removed!");
        setSkills(skills.filter((skill) => skill.id !== id));
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
    const handleSaveChanges = () => {
        setIsDialogOpen(false);
        console.log("Saving skills from child:", skills);
        toast.success("Skills updated successfully!");
    };

    const handleCancel = () => {
        // Reset skills to initial state if user cancels
        setSkills(initialSkills.map(hydrateSkill));
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
                                                Edit Skills
                                            </h1>
                                            <p className="mt-1 max-w-[484px] text-xs leading-[18px] text-[#181818]">
                                                You can write about your years of experience, industry, or skills. People also talk about their achievements or previous job experiences.
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleReorderClick}
                                                variant="outline"
                                                className="flex items-center gap-2 rounded-xl border border-[#31A7AC] px-4 py-2 text-sm text-[#31A7AC] hover:bg-[#E7FAFC]"
                                            >
                                                <Menu className="h-4 w-4" />
                                                Reorder
                                            </Button>

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

            {/* Reorder Dialog */}
            <Dialog open={isReorderOpen} onOpenChange={setIsReorderOpen}>
                <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            Reorder Skills
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto py-4">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={tempSkills.map((s) => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    {tempSkills.map((skill) => (
                                        <SortableSkillItem
                                            key={skill.id}
                                            skill={skill}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            onClick={() => setIsReorderOpen(false)}
                            variant="outline"
                            className="flex-1 border-2 border-gray-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReorderSave}
                            className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                            Save Order
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
