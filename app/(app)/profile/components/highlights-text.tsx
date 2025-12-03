import * as React from "react";
import Image from "next/image";

type HighlightsTextProps = {
  className?: string;
};

export default function HighlightsText({
  className = "",
}: HighlightsTextProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/heylights-vertical.png"
        alt="HEYLIGHTS"
        width={33}
        height={250}
        style={{ objectFit: 'contain' }}
        priority
      />
    </div>
  );
}
