"use client"
import React, { type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { LinkIcon, Linkedin, Twitter, Github, Globe, Mail, Facebook, Youtube, Plus, X, Edit, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import apiCalling from "@/lib/apiCalling"
import type { LinkData } from "@/hooks/useProfile"

interface LinksDialogProps {
    links: LinkData[]
    triggerClassName?: string
    triggerLabel?: ReactNode
    onUpdate?: () => void
}

export default function LinksDialog({ links, triggerClassName, triggerLabel, onUpdate }: LinksDialogProps) {

    const [open, setOpen] = React.useState(false)
    const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [isAddingNew, setIsAddingNew] = React.useState(false)
    const [newLabel, setNewLabel] = React.useState('')
    const [newUrl, setNewUrl] = React.useState('')
    const [editLabel, setEditLabel] = React.useState('')
    const [editUrl, setEditUrl] = React.useState('')
    const [saving, setSaving] = React.useState(false)
    const [localLinks, setLocalLinks] = React.useState<LinkData[]>(links)
    const timersRef = React.useRef<Record<number, number | null>>({})
    
    const urlIcons = {
        "linkedin": <Linkedin className="h-5 w-5" />,
        "github": <Github className="h-5 w-5" />,
        "twitter": <Twitter className="h-5 w-5" />,
        "email": <Mail className="h-5 w-5" />,
        "facebook": <Facebook className="h-5 w-5" />,
        "youtube": <Youtube className="h-5 w-5" />,
        "other": <Globe className="h-5 w-5" />,
    }

    // Sync localLinks when dialog opens
    React.useEffect(() => {
        if (open) {
            setLocalLinks(links);
        }
    }, [open, links]);

    const handleClick = (href: string, idx: number) => {
        if (timersRef.current[idx]) {
            window.clearTimeout(timersRef.current[idx]!)
            timersRef.current[idx] = null
        }
        timersRef.current[idx] = window.setTimeout(() => {
            window.open(href, "_blank", "noopener,noreferrer")
            timersRef.current[idx] = null
        }, 200)
    }

    const handleDoubleClick = (e: React.MouseEvent, href: string, idx: number) => {
        if (timersRef.current[idx]) {
            window.clearTimeout(timersRef.current[idx]!)
            timersRef.current[idx] = null
        }
        e.preventDefault()
        e.stopPropagation()
        if (navigator.clipboard) {
            navigator.clipboard.writeText(href).then(() => {
                setCopiedIndex(idx)
                setTimeout(() => setCopiedIndex(null), 1500)
            }).catch(() => {
                const ta = document.createElement("textarea")
                ta.value = href
                document.body.appendChild(ta)
                ta.select()
                try { document.execCommand("copy"); setCopiedIndex(idx); setTimeout(() => setCopiedIndex(null), 1500) } finally { ta.remove() }
            })
        }
    }

    const handleAddLink = () => {
        if (!newLabel || !newUrl) {
            toast.error('Please fill in both label and URL');
            return;
        }

        const newLink: LinkData = {
            id: `temp-${Date.now()}`,
            label: newLabel,
            url: newUrl,
            sort_order: localLinks.length,
            user_id: links[0]?.user_id || '' 
        };
        
        setLocalLinks([...localLinks, newLink]);
        setNewLabel('');
        setNewUrl('');
        setIsAddingNew(false);
    };

    const handleEditLink = (id: string) => {
        if (!editLabel || !editUrl) {
            toast.error('Please fill in both label and URL');
            return;
        }

        setLocalLinks(localLinks.map(link => 
            link.id === id ? { ...link, label: editLabel, url: editUrl } : link
        ));
        setEditingId(null);
    };

    const handleDeleteLink = (id: string) => {
        // Removed confirm dialog for local delete as per user requirement/UX for deferred save
        setLocalLinks(localLinks.filter(link => link.id !== id));
    };

    const startEdit = (link: LinkData) => {
        setEditingId(link.id);
        setEditLabel(link.label);
        setEditUrl(link.url);
    };

    // Check for changes to enable/disable Done button
    const hasChanges = React.useMemo(() => {
        if (localLinks.length !== links.length) return true;
        
        const originalIds = new Set(links.map(l => l.id));
        
        for (const link of localLinks) {
            if (!originalIds.has(link.id)) return true; // New link
            
            const original = links.find(l => l.id === link.id);
            if (original) {
                if (original.label !== link.label || original.url !== link.url) return true;
            }
        }
        
        return false;
    }, [localLinks, links]);

    const handleSaveChanges = async () => {
        setSaving(true);
        try {
            // 1. Identify Deletions
            const toDelete = links.filter(l => !localLinks.find(local => local.id === l.id));
            
            // 2. Identify Additions
            const toAdd = localLinks.filter(l => l.id.startsWith('temp-'));
            
            // 3. Identify Updates
            const toUpdate = localLinks.filter(l => {
                if (l.id.startsWith('temp-')) return false;
                const original = links.find(orig => orig.id === l.id);
                return original && (original.label !== l.label || original.url !== l.url);
            });

            const promises = [];

            // Delete requests
            toDelete.forEach(link => {
                promises.push(apiCalling({
                    method: 'delete',
                    route: `/profile/links?id=${link.id}`
                }));
            });

            // Add requests
            toAdd.forEach(link => {
                promises.push(apiCalling({
                    method: 'post',
                    route: '/profile/links',
                    data: { label: link.label, url: link.url, sort_order: link.sort_order }
                }));
            });

            // Update requests
            toUpdate.forEach(link => {
                 promises.push(apiCalling({
                    method: 'patch',
                    route: '/profile/links',
                    data: { id: link.id, label: link.label, url: link.url }
                }));
            });

            if (promises.length > 0) {
                const results = await Promise.all(promises);
                const failed = results.filter(r => !r.status);
                
                if (failed.length > 0) {
                    console.error('Failed requests:', failed);
                    toast.error('Some changes failed to save');
                } else {
                    toast.success('Changes saved successfully');
                }
            }
            
            if (onUpdate) onUpdate();
            setOpen(false);

        } catch (error) {
            console.error(error);
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn("flex items-center gap-2 border border-none text-[#31A7AC]", triggerClassName)}
                >
                    {triggerLabel ?? (
                        <>
                            <LinkIcon className="h-5 w-5" color="#FA6E80" />
                            {links[0]?.url ?? "No links"} &nbsp;({links.length} links)
                        </>
                    )}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Profile Links</DialogTitle>
                </DialogHeader>

                <div className="mt-3 space-y-3">
                    {localLinks.map((link, idx) => {
                        const href = link.url ?? ""
                        const isMail = href.startsWith("mailto:")
                        const isEditing = editingId === link.id;

                        if (isEditing) {
                            return (
                                <div key={link.id} className="space-y-2 p-3 border rounded-md">
                                    <Input
                                        value={editLabel}
                                        onChange={(e) => setEditLabel(e.target.value)}
                                        placeholder="Label"
                                        className="h-10"
                                    />
                                    <Input
                                        value={editUrl}
                                        onChange={(e) => setEditUrl(e.target.value)}
                                        placeholder="URL"
                                        className="h-10"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleEditLink(link.id)}
                                            disabled={saving}
                                            className="flex-1"
                                        >
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditingId(null)}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={link.id}
                                className="flex items-center justify-between gap-3 p-3 rounded-md hover:bg-muted"
                            >
                                <div className="flex items-center gap-3 flex-1 cursor-pointer"
                                    onClick={() => handleClick(href, idx)}
                                    onDoubleClick={(e) => handleDoubleClick(e, href, idx)}
                                >
                                    <span className="text-muted-foreground">
                                        {(() => {
                                            try {
                                                const host = isMail ? "mailto" : new URL(href).hostname.toLowerCase()
                                                if (isMail) return urlIcons.email
                                                if (host.includes("x.com") || host.includes("twitter.com")) return urlIcons.twitter
                                                if (host.includes("linkedin.com")) return urlIcons.linkedin
                                                if (host.includes("github.com")) return urlIcons.github
                                                if (host.includes("facebook.com")) return urlIcons.facebook
                                                if (host.includes("youtube.com") || host.includes("youtu.be")) return urlIcons.youtube
                                            } catch { }
                                            return urlIcons.other
                                        })()}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium break-all">{link.label}</span>
                                        <span className="text-xs text-muted-foreground break-all">{href}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {copiedIndex === idx && (
                                        <span className="text-sm text-green-600">Copied!</span>
                                    )}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => startEdit(link)}
                                        className="h-8 w-8"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDeleteLink(link.id)}
                                        disabled={saving}
                                        className="h-8 w-8 text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}

                    {/* Add New Link Form */}
                    {isAddingNew ? (
                        <div className="space-y-2 p-3 border rounded-md bg-muted/50">
                            <Input
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                placeholder="Label (e.g., LinkedIn, Portfolio)"
                                className="h-10"
                            />
                            <Input
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder="URL"
                                className="h-10"
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={handleAddLink}
                                    disabled={saving}
                                    className="flex-1"
                                >
                                    Add Link
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAddingNew(false);
                                        setNewLabel('');
                                        setNewUrl('');
                                    }}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => setIsAddingNew(true)}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Link
                        </Button>
                    )}
                </div>

                {/* Done Button */}
                <div className="mt-4 pt-3 border-t">
                    <Button
                        onClick={handleSaveChanges}
                        disabled={!hasChanges || saving}
                        className="w-full bg-[#31A7AC] hover:bg-[#27939f] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Done'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
