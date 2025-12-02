"use client";

import Image from "next/image";
import { MessageCircle, Plus, RefreshCw, Save, X, Loader2 } from "lucide-react";
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
import { Avatar } from "../../../components/Avatar";
import { updateCollab, uploadCollabCover, closeCollab, type CollabDetail } from "@/lib/api/collab";

const inputBase = "w-full rounded-xl border border-[#E4E7EC] bg-white px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#2FD3D8] focus:outline-none focus:ring-1 focus:ring-[#2FD3D8] transition-colors";

type EditCollabFormProps = {
    collab: CollabDetail;
};

const TagPill = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#2FD3D8] px-4 py-2 text-xs font-medium text-[#2FD3D8] bg-white">
        {label}
        <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="text-[#2FD3D8] hover:text-red-500">
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
        <div className="min-h-screen bg-gray-50 pb-10">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="space-y-8">
                    {/* Edit Form */}
                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-shrink-0">
                                <div className="relative flex h-[400px] w-full lg:w-[400px] items-center justify-center overflow-hidden rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 hover:border-[#2FD3D8] transition-colors group">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                        onChange={handlePosterChange}
                                    />
                                    {posterPreview ? (
                                        <Image 
                                            src={posterPreview} 
                                            alt={title || "Poster preview"} 
                                            fill 
                                            className="object-cover rounded-xl" 
                                            sizes="400px" 
                                            unoptimized 
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-gray-500 group-hover:text-[#2FD3D8] transition-colors">
                                            <Plus className="h-8 w-8" />
                                            <span className="text-sm font-medium">Upload poster / moodboard</span>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-3 text-xs text-gray-500 text-center">16:9 recommended • PNG / JPG up to 5MB</p>
                            </div>
                            
                            <div className="flex-1 space-y-6">
                                <input 
                                    className={inputBase} 
                                    value={title} 
                                    onChange={(event) => setTitle(event.target.value)} 
                                    placeholder="Collab title"
                                    disabled={submitting}
                                />
                                
                                <textarea
                                    className={`${inputBase} min-h-[120px] resize-none`}
                                    value={summary}
                                    onChange={(event) => setSummary(event.target.value)}
                                    placeholder="Describe what you need collaborators for"
                                    disabled={submitting}
                                />
                                
                                <div className="space-y-4">
                                    <div className="flex gap-3 p-2 border border-gray-200 rounded-xl bg-gray-50">
                                        <input
                                            className="flex-1 border-none bg-transparent text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none px-2"
                                            placeholder="Add tags and press enter"
                                            value={tagInput}
                                            onChange={(event) => setTagInput(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    handleAddTag();
                                                }
                                            }}
                                            disabled={submitting}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={handleAddTag} 
                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FA6E80] text-white hover:bg-[#f5576b] transition-colors"
                                            disabled={submitting}
                                        >
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
                                
                                <div className="flex flex-wrap items-center gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 min-w-[160px] rounded-xl bg-[#31A7AC] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#289398] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                                    >
                                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                        {!submitting && <Save className="h-4 w-4" />}
                                        {submitting ? 'Saving...' : 'Save changes'}
                                    </button>
                                    
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        disabled={submitting}
                                        className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        Reset
                                    </button>
                                </div>
                                
                                {actionMessage && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <p className="text-sm font-medium text-green-700">{actionMessage}</p>
                                    </div>
                                )}
                            </div>
                        </form>
                    </section>

                    {/* Collaborators Section */}
                    <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                Collaborators ({collaborators.length})
                            </h2>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleClose}
                                    disabled={closing || collab.status === 'closed'}
                                    className="rounded-xl bg-[#31A7AC] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#289398] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {closing && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {collab.status === 'closed' ? 'Closed' : 'Close Collab'}
                                </button>
                            </div>
                        </div>
                        
                        {collaborators.length > 0 ? (
                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="font-semibold text-gray-900 py-4">Name</TableHead>
                                            <TableHead className="font-semibold text-gray-900 py-4">Role</TableHead>
                                            <TableHead className="font-semibold text-gray-900 py-4">Chat</TableHead>
                                            <TableHead className="font-semibold text-gray-900 py-4">Add to Group</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {collaborators.map((collaborator) => (
                                            <TableRow key={collaborator.id} className="hover:bg-gray-50 transition-colors">
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            src={collaborator.avatar}
                                                            alt={collaborator.name}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full flex-shrink-0"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900">{collaborator.name}</p>
                                                            <p className="text-sm text-gray-500">{collaborator.department}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <span className="text-sm text-gray-700">{collaborator.role}</span>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#31A7AC]/10 text-[#31A7AC] hover:bg-[#31A7AC]/20 transition-colors">
                                                        <MessageCircle className="h-4 w-4" />
                                                    </button>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#31A7AC]/10 text-[#31A7AC] hover:bg-[#31A7AC]/20 transition-colors">
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                                <div className="max-w-md mx-auto">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No collaborators yet</h3>
                                    <p className="text-sm">Interested users will appear here.</p>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
