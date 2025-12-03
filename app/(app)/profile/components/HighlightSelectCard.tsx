"use client";

import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";

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
  
  if (type === 'credit') {
    return (
      <div 
        className={`p-4 border rounded-lg mb-3 cursor-pointer transition-all ${
          isSelected ? 'border-[#FA6E80] bg-pink-50' : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={!disabled ? onToggle : undefined}
      >
        <div className="flex gap-4 items-start">
          {item.image_url && (
            <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
              <Image 
                src={item.image_url} 
                alt={item.credit_title || 'Credit image'}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{item.credit_title}</h3>
            {(item.production_type || item.role) && (
              <p className="text-sm text-gray-600 mt-1">
                {[item.production_type, item.role].filter(Boolean).join(' • ')}
              </p>
            )}
            {item.release_year && (
              <p className="text-xs text-gray-500 mt-1">{item.release_year}</p>
            )}
            {item.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.description}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <Checkbox 
              checked={isSelected} 
              disabled={disabled}
              onCheckedChange={onToggle}
            />
          </div>
        </div>
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
        className={`p-4 border rounded-lg mb-3 cursor-pointer transition-all ${
          isSelected ? 'border-[#FA6E80] bg-pink-50' : 'border-gray-200 hover:border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={!disabled ? onToggle : undefined}
      >
        <div className="flex gap-4 items-start">
          {firstMedia && (
            <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
              <Image 
                src={firstMedia.media_url} 
                alt="Slate post media"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base">Slate Post</h3>
            <p className="text-sm text-gray-500 mt-1">{timeAgo}</p>
            {item.content && (
              <p className="text-sm text-gray-700 mt-2 line-clamp-3">{item.content}</p>
            )}
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              {item.likes_count > 0 && (
                <span>❤️ {item.likes_count} likes</span>
              )}
              {item.comments_count > 0 && (
                <span>💬 {item.comments_count} comments</span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            <Checkbox 
              checked={isSelected} 
              disabled={disabled}
              onCheckedChange={onToggle}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
