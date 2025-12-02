"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ManageCollabHeader } from "../../components/Header";
import { Avatar } from "../../components/Avatar";
import { Plus, X, Loader2 } from "lucide-react";
import { getMyCollabs, createCollab, uploadCollabCover, type CollabPost } from "@/lib/api/collab";

const inputBase = "w-full rounded-[15px] border border-[#2FD3D8]/40 bg-transparent px-5 py-3 text-sm text-black placeholder:text-black focus:border-[#2FD3D8] focus:outline-none";

const TagPill = ({ label }: { label: string }) => (
    <span className="rounded-full border border-[#0FC6D1] px-4 py-1 text-xs font-medium text-[#0FC6D1]">{label}</span>
);

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function ManageCollab() {
    const router = useRouter();
    const [collabPosts, setCollabPosts] = useState<CollabPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [posterPreview, setPosterPreview] = useState<string>("");
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [collabTitle, setCollabTitle] = useState("");
    const [collabIdea, setCollabIdea] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    // Fetch user's collabs
    useEffect(() => {
        const fetchMyCollabs = async () => {
            try {
                const response = await getMyCollabs({ limit: 50 });
                setCollabPosts(response.collabs);
            } catch (error) {
                console.error('Failed to fetch collabs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyCollabs();
    }, []);

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
        if (!collabTitle.trim()) {
            alert('Please enter a collab title');
            return;
        }
        
        if (collabTitle.length < 3 || collabTitle.length > 200) {
            alert('Title must be between 3 and 200 characters');
            return;
        }

        if (!collabIdea.trim()) {
            alert('Please enter your collab idea');
            return;
        }

        if (collabIdea.length < 10 || collabIdea.length > 5000) {
            alert('Summary must be between 10 and 5000 characters');
            return;
        }

        setSubmitting(true);

        try {
            let coverImageUrl: string | undefined = undefined;

            // Upload cover image if provided
            if (posterFile) {
                const uploadResult = await uploadCollabCover(posterFile);
                coverImageUrl = uploadResult.url;
            }

            // Create collab
            const newCollab = await createCollab({
                title: collabTitle,
                summary: collabIdea,
                tags: tags.length > 0 ? tags : undefined,
                cover_image_url: coverImageUrl,
                status: 'open'
            });

            // Reset form
            setCollabTitle("");
            setCollabIdea("");
            setTags([]);
            setPosterPreview("");
            setPosterFile(null);

            // Refresh collabs list
            const response = await getMyCollabs({ limit: 50 });
            setCollabPosts(response.collabs);

            alert('Collab created successfully!');
        } catch (error) {
            console.error('Failed to create collab:', error);
            alert(error instanceof Error ? error.message : 'Failed to create collab. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-10">
            <ManageCollabHeader />
            <section className="space-y-10">
                <section className="rounded-[36px] p-6">
                    <form onSubmit={handleSubmit} className="flex sm:flex-row flex-col gap-6">
                        <div className="rounded-[32px] p-2 text-center text-sm text-black/70">
                            <div className="relative flex h-[197px] w-[326px] items-center justify-center overflow-hidden rounded-[24px] bg-[#D9D9D9]">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    onChange={handlePosterChange}
                                    disabled={submitting}
                                />
                                {posterPreview ? (
                                    <Image
                                        src={posterPreview}
                                        alt="Poster preview"
                                        fill
                                        sizes="(max-width: 960px) 100vw, 340px"
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <span>Upload poster / moodboard</span>
                                )}
                            </div>
                            <p className="mt-4 text-xs text-black/60">16:9 recommended • PNG / JPG up to 5MB</p>
                        </div>
                        <div className="space-y-1 text-black w-full">
                            <input
                                className={inputBase}
                                placeholder="Collab title"
                                value={collabTitle}
                                onChange={(e) => setCollabTitle(e.target.value)}
                                disabled={submitting}
                                required
                            />
                            <textarea
                                className={`${inputBase} min-h-[110px] rounded-3xl`}
                                placeholder="What's your collab idea?"
                                value={collabIdea}
                                onChange={(e) => setCollabIdea(e.target.value)}
                                disabled={submitting}
                                required
                            />
                            <div className="space-y-1 max-h-30 overflow-y-auto mb-3">
                                <div className="flex gap-3 border rounded-2xl p-1 border-[#2FD3D8]">
                                    <input
                                        className="border-none focus:outline-none px-3.5 bg-transparent w-full"
                                        placeholder="Add collab tags"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
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
                                        className="whitespace-nowrap rounded-[15px] h-[41px] px-4 py-3 text-sm font-[400] text-[#FA6E80]"
                                        disabled={submitting}
                                    >
                                        <Plus className="h-6 w-6" />
                                    </button>
                                </div>
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag) => (
                                            <span key={tag} className="inline-flex items-center gap-2 rounded-[15px] border border-[#2FD3D8] px-4 py-1 text-xs font-medium text-[#2FD3D8]">
                                                {tag}
                                                <button type="button" onClick={() => handleRemoveTag(tag)} aria-label={`Remove ${tag}`} disabled={submitting}>
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button 
                                type="submit" 
                                className="w-full rounded-[15px] h-[41px] bg-[#FA6E80] py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#f5576b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                disabled={submitting}
                            >
                                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {submitting ? 'Posting...' : 'Post your collab'}
                            </button>
                        </div>
                    </form>
                </section>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#2FD3D8]" />
                    </div>
                ) : collabPosts.length === 0 ? (
                    <div className="text-center py-8 text-black/60">
                        No collabs yet. Create your first one above!
                    </div>
                ) : (
                    collabPosts.map((post) => (
                        <Link
                            href={`/collab/manage-collab/${post.id}`}
                            key={post.id}
                            className="flex w-full flex-col gap-6 rounded-[36px] bg-white px-5 py-6 md:flex-row"
                        >
                            <div className="overflow-hidden rounded-[10px] md:min-w-[360px]">
                                <Image
                                    src={post.cover_image_url || '/bg.jpg'}
                                    alt={post.title}
                                    width={326}
                                    height={167}
                                    className="h-full w-full object-cover"
                                    unoptimized
                                />
                            </div>
                            <div className="flex flex-1 flex-col gap-4 text-gray-800">
                                <div className="text-sm text-gray-500">Posted on {formatDate(post.created_at)}</div>
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900">{post.title}</h3>
                                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{post.summary}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <TagPill key={tag} label={tag} />
                                    ))}
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        {post.interestAvatars.length > 0 && (
                                            <div className="flex items-center">
                                                {post.interestAvatars.map((avatar, index) => (
                                                    <Avatar
                                                        key={`${avatar}-${index}`}
                                                        src={avatar}
                                                        alt="Interested member"
                                                        width={28}
                                                        height={28}
                                                        className="rounded-full border-2 border-white object-cover shadow"
                                                        style={{ marginLeft: index === 0 ? 0 : -12 }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <div className="text-sm font-medium text-gray-600">
                                            <span className="mr-1 text-[#0FC6D1]">{post.interests}</span>
                                            interested
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </section>
        </div>
    );
}