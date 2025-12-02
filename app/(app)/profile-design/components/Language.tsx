"use client"
import React, { useState } from "react"
import { Plus, Speech, Trash2, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"

interface Language {
    name: string;
    canSpeak: boolean;
    canWrite: boolean;
}

export default function AddLanguageSection({ languages: initialLanguages }: { languages: string[] }) {
    const [isLanguagesDialogOpen, setIsLanguagesDialogOpen] = useState(false)
    // Convert initial string array to Language objects
    const initialLanguageObjects: Language[] = initialLanguages?.map(lang => ({
        name: lang,
        canSpeak: true,
        canWrite: true
    })) || []
    const [languages, setLanguages] = useState<Language[]>(initialLanguageObjects)
    const [tempLanguages, setTempLanguages] = useState<Language[]>([])
    const [newLanguage, setNewLanguage] = useState("")

    const handleOpenLanguagesDialog = () => {
        setTempLanguages([...languages])
        setNewLanguage("")
        setIsLanguagesDialogOpen(true)
    }

    const handleAddLanguage = () => {
        const trimmedLanguage = newLanguage.trim();
        if (trimmedLanguage && !tempLanguages.some(lang => lang.name === trimmedLanguage)) {
            setTempLanguages([...tempLanguages, {
                name: trimmedLanguage,
                canSpeak: false,
                canWrite: false
            }])
            setNewLanguage("")
        }
    }

    const handleRemoveLanguage = (languageName: string) => {
        setTempLanguages(tempLanguages.filter((lang) => lang.name !== languageName))
    }

    const handleToggleSkill = (languageName: string, skill: 'speak' | 'write') => {
        setTempLanguages(tempLanguages.map(lang => {
            if (lang.name === languageName) {
                if (skill === 'speak') {
                    return { ...lang, canSpeak: !lang.canSpeak }
                } else {
                    return { ...lang, canWrite: !lang.canWrite }
                }
            }
            return lang
        }))
    }

    const handleSaveLanguages = () => {
        const languagesChanged = JSON.stringify(tempLanguages.sort((a, b) => a.name.localeCompare(b.name))) !==
            JSON.stringify(languages.sort((a, b) => a.name.localeCompare(b.name)));

        if (!languagesChanged) {
            toast.info("No changes were made.");
            setIsLanguagesDialogOpen(false);
            return;
        }

        // Validate that at least one skill is selected for each language
        const invalidLanguages = tempLanguages.filter(lang => !lang.canSpeak && !lang.canWrite);
        if (invalidLanguages.length > 0) {
            toast.error(`Please select at least one skill (speak or write) for: ${invalidLanguages.map(l => l.name).join(', ')}`);
            return;
        }

        console.log("=== Languages Data ===");
        console.log("Total Languages:", tempLanguages.length);
        console.log("Languages Details:", JSON.stringify(tempLanguages, null, 2));

        setLanguages(tempLanguages)
        toast.success("Languages updated successfully!");
        setIsLanguagesDialogOpen(false)
    }

    return (
        <>
            <Dialog open={isLanguagesDialogOpen} onOpenChange={setIsLanguagesDialogOpen}>
                <DialogTrigger asChild>
                    <div
                        onClick={handleOpenLanguagesDialog}
                        className="flex flex-row gap-5 h-[44px] w-auto text-base font-[400] rounded-[15px]  bg-transparent border px-9 justify-start items-center cursor-pointer hover:bg-muted/50 border-[#444444] "
                    >
                        Language
                    </div>
                </DialogTrigger>
                <DialogContent className="">
                    <DialogHeader>
                        <DialogTitle className="text-[22px] font-[400] flex items-start justify-start">Languages</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 ">
                        <div className="relative flex flex-row gap-2  items-center">
                            <Input
                                placeholder="Enter a language (e.g., English, Spanish)"
                                value={newLanguage}
                                onChange={(e) => setNewLanguage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault(); // Prevents form submission
                                        handleAddLanguage()
                                    }
                                }}
                                className="flex-1 h-[41px] rounded-[15px] w-full pr-12 focus-visible:border-[#31A7AC] focus-visible:ring-ring/10 border-[#31A7AC]"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={handleAddLanguage}
                                className="h-[40px] w-[40px] rounded-[15px] text-white  bg-[#34A353]"
                                aria-label="Add language"
                            >
                                <Plus className="h-[40px] w-[40px] " color="white" />
                            </Button>
                        </div>
                        <Separator className="border border-[#959595]" />
                        {tempLanguages.length > 0 && (
                            <div className="space-y-2 bg-white max-w-72">
                                <div className="flex flex-col gap-[10px] max-h-96 overflow-y-auto">
                                    {tempLanguages.map((language) => (
                                        <div
                                            key={language.name}
                                            className="flex items-center justify-between gap-3 p-3  bg-white"
                                        >
                                            <span className="text-base font-[400] whitespace-nowrap flex-shrink-0 rounded-xl border border-[#31A7AC] min-w-[100px] max-w-[259px] h-[41px] items-center justify-start px-4 mx-auto flex  ">
                                                {language.name}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                {/* Speak Icon */}
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    onClick={() => handleToggleSkill(language.name, 'speak')}
                                                    className={`h-[40px] w-[40px] rounded-xl border-[#6D6D6D] ${language.canSpeak
                                                        ? 'bg-[#FA6E80]  text-white'
                                                        : 'bg-gray-100  text-[#6D6D6D]'
                                                        }`}
                                                    aria-label={`Toggle speaking ${language.name}`}
                                                    title="Can Speak"
                                                >
                                                    <Speech className="h-4 w-4" />
                                                </Button>

                                                {/* Write Icon */}
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    onClick={() => handleToggleSkill(language.name, 'write')}
                                                    className={`h-[40px] w-[40px] rounded-xl border-[#6D6D6D] ${language.canWrite
                                                        ? 'bg-[#31A7AC]  text-white'
                                                        : 'bg-gray-100  text-[#6D6D6D]'
                                                        }`}
                                                    aria-label={`Toggle writing ${language.name}`}
                                                    title="Can Write"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                {/* Delete Icon */}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleRemoveLanguage(language.name)}
                                                    className="h-[40px] w-[40px] rounded-xl text-black "
                                                    aria-label={`Remove ${language.name}`}
                                                    title="Delete Language"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className=" flex flex-row gap-3 ">
                        <DialogClose asChild>
                            <Button variant="outline" className="border-[#31A7AC] text-[#31A7AC] w-[128px] h-[41px] rounded-[16px]">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button onClick={handleSaveLanguages} className="bg-[#31A7AC] hover:bg-[#31A7AC] w-[128px] h-[41px] text-[#FFFFFF] rounded-[16px]">
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </>
    )
}