"use client"

import React from "react";

interface ReadOnlyAboutSectionProps {
  bio: string;
}

export default function ReadOnlyAboutSection({ bio }: ReadOnlyAboutSectionProps) {
  if (!bio) return null;
  
  return (
    <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-[0_1px_10px_rgba(0,0,0,0.1)] sm:px-10 sm:py-9">
      <div className="mb-6">
        <h2 className="text-[22px] font-semibold leading-[33px] text-[#000]">About</h2>
      </div>
      <div className="space-y-4 text-sm leading-[21px] text-[#181818] sm:text-base whitespace-pre-line">
        {bio}
      </div>
    </div>
  )
}
