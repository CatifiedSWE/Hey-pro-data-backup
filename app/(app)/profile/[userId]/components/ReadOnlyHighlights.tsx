"use client"

import React from "react";
import Image from "next/image";
import Link from "next/link";
import HighlightsText from "../../components/highlights-text";

interface Highlight {
  id: string;
  highlight?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  sourceType?: string;
  sourceId?: string;
  sourceData?: any;
}

interface ReadOnlyHighlightsProps {
  highlights: Highlight[];
}

interface TransformedHighlight {
  id: string;
  title: string;
  description: string;
  images: string;
  type: string;
}

export default function ReadOnlyHighlights({ highlights }: ReadOnlyHighlightsProps) {
  // Transform highlight data based on source type - matching the working Highlights.tsx logic
  const transformHighlight = (highlight: Highlight): TransformedHighlight | null => {
    if (highlight.sourceType === 'credit' && highlight.sourceData) {
      const credit = highlight.sourceData;
      return {
        id: highlight.id,
        title: credit.credit_title || 'Untitled Credit',
        description: credit.description || '',
        images: credit.image_url || '/placeholder.png',
        type: 'credit'
      };
    } else if (highlight.sourceType === 'slate_post' && highlight.sourceData) {
      const post = highlight.sourceData;
      const firstMedia = post.media?.[0];
      return {
        id: highlight.id,
        title: 'Slate Post',
        description: post.content || '',
        images: firstMedia?.media_url || '/placeholder.png',
        type: 'slate'
      };
    } else if (highlight.title && highlight.description) {
      // Legacy format
      return {
        id: highlight.id,
        title: highlight.title,
        description: highlight.description,
        images: highlight.imageUrl || '/placeholder.png',
        type: 'legacy'
      };
    }
    return null;
  };

  const displayHighlights = highlights
    .map(h => transformHighlight(h))
    .filter((h): h is TransformedHighlight => h !== null);

  if (!displayHighlights || displayHighlights.length === 0) {
    return (
      <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-[0_1px_10px_rgba(0,0,0,0.1)]">
        <h2 className="text-[22px] font-semibold leading-[33px] text-[#000] mb-5">Highlights</h2>
        <div className="text-center py-8 text-gray-500">
          <p>Still working for their masterpiece</p>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full">
      {/* Desktop View */}
      <div className="hidden lg:flex gap-6">
        <aside className="sticky top-24 self-start w-full max-w-[336px] space-y-6">
          <div className="space-y-8">
            {displayHighlights.map((highlight) => (
              <HighlightCard key={highlight.id} highlight={highlight} />
            ))}
          </div>
        </aside>

        <div className="flex flex-col items-center" style={{ gap: '15px' }}>
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
      <div className="lg:hidden flex flex-col gap-6 pb-10">
        <HighlightsText className="w-full" />
        
        <div className="space-y-8">
          {displayHighlights.map((highlight) => (
            <HighlightCard key={highlight.id} highlight={highlight} className="w-full" />
          ))}
        </div>
      </div>
    </section>
  );
}

function HighlightCard({
  highlight,
  className = "",
}: {
  highlight: TransformedHighlight;
  className?: string;
}) {
  const words = highlight.description.trim().split(/\s+/);
  const truncated = words.slice(0, 20).join(" ");
  const hasMore = words.length > 20;

  return (
    <article className={`space-y-3 ${className}`}>
      <div className="relative w-full lg:w-[275px] h-[263px] overflow-hidden rounded-[8px] bg-gray-100">
        <Image
          src={highlight.images}
          alt={highlight.title}
          fill
          sizes="(max-width: 1024px) 100vw, 275px"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{highlight.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">
        {truncated}
        {hasMore && (
          <>
            …<br /><Link href={'#'} className="ml-1 text-[#FA596E] font-medium hover:underline">Read more</Link>
          </>
        )}
      </p>
    </article>
  );
}
