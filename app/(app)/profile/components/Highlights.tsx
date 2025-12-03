"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import HighlightsText from "./highlights-text";
import { useProfile, type HighlightData } from "@/contexts/ProfileContext";
import { useEffect } from "react";

interface HighlightItem {
    id: string;
    title: string;
    description: string;
    images: string;
}

interface HighlightsProps {
    // This prop is kept for backward compatibility but we'll use API data
    highlights?: HighlightItem[];
}

export function HighlightCard({
    highlight,
    className = "",
}: {
    highlight: HighlightItem;
    className?: string;
}) {
    const words = highlight.description.trim().split(/\s+/);
    const truncated = words.slice(0, 20).join(" ");
    const hasMore = words.length > 20;

    return (
        <article className={`space-y-3 ${className}`}>
            <div className="relative w-full lg:w-[275px] h-[263px] overflow-hidden rounded-[8px]">
                <Image
                    src={highlight.images}
                    alt={highlight.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 275px"
                    className="object-cover"
                />
            </div>
            <h3 className="text-lg font-semibold">{highlight.title}</h3>
            <p className="text-sm text-gray-600">
                {truncated}
                {hasMore && (
                    <>
                        …<br /><Link href={'#'} className="ml-1 text-[#FA596E]">Read more</Link>
                    </>
                )}
            </p>
        </article>
    );
}

export default function Highlights({ highlights: propHighlights }: HighlightsProps) {
    const { highlights: apiHighlights } = useProfile();
    
    // Use API highlights if available, otherwise fall back to prop highlights
    const displayHighlights = apiHighlights.length > 0 
        ? apiHighlights.map(h => ({
            id: h.id,
            title: h.title,
            description: h.description,
            images: h.image_url || '/placeholder.png'
          }))
        : propHighlights || [];

    if (!displayHighlights?.length) {
        return null;
    }

    return (
        <section className="w-full">
            {/* Desktop View */}
            <div className="hidden lg:flex gap-6">
                <aside className="sticky top-24 self-start w-full max-w-[336px] space-y-6">
                    <Button
                        variant="outline"
                        className="w-full h-11 rounded-[10px] border-[#31A7AC] text-black hover:bg-transparent"
                    >
                        Edit Highlights
                    </Button>
                    <div className="space-y-6">
                        {displayHighlights.map((highlight) => (
                            <HighlightCard key={highlight.id} highlight={highlight} />
                        ))}
                    </div>
                </aside>

                <div className="flex flex-col items-center" style={{ gap: '0px' }}>
                    <HighlightsText />
                    <div
                        className="rounded-full"
                        style={{
                            width: '1px',
                            height: '1501px',
                            background: 'linear-gradient(180deg, #FA6E80 0%, #6A89BE 41.52%, #85AAB7 62.27%, #31A7AC 103.79%)',
                            opacity: 1
                        }}
                        aria-hidden
                    />
                </div>
            </div>

            {/* Mobile View */}
            <div className="flex flex-col gap-6 lg:hidden">
                <Button
                    variant="outline"
                    className="w-full h-11 rounded-[10px] border-[#31A7AC] text-black hover:bg-transparent"
                >
                    Edit Highlights
                </Button>
                
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
                        Highlights
                    </h2>
                    <div 
                        className="h-[1px] flex-1 rounded-full"
                        style={{
                            background: 'linear-gradient(90deg, #FA6E80 0%, #6A89BE 41.52%, #85AAB7 62.27%, #31A7AC 103.79%)'
                        }}
                    />
                </div>

                <div className="space-y-6">
                    {displayHighlights.map((highlight) => (
                        <HighlightCard key={highlight.id} highlight={highlight} />
                    ))}
                </div>
            </div>
        </section>
    );
}