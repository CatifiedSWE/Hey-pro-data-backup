/** @format */

"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import HighlightsText from "./highlights-text";

interface HighlightItem {
    id: string;
    title: string;
    description: string;
    images: string;
}

interface HighlightsProps {
    highlights: HighlightItem[];
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
            <div className="relative w-[275px] h-[263px] overflow-hidden rounded-[8px]">
                <Image
                    src={highlight.images}
                    alt={highlight.title}
                    fill
                    sizes="275px"
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

export default function Highlights({ highlights }: HighlightsProps) {
    if (!highlights?.length) {
        return null;
    }

    return (
        <section className="w-full hidden lg:block">
            <div className="hidden lg:flex gap-6">
                <aside className="sticky top-24 self-start w-full max-w-[336px] space-y-6">
                    <Button
                        variant="outline"
                        className="w-full h-11 rounded-[10px] border-[#31A7AC] text-black hover:bg-transparent"
                    >
                        Edit Highlights
                    </Button>
                    <div className="space-y-6">
                        {highlights.map((highlight) => (
                            <HighlightCard key={highlight.id} highlight={highlight} />
                        ))}
                    </div>
                </aside>

                <div className="flex flex-col items-center gap-4">
                    <HighlightsText letterClassName="h-[26px] w-[26px] gap-0" />
                    <div
                        className="h-full w-px rounded-full"
                        style={{
                            border: '1px solid transparent',
                            backgroundImage: 'linear-gradient(white, white), linear-gradient(180deg, #31A7AC 0%, #85AAB7 41.52%, #6A89BE 62.27%, #FA6E80 103.79%)',
                            backgroundOrigin: 'border-box',
                            backgroundClip: 'padding-box, border-box'
                        }}
                        aria-hidden
                    />
                </div>
            </div>


        </section>
    );
}
