"use client"
import React, { type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { LinkIcon, Linkedin, Twitter, Github, Globe, Mail, Facebook, Youtube } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface LinksDialogProps {
    links: { label: string; url: string }[]
    triggerClassName?: string
    triggerLabel?: ReactNode
}

export default function LinksDialog({ links, triggerClassName, triggerLabel }: LinksDialogProps) {

    const [open, setOpen] = React.useState(false)
    const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)
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

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Profile Links</DialogTitle>
                </DialogHeader>

                <div className="mt-3 space-y-3">
                    {links.map((link, idx) => {
                        const href = link.url ?? ""
                        const isMail = href.startsWith("mailto:")
                        return (
                            <div
                                key={idx}
                                className="flex items-center justify-between gap-3 p-3 rounded-md hover:bg-muted cursor-pointer"
                                onClick={() => handleClick(href, idx)}
                                onDoubleClick={(e) => handleDoubleClick(e, href, idx)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleClick(href, idx)
                                    if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault()
                                            ; (async () => {
                                                try { await navigator.clipboard.writeText(href); setCopiedIndex(idx); setTimeout(() => setCopiedIndex(null), 1500) } catch { }
                                            })()
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    {/* icon selection reused from outer scope */}
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
                                </div>
                            </div>
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}