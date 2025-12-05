"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { MapPin, Link as LinkIcon, Calendar, ArrowRight } from "lucide-react";
import { countries } from "@/lib/countries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    availableForWork: boolean;
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
      description?: string; // Added tentatively, might be undefined
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
      creditTitle?: string;
      title?: string;
      role?: string;
      year?: number;
      description?: string;
      imdbUrl?: string;
      imgUrl?: string;
      startDate?: string;
      endDate?: string;
      productionType?: string;
      projectTitle?: string;
      brandClient?: string;
      localCompany?: string;
      internationalCompany?: string;
      country?: string;
      releaseYear?: string;
      isUnreleased?: boolean;
      headlineStats?: string;
      awards?: Array<{
        title: string;
        detail?: string;
      }>;
    }>;
    highlights: Array<{
      id: string;
      highlight?: string;
      sortOrder: number;
      sourceType?: string;
      sourceId?: string;
      sourceData?: any;
      title?: string;
      description?: string;
      imageUrl?: string;
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
  const locationDescriptor = [profile.city?.trim(), nationality].filter(Boolean).join(", ");
  
  const availabilityStatus = profile.availableForWork ? "Available" : "Not Available";
  const isAvailable = profile.availableForWork;

  // Format links for display
  const formattedLinks = useMemo(() => {
    return profile.links.slice(0, 3).map(link => {
        let hostname = link.url;
        try {
            hostname = new URL(link.url).hostname.replace('www.', '');
        } catch (e) {}
        return { ...link, display: hostname };
    });
  }, [profile.links]);

  return (
    <div className="w-full max-w-[1180px] mx-auto bg-white pb-20">
      {/* Header Section */}
      <div className="relative w-full mb-24 sm:mb-28">
        {/* Banner */}
        <div className="relative w-full h-[200px] sm:h-[250px] rounded-3xl overflow-hidden bg-gray-200">
          {profile.banner ? (
            <Image
              src={profile.banner}
              alt="Cover"
              fill
              className="object-cover"
              priority
            />
          ) : (
             <div className="w-full h-full bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]" />
          )}
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute left-6 -bottom-16 sm:left-10 sm:-bottom-20 flex items-end">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[6px] border-white overflow-hidden bg-white shadow-md">
             <Image
                src={profile.avatar || '/default-profile.png'}
                alt={profile.displayName}
                fill
                className="object-cover"
             />
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-10 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10">
        {/* Left Column */}
        <div className="w-full">
            {/* Name and Details */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-3xl font-bold text-gray-900">{profile.displayName}</h1>
                    <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", isAvailable ? "bg-green-500" : "bg-red-500")} />
                        <span className={cn("text-sm font-medium", isAvailable ? "text-green-600" : "text-red-600")}>
                            {availabilityStatus}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{locationDescriptor}</span>
                </div>

                {profile.bio && (
                    <p className="text-gray-700 text-base leading-relaxed mb-4 max-w-2xl">
                        {profile.bio}
                    </p>
                )}

                {/* Recommendations and Links */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                    {profile.recommendations.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {profile.recommendations.slice(0, 3).map((rec, i) => (
                                    <div key={i} className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                                        {rec.recommenderName.charAt(0)}
                                    </div>
                                ))}
                            </div>
                            <span className="text-[#FA6E80] font-medium">+{profile.recommendations.length} recommendations</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                         {formattedLinks.map((link) => (
                             <a 
                                key={link.id} 
                                href={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-gray-500 hover:text-[#FA6E80] transition-colors"
                            >
                                <LinkIcon className="h-3.5 w-3.5" />
                                <span className="truncate max-w-[150px]">{link.display}</span>
                             </a>
                         ))}
                         {profile.links.length > 3 && (
                             <span className="text-gray-400">& {profile.links.length - 3} other links</span>
                         )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="w-full bg-transparent border-b border-gray-200 rounded-none h-auto p-0 mb-8 gap-8 justify-start">
                    <TabsTrigger 
                        value="profile"
                        className="rounded-full px-8 py-2.5 data-[state=active]:bg-[#FA6E80] data-[state=active]:text-white text-gray-600 bg-gray-100 hover:bg-gray-200 border-none text-base font-medium transition-all shadow-none"
                    >
                        Profile
                    </TabsTrigger>
                    <TabsTrigger 
                        value="activities"
                        className="rounded-full px-8 py-2.5 data-[state=active]:bg-[#FA6E80] data-[state=active]:text-white text-gray-600 bg-white hover:bg-gray-50 border-none text-base font-medium transition-all shadow-none"
                    >
                        Activities
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-10">
                     {/* Credits Section */}
                    {profile.credits.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-[#FA6E80] text-xl font-semibold">Credits</h2>
                            </div>
                            <div className="space-y-4">
                                {profile.credits.map((credit) => (
                                    <CreditCard key={credit.id} credit={credit} />
                                ))}
                            </div>
                            <div className="mt-4">
                                <Button variant="link" className="text-[#31A7AC] p-0 h-auto font-medium hover:no-underline hover:opacity-80">
                                    See all credits
                                </Button>
                            </div>
                        </section>
                    )}

                    {/* Skills Section */}
                    {profile.skills.length > 0 && (
                        <section className="bg-[#FAFAFA] rounded-2xl p-6 sm:p-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills</h2>
                            <div className="space-y-6">
                                {profile.skills.map((skill) => (
                                    <div key={skill.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{skill.skillName}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {skill.description || (
                                                <span className="italic text-gray-400">
                                                    {skill.proficiencyLevel ? `${skill.proficiencyLevel} proficiency` : 'No description available'}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                     {/* About Section */}
                     {profile.bio && (
                        <section className="bg-[#FAFAFA] rounded-2xl p-6 sm:p-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {profile.bio}
                            </p>
                        </section>
                     )}
                </TabsContent>

                <TabsContent value="activities">
                    <div className="py-10 text-center text-gray-500 bg-gray-50 rounded-2xl">
                        <p>No recent activities to show.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>

        {/* Right Sidebar (Highlights) */}
        <aside className="w-full space-y-8">
             {profile.highlights.length > 0 && (
                 <div className="flex flex-col gap-6 sticky top-24">
                    <div className="flex items-center gap-2">
                         <div className="h-8 w-1 bg-[#31A7AC] rounded-full" />
                         <h2 className="text-[#31A7AC] font-bold text-lg tracking-wide">HIGHLIGHTS</h2>
                    </div>
                    
                    <div className="space-y-8">
                        {profile.highlights.map((highlight) => (
                            <HighlightCard key={highlight.id} highlight={highlight} />
                        ))}
                    </div>
                 </div>
             )}
        </aside>
      </div>
    </div>
  );
}

function CreditCard({ credit }: { credit: any }) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const dateRange = [formatDate(credit.startDate), formatDate(credit.endDate)].filter(Boolean).join(" - ");

  return (
    <div className="bg-[#F8F9FB] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 transition-all hover:shadow-md">
        {/* Image */}
        <div className="relative w-full sm:w-[160px] h-[200px] sm:h-[120px] flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
            {credit.imgUrl ? (
                <Image 
                    src={credit.imgUrl} 
                    alt={credit.title || "Credit"} 
                    fill 
                    className="object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <span className="text-xs">No Image</span>
                </div>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
            <div className="mb-1">
                <span className="text-[#31A7AC] font-semibold text-sm uppercase tracking-wider">
                    {credit.productionType || "Production"}
                </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1">
                {credit.role || "Role"}
            </h3>
            
            <p className="text-gray-700 font-medium mb-2">
                {credit.creditTitle || credit.projectTitle || credit.brandClient || "Untitled Project"}
            </p>
            
            {credit.description && (
                 <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                    {credit.description}
                 </p>
            )}
            
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mt-auto">
                <Calendar className="h-3.5 w-3.5" />
                <span>{dateRange || credit.year || "Date N/A"}</span>
            </div>
        </div>
    </div>
  );
}

function HighlightCard({ highlight }: { highlight: any }) {
    // Helper to resolve highlight content (same as original logic)
    const getHighlightData = () => {
        if (highlight.sourceType === 'credit' && highlight.sourceData) {
          const credit = highlight.sourceData;
          return {
            title: credit.creditTitle || credit.credit_title || 'Untitled Credit',
            description: credit.description || '',
            imageUrl: credit.imgUrl || credit.image_url || null
          };
        } else if (highlight.sourceType === 'slate_post' && highlight.sourceData) {
          const post = highlight.sourceData;
          const firstMedia = post.media?.[0];
          return {
            title: 'Slate Post',
            description: post.content || '',
            imageUrl: firstMedia?.media_url || firstMedia?.mediaUrl || null
          };
        } else if (highlight.title && highlight.description) {
          return {
            title: highlight.title,
            description: highlight.description,
            imageUrl: highlight.imageUrl || highlight.image_url || null
          };
        }
        return {
          title: '',
          description: highlight.highlight || '',
          imageUrl: null
        };
    };

    const data = getHighlightData();

    return (
        <div className="group cursor-pointer">
             <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100">
                {data.imageUrl ? (
                    <Image 
                        src={data.imageUrl} 
                        alt={data.title || "Highlight"} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                         <span>No Image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
             </div>
             
             <h3 className="font-bold text-gray-900 text-lg mb-1">
                 {data.title || "Me on Cinematography"} {/* Fallback to generic if empty, to match design vibe */}
             </h3>
             
             <p className="text-gray-600 text-sm line-clamp-3 mb-2 leading-relaxed">
                 {data.description}
             </p>
             
             <span className="text-[#FA6E80] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                 read more...
             </span>
        </div>
    );
}
