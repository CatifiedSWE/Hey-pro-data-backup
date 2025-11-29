
"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Calendar as CalendarIcon, Edit2, LinkIcon, MapPin, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProfileProgress } from "@/app/(app)/profile/components/profileProgress"
import { countries } from "@/lib/countries"
import { toast } from "sonner"
import { useProfile, type ProfileData, type LinkData } from "@/hooks/useProfile"

import AvalableDilog from "./Avalable"
import LinksDialog from "./Links"
import ProfileEditor from "./ProfileEdit"
import { CalendarDialog } from "./calendar"

interface ShortProfileProps {
  profile: ProfileData | null;
  links: LinkData[];
  onPhotoUpload: (file: File, type: 'profile' | 'banner') => Promise<{ success: boolean; message?: string; url?: string }>;
}

export default function ShortProfile({ profile, links, onPhotoUpload }: ShortProfileProps) {
    const [coverImageHovered, setCoverImageHovered] = useState(false)
    const [uploadingBanner, setUploadingBanner] = useState(false)
    const [uploadingProfile, setUploadingProfile] = useState(false)
    const filterScrollRef = useRef<HTMLDivElement>(null)
    const bannerInputRef = useRef<HTMLInputElement>(null)
    const profileInputRef = useRef<HTMLInputElement>(null)

    // Get display name - use alias if available, otherwise use regular name
    const displayName = profile?.alias_first_name && profile?.alias_surname
        ? `${profile.alias_first_name} ${profile.alias_surname}`
        : profile?.first_name && profile?.surname
            ? `${profile.first_name} ${profile.surname}`
            : 'User Profile';

    const nationality = profile?.country || "Unknown";
    const locationDescriptor = [nationality, profile?.city?.trim()].filter(Boolean).join(" • ");
    
    const primaryLink = links[0]?.url ?? "";
    const linkSummary = (() => {
        if (!primaryLink) return "No links added"
        try {
            const host = new URL(primaryLink).hostname.replace(/^www\./, "")
            const extra = links.length - 1
            const icon = <LinkIcon className="h-5 w-5" color="#FA6E80" />
            return extra > 0 ? <>{icon} {host} & {extra} other link{extra > 1 ? "s" : ""}</> : host
        } catch {
            const extra = links.length - 1
            return extra > 0 ? `${primaryLink} & ${extra} other link${extra > 1 ? "s" : ""}` : primaryLink
        }
    })()

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, WebP)');
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must be less than 2MB');
            return;
        }

        setUploadingBanner(true);
        try {
            const result = await onPhotoUpload(file, 'banner');
            if (result.success) {
                toast.success('Banner updated successfully!');
            } else {
                toast.error(result.message || 'Failed to upload banner');
            }
        } catch (error) {
            toast.error('Failed to upload banner');
        } finally {
            setUploadingBanner(false);
            if (bannerInputRef.current) {
                bannerInputRef.current.value = '';
            }
        }
    };

    const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG, PNG, WebP)');
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size must be less than 2MB');
            return;
        }

        setUploadingProfile(true);
        try {
            const result = await onPhotoUpload(file, 'profile');
            if (result.success) {
                toast.success('Profile photo updated successfully!');
            } else {
                toast.error(result.message || 'Failed to upload profile photo');
            }
        } catch (error) {
            toast.error('Failed to upload profile photo');
        } finally {
            setUploadingProfile(false);
            if (profileInputRef.current) {
                profileInputRef.current.value = '';
            }
        }
    };


    const updateFilterScrollState = () => {
        const container = filterScrollRef.current
        if (!container) return
    }


    useEffect(() => {
        updateFilterScrollState()
        const container = filterScrollRef.current
        if (!container) return
        container.addEventListener("scroll", updateFilterScrollState)
        window.addEventListener("resize", updateFilterScrollState)
        return () => {
            container.removeEventListener("scroll", updateFilterScrollState)
            window.removeEventListener("resize", updateFilterScrollState)
        }
    }, [])

    return (
        <section className="relative w-full border-b  border-[#DADADA] pb-6 ">
            <div
                className="relative h-[228px]"
                onMouseEnter={() => setCoverImageHovered(true)}
                onMouseLeave={() => setCoverImageHovered(false)}
            >
                <div className="relative sm:h-[150px] h-[88px] w-full overflow-hidden rounded-[20px]">
                    {profile?.banner_url ? (
                        <Image
                            src={profile.banner_url}
                            alt="Cover image"
                            fill
                            sizes="600px"
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]" />
                    )}
                    <input 
                        ref={bannerInputRef}
                        type="file" 
                        accept="image/jpeg,image/jpg,image/png,image/webp" 
                        id="cover-image-upload" 
                        className="hidden" 
                        onChange={handleBannerUpload}
                    />
                    <div
                        className={`absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[20px] bg-black/60 text-center text-white transition-opacity ${coverImageHovered ? "opacity-100" : "opacity-0"}`}
                    >
                        <p className="text-sm font-semibold">Replace Banner Image</p>
                        <span className="text-xs opacity-80">Optimal dimensions: 3000x759px (Max 2MB)</span>
                        <div className="flex gap-3">
                            <label htmlFor="cover-image-upload">
                                <Button 
                                    variant="default" 
                                    className="rounded-full bg-[#FA6E80] hover:bg-[#FA6E80]" 
                                    disabled={uploadingBanner}
                                    asChild
                                >
                                    <span className="cursor-pointer">
                                        {uploadingBanner ? 'Uploading...' : 'Replace Image'}
                                    </span>
                                </Button>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute inset-x-0 top-[38px] sm:top-[108px] left-[9px] sm:left-[58px] flex justify-start">
                <div
                    className="relative flex h-[112px] w-[112px] items-center justify-center group cursor-pointer"
                    onClick={() => profileInputRef.current?.click()}
                >
                    <ProfileProgress 
                        value={profile?.profile_completion_percentage || 0} 
                        imageUrl={profile?.profile_photo_url || '/image (2).png'} 
                        className="rounded-full" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="h-6 w-6 text-white" />
                    </div>
                    <input 
                        ref={profileInputRef}
                        type="file" 
                        accept="image/jpeg,image/jpg,image/png,image/webp" 
                        className="hidden" 
                        onChange={handleProfilePhotoUpload}
                    />
                </div>
            </div>

            <div className="absolute right-4 top-[98px]  sm:top-[200px] flex items-center gap-3">
                <ProfileEditor
                    profile={profile}
                    trigger={
                        <Button
                            className="h-[28px] w-[28px] mt-2 rounded-full bg-[#31A7AC] text-white shadow-[0_4px_16px_rgba(49,167,172,0.35)] hover:bg-[#27939f]"
                            aria-label="Edit profile"
                        >
                            <Edit2 className="h-5 w-5" />
                        </Button>
                    }
                />
            </div>
            <div className="absolute inset-x-0 top-[160px] max-w-[367.8px] left-[200px] hidden justify-center font-[400] text-[11px] sm:flex ">
                <div className="flex items-center gap-2  px-4 py-2 text-[#393939] ">
                    <MapPin className="h-3.5 w-3.5 text-[#393939]" />
                    <span className="whitespace-nowrap">{locationDescriptor}</span>
                </div>
                <div className="flex items-center gap-2  bg-white px-4 py-2 text-[#34A353] ">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#34A353]" />
                    <span className="text-[11px] font-[400] text-[#34A353]">Available</span>
                </div>
                <CalendarDialog
                    triggerClassName="flex h-[40px] items-center gap-2 rounded-full border-none bg-[#31A7AC] px-4 py-0 text-[11px] font-[400] text-white  hover:bg-[#27939f]"
                    triggerLabel={
                        <>
                            <CalendarIcon className="h-4 w-4" />
                            View Calendar
                        </>
                    }
                />
            </div>
            <div className="flex sm:mt-10 -mt-10 flex-col gap-4 px-4 sm:px-[58px]">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-[22px] font-semibold leading-[33px] text-black">{displayName}</h1>
                    </div>
                    {profile?.bio && (
                        <p className="text-sm text-[#181818] line-clamp-2">
                            {profile.bio}
                        </p>
                    )}
                </div>

                {profile?.day_rate && (
                    <p className="text-[14px] leading-[21px] text-[#181818]">
                        Day Rate: {profile.day_rate_currency || 'USD'} {profile.day_rate}
                    </p>
                )}

                <LinksDialog
                    links={links}
                    triggerClassName="h-auto justify-start p-0 -ml-4 text-[12px] font-medium text-[#31A7AC] hover:bg-transparent"
                    triggerLabel={linkSummary}
                />
            </div>
        </section>
    )
}
