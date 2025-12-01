"use client";

import Image from "next/image";
import { MessageCircle, Plus, RefreshCw, Save, X, Loader2, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { updateCollab, deleteCollab, uploadCollabCover, closeCollab, type CollabDetail } from "@/lib/api/collab";

const inputBase = "w-full rounded-[18px] border border-[#444444] bg-white/40 px-5 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#444444] focus:outline-none";

type EditCollabFormProps = {
    collab: CollabDetail;
};


const TagPill = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#444444] px-4 py-1 text-xs font-medium text-[#0FC6D1]">
        {label}
        <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="text-[#0FC6D1]">
            <X className="h-3 w-3" />
        </button>
    </span>
);

export function EditCollabForm({ collab }: EditCollabFormProps) {
    const router = useRouter();
    const [posterPreview, setPosterPreview] = useState<string>(collab.cover_image_url || '');
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [title, setTitle] = useState(collab.title);
    const [summary, setSummary] = useState(collab.summary);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>(collab.tags);
    const [actionMessage, setActionMessage] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [closing, setClosing] = useState(false);

    const collaborators = collab.collaborators || [];

    const handlePosterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        // Validate file type
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            alert('Only JPG and PNG files are allowed');
            return;
        }

        setPosterFile(file);
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            if (typeof loadEvent.target?.result === "string") {
                setPosterPreview(loadEvent.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAddTag = () => {
        const value = tagInput.trim();
        if (!value || tags.includes(value)) return;
        if (tags.length >= 10) {
            alert('Maximum 10 tags allowed');
            return;
        }
        setTags((prev) => [...prev, value]);
        setTagInput("");
    };

    const handleRemoveTag = (value: string) => {
        setTags((prev) => prev.filter((tag) => tag !== value));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        // Validation
        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }
        
        if (title.length < 3 || title.length > 200) {
            alert('Title must be between 3 and 200 characters');
            return;
        }

        if (!summary.trim()) {
            alert('Please enter a summary');
            return;
        }

        if (summary.length < 10 || summary.length > 5000) {
            alert('Summary must be between 10 and 5000 characters');
            return;
        }

        setSubmitting(true);

        try {
            let coverImageUrl: string | undefined = undefined;

            // Upload new cover image if changed
            if (posterFile) {
                const uploadResult = await uploadCollabCover(posterFile, collab.id);
                coverImageUrl = uploadResult.url;
            }

            // Update collab
            await updateCollab(collab.id, {
                title,
                summary,
                tags: tags.length > 0 ? tags : undefined,
                cover_image_url: coverImageUrl || (posterPreview || undefined)
            });

            setActionMessage("Changes saved successfully!");
            setTimeout(() => setActionMessage(null), 2500);
        } catch (error) {
            console.error('Failed to update collab:', error);
            alert(error instanceof Error ? error.message : 'Failed to update collab. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setPosterPreview(collab.cover_image_url || '');
        setPosterFile(null);
        setTitle(collab.title);
        setSummary(collab.summary);
        setTags(collab.tags);
        setTagInput("");
        setActionMessage("Form reset");
        setTimeout(() => setActionMessage(null), 1500);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this collab? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            await deleteCollab(collab.id);
            alert('Collab deleted successfully!');
            router.push('/collab/manage-collab');
        } catch (error) {
            console.error('Failed to delete collab:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete collab. Please try again.');
            setDeleting(false);
        }
    };

    const handleClose = async () => {
        if (!confirm('Are you sure you want to close this collab? You can reopen it later by editing.')) {
            return;
        }

        setClosing(true);
        try {
            await closeCollab(collab.id);
            alert('Collab closed successfully!');
            router.push('/collab/manage-collab');
        } catch (error) {
            console.error('Failed to close collab:', error);
            alert(error instanceof Error ? error.message : 'Failed to close collab. Please try again.');
            setClosing(false);
        }
    };

    return (
        <section className="rounded-[36px] bg-white p-1 sm:p-6 shadow-[0_25px_120px_rgba(0,0,0,0.06)]">
            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6 lg:flex-row">
                <div className="w-full flex-shrink-0 space-y-6 lg:max-w-[360px]">
                    <div className="rounded-[30px] text-center text-sm text-gray-500">
                        <div className="relative mx-auto flex w-[353px] overflow-hidden rounded-[10px] bg-white sm:w-[348px] h-[410px]">
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg"
                                className="absolute inset-0 cursor-pointer opacity-0"
                                onChange={handlePosterChange}
                            />
                            {posterPreview ? (
                                <Image src={posterPreview} alt={title || "Poster preview"} fill className="object-cover rounded-[10px]" sizes="360px" unoptimized />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
                                    <Plus className="h-5 w-5" />
                                    <span>Upload poster / moodboard</span>
                                </div>
                            )}
                        </div>
                        <p className="mt-3 text-xs text-gray-500">16:9 recommended • PNG / JPG up to 5MB</p>
                    </div>

                </div>
                <div className="flex-1 space-y-5">
                    <div>
                        <input id="collabTitle" className={inputBase} value={title} onChange={(event) => setTitle(event.target.value)} />
                    </div>
                    <div>
                        <textarea
                            id="collabSummary"
                            className={`${inputBase} min-h-[140px] resize-none rounded-[24px]`}
                            value={summary}
                            onChange={(event) => setSummary(event.target.value)}
                            placeholder="Describe what you need collaborators for"
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex gap-3 rounded-[18px] border border-[#444444] px-3 py-2">
                            <input
                                className="flex-1 border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                                placeholder="Add tags and press enter"
                                value={tagInput}
                                onChange={(event) => setTagInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                            />
                            <button type="button" onClick={handleAddTag} className="rounded-full bg-[#FA6E80] p-2 text-white">
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <TagPill key={tag} label={tag} onRemove={() => handleRemoveTag(tag)} />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                            type="submit"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#31A7AC] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#289398]"
                        >
                            <Save className="h-4 w-4" />
                            Save changes
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E4E7EC] px-6 py-3 text-sm font-semibold text-gray-600 hover:border-[#D0D5DD]"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reset
                        </button>
                    </div>
                    {actionMessage && <p className="text-sm font-medium text-gray-500">{actionMessage}</p>}
                </div>
            </form>
            <div>
                <div className="flex flex-col-reverse mt-5 sm:mt-0 gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold text-2xl">Collaborators</span>
                    <button className="ml-0 w-full rounded-[10px] border border-transparent bg-[#31A7AC] px-4 py-2 text-white transition hover:opacity-90 sm:ml-2 sm:w-auto">Close Collab</button>
                </div>
                <div className="w-full overflow-x-auto">
                    <Table className="w-full min-w-[600px] table-fixed">
                        <TableHeader>
                            <TableRow className="border-b border-gray-300">
                                <TableHead className="w-2/3">Name</TableHead>
                                <TableHead className="w-1/3">Role</TableHead>
                                <TableHead className="w-1/3">Chat</TableHead>
                                <TableHead className="w-1/3">Add To Group</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {collaborators.map((c) => (
                                <TableRow key={c.id} className="w-full last:[&>td]:border-b-0">
                                    <TableCell className="w-2/3 border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={c.avatar}
                                                alt={c.name}
                                                width={40}
                                                height={40}
                                                className="rounded-full flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <span className="font-medium block truncate">{c.name}</span>
                                                <span className="text-xs text-gray-500 truncate">{c.department}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-1/3 border-b border-gray-200">
                                        <span className="inline-block truncate">{c.role}</span>
                                    </TableCell>
                                    <TableCell className="w-1/3 border-b border-gray-200">
                                        <button className="text-sm text-[#31A7AC] underline"><MessageCircle className="h-6 w-6" /></button>
                                    </TableCell>
                                    <TableCell className="w-1/3 border-b border-gray-200">
                                        <button className="text-sm px-4 py-2 text-[#31A7AC] "><Plus className="h-6 w-6" /></button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </section>
    );
}
