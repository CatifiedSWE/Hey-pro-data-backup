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
    const handleClick = (href: string, idx: number) => {
        // Delay opening to allow double-click to cancel it
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
        // Cancel pending single-click open
        if (timersRef.current[idx]) {
            window.clearTimeout(timersRef.current[idx]!)
            timersRef.current[idx] = null
        }
        e.preventDefault()
        e.stopPropagation()
        // copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(href).then(() => {
                setCopiedIndex(idx)
                setTimeout(() => setCopiedIndex(null), 1500)
            }).catch(() => {
                // fallback: create textarea (rare)
                const ta = document.createElement("textarea")
                ta.value = href
                document.body.appendChild(ta)
                ta.select()
                try { document.execCommand("copy"); setCopiedIndex(idx); setTimeout(() => setCopiedIndex(null), 1500) } finally { ta.remove() }
            })
        }
    }

    const handleAddLink = async () => {
        if (!newLabel || !newUrl) {
            toast.error('Please fill in both label and URL');
            return;
        }

        setSaving(true);
        try {
            const response = await apiCalling({
                method: 'post',
                route: '/profile/links',
                data: { label: newLabel, url: newUrl, sort_order: localLinks.length }
            });

            if (response.status) {
                toast.success('Link added successfully!');
                // Update local state with the new link
                const newLink: LinkData = {
                    id: response.data?.id || String(Date.now()),
                    label: newLabel,
                    url: newUrl,
                    sort_order: localLinks.length
                };
                setLocalLinks([...localLinks, newLink]);
                setNewLabel('');
                setNewUrl('');
                setIsAddingNew(false);
                // Call onUpdate to refresh parent data if provided
                if (onUpdate) onUpdate();
            } else {
                toast.error(response.message || 'Failed to add link');
            }
        } catch (error) {
            toast.error('Failed to add link');
        } finally {
            setSaving(false);
        }
    };

    const handleEditLink = async (id: string) => {
        if (!editLabel || !editUrl) {
            toast.error('Please fill in both label and URL');
            return;
        }

        setSaving(true);
        try {
            const response = await apiCalling({
                method: 'post',
                route: '/profile/links',
                data: { id, label: editLabel, url: editUrl }
            });

            if (response.status) {
                toast.success('Link updated successfully!');
                // Update local state
                setLocalLinks(localLinks.map(link => 
                    link.id === id ? { ...link, label: editLabel, url: editUrl } : link
                ));
                setEditingId(null);
                // Call onUpdate to refresh parent data if provided
                if (onUpdate) onUpdate();
            } else {
                toast.error(response.message || 'Failed to update link');
            }
        } catch (error) {
            toast.error('Failed to update link');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLink = async (id: string) => {
        if (!confirm('Are you sure you want to delete this link?')) return;

        setSaving(true);
        try {
            const response = await apiCalling({
                method: 'delete',
                route: `/profile/links?id=${id}`
            });

            if (response.status) {
                toast.success('Link deleted successfully!');
                // Update local state
                setLocalLinks(localLinks.filter(link => link.id !== id));
                // Call onUpdate to refresh parent data if provided
                if (onUpdate) onUpdate();
            } else {
                toast.error(response.message || 'Failed to delete link');
            }
        } catch (error) {
            toast.error('Failed to delete link');
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (link: LinkData) => {
        setEditingId(link.id);
        setEditLabel(link.label);
        setEditUrl(link.url);
    };

    // Sync localLinks with props when dialog opens or links change
    React.useEffect(() => {
        setLocalLinks(links);
    }, [links, open]);

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
                                            {saving ? 'Saving...' : 'Save'}
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
                                    {saving ? 'Adding...' : 'Add Link'}
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
                        onClick={() => setOpen(false)}
                        className="w-full bg-[#31A7AC] hover:bg-[#27939f] text-white"
                    >
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}