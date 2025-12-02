import Image from "next/image"
import Link from "next/link"
import { Calendar, Edit, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ProfileDataTypes } from "@/types"

import CreditsEditor from "./CreditsEditor"

type CreditType = ProfileDataTypes["credits"][number]

const formatDate = (value?: Date | string) => {
    if (!value) return ""
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return date.toLocaleString("en-US", { month: "short", year: "numeric" })
}

const formatRange = (start?: Date | string, end?: Date | string) => {
    const startLabel = formatDate(start)
    const endLabel = formatDate(end)
    if (!startLabel && !endLabel) return "--"
    if (startLabel && endLabel) return `${startLabel} - ${endLabel}`
    return startLabel || endLabel
}

function CreditCard({ credit }: { credit: CreditType }) {
    const headingParts = [credit.brandClient || credit.creditTitle]
    if (credit.projectTitle && credit.projectTitle !== credit.brandClient) {
        headingParts.push(credit.projectTitle)
    }
    const heading = headingParts.filter(Boolean).join(" • ") || credit.creditTitle
    const releaseSuffix = credit.releaseYear ? ` (${credit.releaseYear}${credit.isUnreleased ? " • Unreleased" : ""})` : ""

    const roleLine = [credit.role, credit.localCompany || credit.internationalCompany]
        .filter(Boolean)
        .join(" • ")
    const companyLine = [credit.internationalCompany, credit.country].filter(Boolean).join(" • ")
    const productionTimeline = [credit.productionType, formatRange(credit.startDate, credit.endDate)].filter(Boolean).join(" • ")
    const awards = credit.awards ?? []

    return (
        <>
            <article className="flex sm:w-[540px] sm:h-[281px] mb-5 flex-col gap-4 border-b border-[#E6E6E6] pb-6 last:border-b-0">
                <div className="flex flex-col gap-1">
                    <p className="text-[18px] font-semibold text-[#181818]">
                        {heading}
                        {releaseSuffix}
                    </p>
                    {credit.headlineStats && (
                        <p className="text-[12px] font-semibold text-[#31A7AC]">{credit.headlineStats}</p>
                    )}
                </div>

                <div className="flex flex-col sm:w-[540px]  gap-5 lg:flex-row">
                    <div className="relative sm:w-[190px] flex-shrink-0">
                        {credit.imgUrl ? (
                            <Image
                                src={credit.imgUrl}
                                alt={credit.creditTitle}
                                width={190}
                                height={225}
                                className="sm:h-[225px] h-[346px] sm:w-[190px] w-[293px] rounded-[5px] object-cover"
                            />
                        ) : (
                            <div className="relative h-[346px] sm:h-[225px] sm:w-[190px] w-full rounded-[5px] bg-[#ffffff] shadow-[4px_4px_6.4px_rgba(0,0,0,0.03)]">
                                <div className="absolute left-3 top-3 flex items-center gap-[6px]">
                                    <span className="relative inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-[2px] border-[#25C9D0] bg-white" />
                                    <span className="relative inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-[2px] border-[#FF5168] bg-white" />
                                </div>
                                <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-[20px] font-medium text-[#444444]">
                                    Too busy to take a pic..!
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-1 flex-col gap-4">
                        <div className="space-y-0 text-[#181818]">
                            {roleLine && <p className="text-sm leading-[21px]">{roleLine}</p>}
                            {companyLine && <p className="text-xs text-[#444444]">{companyLine}</p>}
                            {productionTimeline && <p className="text-[10px] font-semibold text-[#444444] uppercase">{productionTimeline}</p>}
                        </div>
                        <p className="text-sm font-[400] leading-[18px] text-[#393939]">{credit.description}</p>
                        {awards.length > 0 && (
                            <div className="relative isolate rounded-r-[5px]  bg-white px-2 py-2">
                                <ScrollArea className="max-h-[85px] sm:h-full h-[85px] p-2  pr-2">
                                    <ul className="space-y-1">
                                        {awards.map((award, index) => (
                                            <li key={`${credit.id}-award-${index}`} className="text-[10px] font-semibold text-[#31A7AC]">
                                                <span>{award.title}</span>
                                                {award.detail && <span className="text-[#6B6B6B]"> {award.detail}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>

                            </div>
                        )}
                        {/* 
                    {credit.awardsSummary && (
                        <p className="text-sm font-semibold text-[#31A7AC]">{credit.awardsSummary}</p>
                    )}

                    <div className="mt-auto flex items-center gap-3 text-xs text-[#000000]">
                        <Calendar className="h-4 w-4" />
                        <span>{formatRange(credit.startDate, credit.endDate)}</span>
                    </div> */}
                    </div>
                </div>
            </article>
        </>
    )
}

export default function CreditsSection({ Profile }: { Profile: ProfileDataTypes }) {
    const credits = Profile.credits ?? []

    return (
        <section className="isolate w-full max-w-[600px] rounded-[20px] bg-[#FAFAFA] p-[29px] shadow-[0px_1px_10px_rgba(0,0,0,0.1)]">
            <header className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-[22px] font-[400] leading-[33px] text-black">Credits</h2>
                </div>
                <CreditsEditor
                    // initialCredits={credits}
                    trigger={
                        <div className="flex gap-3">
                            <Button size="icon" className="h-10 w-10 rounded-2xl bg-[#FA6E80] text-white hover:bg-[#fa6e80]/90">
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button size="icon" className="h-10 w-10 rounded-2xl bg-[#31A7AC] text-white hover:bg-[#27939f]">
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>
                    }
                />
            </header>

            <div className="flex flex-col gap-8">
                {credits.map((credit) => (
                    <>
                        <CreditCard key={credit.id} credit={credit} />
                        <div
                            className="h-0 w-full rounded-full"
                            style={{
                                border: '1px solid transparent',
                                backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #FA6E80 0%, #6A89BE 33%, #85AAB7 66%, #31A7AC 100%)',
                                backgroundOrigin: 'border-box',
                                backgroundClip: 'padding-box, border-box'
                            }}
                            aria-hidden
                        />
                    </>

                ))}
            </div>

            <div className="mt-8 flex flex-col items-start justify-between">
                <div className="flex flex-col sm:flex-row gap-5">
                    <div className="relative h-[145px] sm:h-[145px] sm:w-[190px] w-full rounded-[5px] bg-[#ffffff] shadow-[4px_4px_6.4px_rgba(0,0,0,0.03)]">
                        <div className="absolute left-3 top-3 flex items-center gap-[6px]">
                            <span className="relative inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-[2px] border-[#25C9D0] bg-white" />
                            <span className="relative inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-[2px] border-[#FF5168] bg-white" />
                        </div>
                        <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-[20px] font-medium text-[#444444]">
                            Too busy to take a pic..!
                        </p>
                    </div>
                    <div>
                        <h1 className="text-[14px] font-[600]">Role  |  Production type</h1>
                        <p>Client</p>
                        <p>Description</p>
                        <p>.....</p>
                        <p>.......</p>
                        <p>.........</p>
                        <div className="mt-auto flex items-center gap-3 text-xs text-[#000000]">
                            <Calendar className="h-4 w-4" />
                            <span>start_date - end_date</span>
                        </div>
                    </div>
                </div>

                <Link href="#" className="text-[14px] font-semibold text-[#31A7AC]">See all credits</Link>
            </div>
        </section>
    )
}
