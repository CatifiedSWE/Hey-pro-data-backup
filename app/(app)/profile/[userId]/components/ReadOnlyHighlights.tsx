"use client"

import React from "react";
import Image from "next/image";

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

export default function ReadOnlyHighlights({ highlights }: ReadOnlyHighlightsProps) {
  if (!highlights || highlights.length === 0) {
    return (
      <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-[0_1px_10px_rgba(0,0,0,0.1)]">
        <h2 className="text-[22px] font-semibold leading-[33px] text-[#000] mb-5">Highlights</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No highlights added yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-[0_1px_10px_rgba(0,0,0,0.1)]">
      <h2 className="text-[22px] font-semibold leading-[33px] text-[#000] mb-5">Highlights</h2>
      <div className="space-y-6">
        {highlights.map((highlight) => {
          // Handle different highlight types
          if (highlight.sourceType === 'slate_post' && highlight.sourceData) {
            const post = highlight.sourceData;
            const firstMedia = post.media && post.media.length > 0 ? post.media[0] : null;
            
            return (
              <div key={highlight.id} className="space-y-3">
                {highlight.title && (
                  <h3 className="text-base font-semibold text-[#000]">{highlight.title}</h3>
                )}
                {firstMedia && (
                  <div className="relative w-full aspect-square rounded-[10px] overflow-hidden">
                    {firstMedia.media_type === 'image' ? (
                      <Image
                        src={firstMedia.media_url}
                        alt="Highlight"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <video
                        src={firstMedia.media_url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>
                )}
                {highlight.highlight && (
                  <p className="text-sm text-[#444444] leading-relaxed">{highlight.highlight}</p>
                )}
              </div>
            );
          }
          
          if (highlight.sourceType === 'credit' && highlight.sourceData) {
            const credit = highlight.sourceData;
            return (
              <div key={highlight.id} className="space-y-3">
                {highlight.title && (
                  <h3 className="text-base font-semibold text-[#000]">{highlight.title}</h3>
                )}
                {credit.image_url && (
                  <div className="relative w-full aspect-[4/5] rounded-[10px] overflow-hidden">
                    <Image
                      src={credit.image_url}
                      alt="Credit highlight"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {highlight.highlight && (
                  <p className="text-sm text-[#444444] leading-relaxed">{highlight.highlight}</p>
                )}
              </div>
            );
          }
          
          // Text-only highlight
          return (
            <div key={highlight.id} className="space-y-3">
              {highlight.title && (
                <h3 className="text-base font-semibold text-[#000]">{highlight.title}</h3>
              )}
              {highlight.imageUrl && (
                <div className="relative w-full aspect-square rounded-[10px] overflow-hidden">
                  <Image
                    src={highlight.imageUrl}
                    alt="Highlight"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {(highlight.highlight || highlight.description) && (
                <p className="text-sm text-[#444444] leading-relaxed">
                  {highlight.highlight || highlight.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
