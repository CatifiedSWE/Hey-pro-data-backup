"use client";

import React from "react";
import Image from "next/image";
import { MapPin, LinkIcon } from "lucide-react";
import { countries } from "@/lib/countries";

interface ReadOnlyProfileProps {
  profile: {
    id: number;
    userId: string;
    name: string;
    displayName: string;
    avatar: string;
    banner: string;
    bio: string;
    country: string;
    city: string;
    location: string;
    profileCompletionPercentage: number;
    roles: Array<{
      id: string;
      roleName: string;
      category?: string;
      sortOrder: number;
    }>;
    skills: Array<{
      id: string;
      skillName: string;
      proficiencyLevel?: string;
      sortOrder: number;
    }>;
    links: Array<{
      id: string;
      platform: string;
      url: string;
      label?: string;
      sortOrder: number;
    }>;
    credits: Array<{
      id: string;
      title: string;
      role: string;
      year: number;
      description?: string;
      imdbUrl?: string;
    }>;
    highlights: Array<{
      id: string;
      highlight: string;
      sortOrder: number;
    }>;
    recommendations: Array<{
      id: string;
      recommenderName: string;
      recommenderRole?: string;
      recommendation: string;
      createdAt: string;
    }>;
  };
}

export default function ReadOnlyProfileContent({ profile }: ReadOnlyProfileProps) {
  const nationality = countries.find((country) => country.code === profile.country)?.name ?? profile.country ?? "Unknown";
  const locationDescriptor = [nationality, profile.city?.trim()].filter(Boolean).join(" • ");
  
  const highlightedRoles = profile.roles.slice(0, 6);
  const extraRecommendations = Math.max(profile.recommendations.length - 3, 0);
  
  const primaryLink = profile.links[0]?.url ?? "";
  
  const linkSummary = (() => {
    if (!primaryLink) return "No links added";
    
    const icon = <LinkIcon className="h-5 w-5" color="#FA6E80" />;
    let host = primaryLink;
    try {
      host = new URL(primaryLink).hostname.replace(/^www\./, "");
    } catch {}
    
    const extra = profile.links.length - 1;
    
    return (
      <>
        {icon} 
        {host} 
        {extra > 0 && ` & ${extra} other link${extra > 1 ? "s" : ""}`}
      </>
    );
  })();

  return (
    <section className="relative mx-auto flex w-full max-w-[1180px] flex-col items-center gap-8 px-3 xs:px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-center lg:gap-12 pt-6 pb-20">
      <main className="flex w-full max-w-[600px] flex-col space-y-4">
        {/* Header Section (Read-only ShortProfile) */}
        <section className="relative w-full border-b border-[#DADADA] pb-6">
          <div className="relative h-[228px]">
            <div className="relative sm:h-[150px] h-[88px] w-full overflow-hidden rounded-[20px]">
              {profile.banner ? (
                <Image
                  src={profile.banner}
                  alt="Cover image"
                  fill
                  sizes="600px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]" />
              )}
            </div>
          </div>

          <div className="absolute inset-x-0 top-[38px] sm:top-[108px] left-[9px] sm:left-[58px] flex justify-start">
            <div className="relative flex h-[112px] w-[112px] items-center justify-center">
              <div className="relative h-[112px] w-[112px] rounded-full overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={profile.avatar || '/default-profile.png'}
                  alt={profile.displayName}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 top-[160px] max-w-[367.8px] left-[200px] hidden justify-center font-[400] text-[11px] sm:flex">
            <div className="flex items-center gap-2 px-4 py-2 text-[#393939]">
              <MapPin className="h-3.5 w-3.5 text-[#393939]" />
              <span className="whitespace-nowrap">{locationDescriptor}</span>
            </div>
          </div>

          <div className="flex sm:mt-10 -mt-10 flex-col gap-4 px-4 sm:px-[58px]">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-[22px] font-semibold leading-[33px] text-black">{profile.displayName}</h1>
                {profile.recommendations.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {profile.recommendations.slice(0, 3).map((recommendation, index) => (
                        <div
                          key={`${recommendation.id}-${index}`}
                          className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-semibold"
                        >
                          {recommendation.recommenderName.charAt(0)}
                        </div>
                      ))}
                      {extraRecommendations > 0 && (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-xs font-semibold text-[#444444]">
                          +{extraRecommendations}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#FA6E80]">
                      +{profile.recommendations.length} Referrals
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {highlightedRoles.map((role) => (
                <span
                  key={role.id}
                  className="flex items-center rounded-[29px] h-[19px] bg-[#FA6E80] px-4 py-1 text-[10px] font-[400] tracking-wide text-white"
                >
                  {role.roleName}
                </span>
              ))}
            </div>

            {profile.bio && (
              <p className="text-[14px] leading-[21px] text-[#181818] line-clamp-3">{profile.bio}</p>
            )}

            {profile.links.length > 0 && (
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#31A7AC]">
                {linkSummary}
              </div>
            )}
          </div>
        </section>

        <div className="w-full bg-slate-200 h-px sm:h-[1px] mb-5" />

        {/* About Section */}
        {profile.bio && (
          <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-[0_1px_10px_rgba(0,0,0,0.1)] sm:px-10 sm:py-9">
            <div className="mb-6">
              <h2 className="text-[22px] font-semibold leading-[33px] text-[#000]">About</h2>
            </div>
            <div className="space-y-4 text-sm leading-[21px] text-[#181818] sm:text-base">
              {profile.bio}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {profile.skills.length > 0 && (
          <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-[0_1px_10px_rgba(0,0,0,0.1)] sm:px-10 sm:py-9 mt-8">
            <div className="mb-5">
              <h2 className="text-[22px] font-semibold leading-[33px] text-[#000]">Skills</h2>
            </div>
            <div className="space-y-4">
              {profile.skills.map((skill) => (
                <div key={skill.id} className="space-y-2">
                  <h3 className="text-base font-[400] text-[#000] sm:text-lg">
                    {skill.skillName}
                  </h3>
                  {skill.proficiencyLevel && (
                    <div className="ml-10">
                      <div className="flex items-center gap-1 px-4 bg-[#FFFFFF] h-[31px] w-fit rounded-[5px]">
                        <span className="text-sm font-[600] text-[#000]">{skill.proficiencyLevel}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Credits Section */}
        {profile.credits.length > 0 && (
          <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-[0_1px_10px_rgba(0,0,0,0.1)] sm:px-10 sm:py-9 mt-8">
            <div className="mb-5">
              <h2 className="text-[22px] font-semibold leading-[33px] text-[#000]">Credits</h2>
            </div>
            <div className="space-y-6">
              {profile.credits.map((credit) => (
                <div key={credit.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-[#000] sm:text-lg">{credit.title}</h3>
                      <p className="text-sm text-[#444444]">{credit.role}</p>
                      <p className="text-xs text-[#666666]">{credit.year}</p>
                    </div>
                  </div>
                  {credit.description && (
                    <p className="text-sm leading-relaxed text-[#444444]">{credit.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Highlights Section - Desktop Sidebar */}
      {profile.highlights.length > 0 && (
        <div className="hidden lg:block w-full max-w-[336px]">
          <div className="sticky top-24 self-start space-y-6">
            <div className="space-y-8">
              {profile.highlights.map((highlight) => (
                <div key={highlight.id} className="space-y-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {highlight.highlight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Highlights Section - Mobile */}
      {profile.highlights.length > 0 && (
        <div className="lg:hidden w-full max-w-[600px] mt-8">
          <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-[0_1px_10px_rgba(0,0,0,0.1)] sm:px-10 sm:py-9">
            <div className="mb-5">
              <h2 className="text-[22px] font-semibold leading-[33px] text-[#000]">Highlights</h2>
            </div>
            <div className="space-y-4">
              {profile.highlights.map((highlight) => (
                <p key={highlight.id} className="text-sm text-gray-600 leading-relaxed">
                  {highlight.highlight}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
