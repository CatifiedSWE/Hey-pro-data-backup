
"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Calendar as CalendarIcon, Edit2, LinkIcon, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProfileProgress } from "@/app/(app)/profile/components/profileProgress"
import { ProfileDataTypes } from "@/types"
import { countries } from "@/lib/countries"

import AvalableDilog from "./Avalable"
import LinksDialog from "./Links"
import ProfileEditor from "./ProfileEdit"
import { CalendarDialog } from "./calendar"

export default function ShortProfile({ Profile }: { Profile: ProfileDataTypes }) {
    const [coverImageHovered, setCoverImageHovered] = useState(false)
    const filterScrollRef = useRef<HTMLDivElement>(null)

    const nationality = countries.find((country) => country.code === Profile.countryCode)?.name ?? Profile.countryCode ?? "Unknown"
    const locationDescriptor = [nationality, Profile.persionalDetails.location?.trim()].filter(Boolean).join(" • ")
    const highlightedRoles = Profile.roles.slice(0, 6)
    const extraRecommendations = Math.max(Profile.recomendPeoples.length - 2, 0)
    const primaryLink = Profile.persionalDetails.links[0]?.url ?? ""
    const linkSummary = (() => {
        if (!primaryLink) return "No links added"
        try {
            const host = new URL(primaryLink).hostname.replace(/^www\./, "")
            const extra = Profile.persionalDetails.links.length - 1
            const icon = <LinkIcon className="h-5 w-5" color="#FA6E80" />
            return extra > 0 ? <>{icon} {host} & {extra} other link{extra > 1 ? "s" : ""}</> : host
        } catch {
            const extra = Profile.persionalDetails.links.length - 1
            return extra > 0 ? `${primaryLink} & ${extra} other link${extra > 1 ? "s" : ""}` : primaryLink
        }
    })()


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
                    <Image
                        src={Profile.backgroundAvtar}
                        alt="Cover image"
                        fill
                        sizes="600px"
                        className="object-cover"
                    />
                    <input type="file" accept="image/*" id="cover-image-upload" className="hidden" />
                    <div
                        className={`absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[20px] bg-black/60 text-center text-white transition-opacity ${coverImageHovered ? "opacity-100" : "opacity-0"}`}
                    >
                        <p className="text-sm font-semibold">Replace Banner Image</p>
                        <span className="text-xs opacity-80">Optimal dimensions: 3000x759px</span>
                        <div className="flex gap-3">
                            <label htmlFor="cover-image-upload">
                                <Button variant="default" className="rounded-full bg-[#FA6E80] hover:bg-[#FA6E80]" asChild>
                                    <span className="cursor-pointer">Replace Image</span>
                                </Button>
                            </label>
                            <Button variant="ghost" className="rounded-full border border-white text-white">
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute inset-x-0 top-[38px] sm:top-[108px] left-[9px] sm:left-[58px] flex justify-start">
                <div
                    className="relative flex h-[112px] w-[112px] items-center justify-center"
                >

                    <ProfileProgress value={Profile.profileCompletion} imageUrl={Profile.avtar} className="rounded-full" />

                </div>

            </div>

            <div className="absolute right-4 top-[98px]  sm:top-[200px] flex items-center gap-3">
                <ProfileEditor
                    initialProfile={Profile.persionalDetails}
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
                    <AvalableDilog
                        initialProfile={Profile.persionalDetails}
                        triggerClassName="h-auto border-none bg-transparent p-0 text-[11px] font-[400] text-[#34A353] hover:bg-transparent"
                    />
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
                        <h1 className="text-[22px] font-semibold leading-[33px] text-black">{Profile.persionalDetails.name}</h1>
                        {Profile.recomendPeoples.length > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-3">
                                    {Profile.recomendPeoples.slice(0, 3).map((person, index) => (
                                        <Image
                                            key={`${person.imgUrl}-${index}`}
                                            src={person.imgUrl}
                                            alt="Referred profile"
                                            width={32}
                                            height={32}
                                            className="h-8 w-8 rounded-full border-2 border-white object-cover"
                                        />
                                    ))}
                                    {extraRecommendations > 0 && (
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-xs font-semibold text-[#444444]">
                                            +{extraRecommendations}
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-[#FA6E80]">
                                    +{Math.max(Profile.recomendPeoples.length, 0)} Referrals
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-[#181818]">
                        {(() => {
                            const sentences = Profile.positions
                                .flatMap(pos =>
                                    pos
                                        .split(/(?<=[.!?])\s+/)
                                        .map(s => s.trim())
                                )
                                .filter(Boolean);

                            return sentences.map((s, i) => (
                                <React.Fragment key={i}>
                                    {s}
                                    {i < sentences.length - 1 && <br />}
                                </React.Fragment>
                            ));
                        })()}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {highlightedRoles.map((role) => (
                        <span
                            key={role}
                            className="flex items-center rounded-[29px] h-[19px] bg-[#FA6E80] px-4 py-1 text-[10px] font-[400] tracking-wide text-white"
                        >
                            {role}
                        </span>
                    ))}
                </div>



                <p className="text-[14px] leading-[21px] text-[#181818]">{Profile.persionalDetails.shortAbout}</p>
                <p className="text-[14px] leading-[21px] text-[#181818]">140+ Awards were received</p>

                <LinksDialog
                    links={Profile.persionalDetails.links}
                    triggerClassName="h-auto justify-start p-0 -ml-4 text-[12px] font-medium text-[#31A7AC] hover:bg-transparent"
                    triggerLabel={linkSummary}
                />
            </div>
        </section>
    )
}