"use client";

import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HighlightSelectCardProps {
  type: 'credit' | 'slate_post';
  item: any;
  isSelected: boolean;
  onToggle: () => void;
  disabled: boolean;
}

export function HighlightSelectCard({ 
  type, 
  item, 
  isSelected, 
  onToggle, 
  disabled 
}: HighlightSelectCardProps) {
  
  // Common container classes
  const containerClasses = cn(
    "group relative flex gap-4 p-4 mb-3 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-sm",
    isSelected 
      ? "border-[#FA6E80] bg-[#FA6E80]/5" 
      : "border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200",
    disabled && !isSelected && "opacity-50 cursor-not-allowed grayscale"
  );

  // Selection Indicator (Custom instead of standard Checkbox for better UI)
  const SelectionIndicator = () => (
    <div className="absolute top-4 right-4">
      {isSelected ? (
        <CheckCircle2 className="w-6 h-6 text-[#FA6E80] fill-white" />
      ) : (
        <Circle className="w-6 h-6 text-gray-300 group-hover:text-gray-400" />
      )}
    </div>
  );

  if (type === 'credit') {
    return (
      <div 
        className={containerClasses}
        onClick={!disabled ? onToggle : undefined}
      >
        {/* Image Section */}
        <div className="relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 shadow-inner">
          {item.image_url ? (
            <Image 
              src={item.image_url} 
              alt={item.credit_title || 'Credit image'}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">
              No Image
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 pr-8"> {/* pr-8 to avoid overlap with selection indicator */}
          <h3 className="font-bold text-base text-gray-900 truncate">{item.credit_title}</h3>
          
          <div className="flex flex-wrap gap-2 mt-1.5">
            {(item.production_type || item.role) && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-700">
                {[item.production_type, item.role].filter(Boolean).join(' • ')}
              </span>
            )}
            {item.release_year && (
              <span className="inline-flex items-center text-xs text-gray-500 border border-gray-200 px-1.5 rounded">
                {item.release_year}
              </span>
            )}
          </div>

          {item.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <SelectionIndicator />
      </div>
    );
  }
  
  // Slate post layout
  if (type === 'slate_post') {
    const firstMedia = item.media?.[0];
    const timeAgo = item.created_at 
      ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
      : '';

    return (
      <div 
        className={containerClasses}
        onClick={!disabled ? onToggle : undefined}
      >
        {/* Media Section */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 shadow-inner self-start">
          {firstMedia ? (
            <Image 
              src={firstMedia.media_url} 
              alt="Slate post media"
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              Text Only
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 pr-8">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-base text-gray-900">Slate Post</h3>
            <span className="text-xs text-gray-400">• {timeAgo}</span>
          </div>

          {item.content && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-2">
              {item.content}
            </p>
          )}
          
          <div className="flex gap-4 text-xs text-gray-500 font-medium">
            {(item.likes_count > 0 || item.comments_count > 0) ? (
              <>
                <span className="flex items-center gap-1 hover:text-[#FA6E80]">
                  ❤️ {item.likes_count}
                </span>
                <span className="flex items-center gap-1 hover:text-blue-500">
                  💬 {item.comments_count}
                </span>
              </>
            ) : (
              <span className="text-gray-400 italic">No engagement yet</span>
            )}
          </div>
        </div>

        <SelectionIndicator />
      </div>
    );
  }

  return null;
}
