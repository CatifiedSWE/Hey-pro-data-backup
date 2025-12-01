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

const collaborators = [
    { id: 1, name: "Alice Johnson", role: "Designer", department: "Creative", avatar: "/image (1).png" },
    { id: 2, name: "Bob Smith", role: "Designer", department: "Engineering", avatar: "/image (2).png" },
    { id: 3, name: "Carol Davis", role: "Designer", department: "Operations", avatar: "/image (3).png" },

]

export function EditCollabForm({ collab }: EditCollabFormProps) {
    const [posterPreview, setPosterPreview] = React.useState<string>(collab.cover);
    const [title, setTitle] = React.useState(collab.title);
    const [summary, setSummary] = React.useState(collab.summary);
    const [tagInput, setTagInput] = React.useState("");
    const [tags, setTags] = React.useState<string[]>(collab.tags);
    const [status, setStatus] = React.useState<CollabPost["status"]>(collab.status);
    const [actionMessage, setActionMessage] = React.useState<string | null>(null);

    const handlePosterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
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
        setTags((prev) => [...prev, value]);
        setTagInput("");
    };

    const handleRemoveTag = (value: string) => {
        setTags((prev) => prev.filter((tag) => tag !== value));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Updated collab", {
            id: collab.id,
            title,
            summary,
            tags,
            status,
            posterPreview,
        });
        setActionMessage("Changes saved locally");
        setTimeout(() => setActionMessage(null), 2500);
    };

    const handleReset = () => {
        setPosterPreview(collab.cover);
        setTitle(collab.title);
        setSummary(collab.summary);
        setTags(collab.tags);
        setStatus(collab.status);
        setTagInput("");
        setActionMessage("Form reset");
        setTimeout(() => setActionMessage(null), 1500);
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
