"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarPicker } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar, Calendar as CalendarIcon, FileText, MapPin, Minus, Plus, UploadCloud, X, Zap } from "lucide-react"
import Image from "next/image"

type GigFormValues = {
    role: string
    type: string
    department: string
    location: string
    company: string
    description: string
    referenceUrl: string
    qualifyingCriteria: string
    gigRate: string
    expiryDate: string
}

const initialFormValues: GigFormValues = {
    role: "",
    type: "",
    department: "",
    location: "",
    company: "",
    description: "",
    referenceUrl: "",
    qualifyingCriteria: "",
    gigRate: "",
    expiryDate: "",
}

const buildDateKey = (year: number, monthIndex: number, day: number) => new Date(year, monthIndex, day).getTime()

const defaultSelectedDates = [
    buildDateKey(2025, 8, 1),

]

const capitalizeLabel = (value: string) => {
    if (!value) return ""
    return value.charAt(0).toUpperCase() + value.slice(1)
}

const getDateKey = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

const buildDayRangeString = (days: number[]) => {
    if (!days.length) return ""
    const sorted = [...new Set(days)].sort((a, b) => a - b)
    const ranges: Array<[number, number]> = []
    let start = sorted[0]
    let end = sorted[0]

    for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i]
        if (current === end + 1) {
            end = current
        } else {
            ranges.push([start, end])
            start = current
            end = current
        }
    }
    ranges.push([start, end])

    return ranges
        .map(([rangeStart, rangeEnd]) => (rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`))
        .join(", ")
}

const formatSelectedDates = (dateKeys: number[]) => {
    if (!dateKeys.length) return [] as string[]
    const uniqueSorted = [...new Set(dateKeys)].sort((a, b) => a - b)
    return uniqueSorted.map((key) => format(new Date(key), "d MMM, yyyy"))
}

const buildMonthSummaries = (dateKeys: number[]) => {
    const monthMap = new Map<string, { label: string; days: number[]; key: string }>()

    dateKeys.forEach((key) => {
        const date = new Date(key)
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`
        const existing = monthMap.get(monthKey)
        if (existing) {
            existing.days.push(date.getDate())
        } else {
            monthMap.set(monthKey, {
                key: monthKey,
                label: format(date, "MMM yyyy"),
                days: [date.getDate()],
            })
        }
    })

    const sortedEntries = [...monthMap.values()].sort((a, b) => {
        const [aYear, aMonth] = a.key.split("-").map(Number)
        const [bYear, bMonth] = b.key.split("-").map(Number)
        if (aYear === bYear) return aMonth - bMonth
        return aYear - bYear
    })

    return sortedEntries.map(({ label, days }) => ({
        label,
        ranges: buildDayRangeString(days),
    }))
}

export default function AddGigPage() {
    const [crewCount, setCrewCount] = useState(1)
    const [formValues, setFormValues] = useState<GigFormValues>(initialFormValues)
    const [currentMonth, setCurrentMonth] = useState(new Date(2025, 8, 1))
    const [selectedDates, setSelectedDates] = useState<number[]>([...defaultSelectedDates])
    const [isTbc, setIsTbc] = useState(false)
    const [requestQuote, setRequestQuote] = useState(false)
    const [expiryDate, setExpiryDate] = useState<Date | null>(null)
    const [referenceFile, setReferenceFile] = useState<File | null>(null)
    const [referencePreview, setReferencePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const previewUrlRef = useRef<string | null>(null)
    const [oscarAiSuggestion, setOscarAiSuggestion] = useState(false)

    // Sample data for Oscar AI
    const fillSampleGigData = () => {
        setCrewCount(5)
        setFormValues({
            role: "cinematographer",
            type: "contract",
            department: "Camera",
            location: "Dubai, UAE",
            company: "Oscar Films",
            description: "Looking for a skilled cinematographer for a 2-week commercial shoot. Experience with RED cameras preferred.",
            referenceUrl: "https://oscarfilms.com/sample-reel",
            qualifyingCriteria: "5+ years experience, portfolio required",
            gigRate: "12000",
            expiryDate: format(new Date(2025, 8, 10), "dd MMM, yyyy"),
        })
        setSelectedDates([
            buildDateKey(2025, 8, 3),
            buildDateKey(2025, 8, 4),
            buildDateKey(2025, 8, 5),
            buildDateKey(2025, 8, 6),
            buildDateKey(2025, 8, 7),
        ])
        setIsTbc(true)
        setRequestQuote(false)
        setExpiryDate(new Date(2025, 8, 10))
        setReferenceFile(null)
        setReferencePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }
    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
        return eachDayOfInterval({ start, end })
    }, [currentMonth])

    const handleCrewChange = (direction: "increment" | "decrement") => {
        setCrewCount((prev) => {
            if (direction === "decrement") {
                return Math.max(1, prev - 1)
            }
            return prev + 1
        })
    }

    const handleFieldChange = (field: keyof GigFormValues, value: string) => {
        setFormValues((prev) => ({ ...prev, [field]: value }))
    }

    const toggleDate = (day: Date) => {
        if (!isSameMonth(day, currentMonth)) return
        const dayKey = getDateKey(day)
        setSelectedDates((prev) =>
            prev.includes(dayKey)
                ? prev.filter((existing) => existing !== dayKey)
                : [...prev, dayKey].sort((a, b) => a - b),
        )
    }
    const formattedSelectedDates = useMemo(() => formatSelectedDates(selectedDates), [selectedDates])
    const monthDateSummaries = useMemo(() => buildMonthSummaries(selectedDates), [selectedDates])
    const formattedMonthLabel = format(currentMonth, "MMM yyyy")
    const hasActivePreview = useMemo(() => {
        const textFilled = Object.values(formValues).some((value) => value.trim().length > 0)
        const controlsChanged = crewCount !== 1 || isTbc || requestQuote || referenceFile || expiryDate
        return textFilled || controlsChanged
    }, [formValues, crewCount, isTbc, requestQuote, referenceFile, expiryDate])
    const previewDetailRows = useMemo(
        () => [
            { label: "Role", value: capitalizeLabel(formValues.role) || "Not provided" },
            { label: "Type", value: capitalizeLabel(formValues.type) || "Not provided" },
            { label: "Department", value: formValues.department || "Not provided" },
            { label: "Location", value: formValues.location || "Not provided" },
            { label: "Company", value: formValues.company || "Not provided" },
            { label: "Crew count", value: String(crewCount) },
            { label: "TBC", value: isTbc ? "Yes" : "No" },
            { label: "Request quote", value: requestQuote ? "Yes" : "No" },
            { label: "GIG rate", value: requestQuote ? "Requesting quote" : formValues.gigRate ? `AED ${formValues.gigRate}` : "Not provided" },
            { label: "Description", value: formValues.description || "Not provided" },
            { label: "Qualifying criteria", value: formValues.qualifyingCriteria || "Not provided" },
            {
                label: "Dates selected",
                value: monthDateSummaries.length
                    ? monthDateSummaries.map((entry) => `${entry.label} | ${entry.ranges}`).join("; ")
                    : "No dates selected",
            },
            {
                label: "Individual dates",
                value: formattedSelectedDates.length ? formattedSelectedDates.join(", ") : "No dates selected",
            },
            { label: "Reference URL", value: formValues.referenceUrl || "Not provided" },
            { label: "Reference file", value: referenceFile?.name || "No file uploaded" },
            { label: "Expiry date", value: formValues.expiryDate || "Auto-expire in 3 days" },
        ],
        [formValues, crewCount, isTbc, requestQuote, referenceFile, monthDateSummaries, formattedSelectedDates],
    )

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const payload = {
            crewCount,
            ...formValues,
            dates: selectedDates.map((key) => new Date(key)),
            isTbc,
            requestQuote,
            referenceFileName: referenceFile?.name || null,
            referenceFile,
            expiryDate,
        }
        console.log("Create gig payload", payload)
    }

    const resetForm = () => {
        setCrewCount(1)
        setFormValues(initialFormValues)
        setSelectedDates([...defaultSelectedDates])
        setIsTbc(false)
        setRequestQuote(false)
        setExpiryDate(null)
        setReferenceFile(null)
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current)
            previewUrlRef.current = null
        }
        setReferencePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null
        setReferenceFile(file)
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current)
            previewUrlRef.current = null
        }
        if (file && file.type.startsWith("image/")) {
            const objectUrl = URL.createObjectURL(file)
            previewUrlRef.current = objectUrl
            setReferencePreview(objectUrl)
        } else {
            setReferencePreview(null)
        }
    }

    const handleFileRemove = () => {
        setReferenceFile(null)
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current)
            previewUrlRef.current = null
        }
        setReferencePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const referenceLabel = referenceFile ? referenceFile.name : formValues.referenceUrl
    const previewAvatarSrc = referencePreview || "/image (1).png"

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current)
            }
        }
    }, [])
    return (
        <div className="flex justify-center  px-4 py-8 bg-[#F8F8F8]">
            <div className={`grid w-full  max-w-[1100px] gap-8 lg:grid-cols-[1.2fr_0.8fr] ${oscarAiSuggestion ? 'grid' : 'hidden'}  `}>
                {/** create gig form  */}
                <form
                    onSubmit={handleSubmit}
                    className="w-full mb-10"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-[20px] font-[400] text-[#1D1D1F]">Create GIG</h1>
                        </div>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-2xl leading-none text-[#CECFD2] transition hover:text-[#7B7B7B]"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>

                    <section className="mt-8 space-y-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-[30px] sm:pl-5">
                            <Label className="text-[18px] font-[400] text-[#1D1D1F]">Number of crew</Label>
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center rounded-[15px] h-[50px] w-[125px] border border-[#DEDEDE] bg-[#FFFFFF] px-3 py-1">
                                    <button
                                        type="button"
                                        onClick={() => handleCrewChange("decrement")}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FA6E80] text-[#FFFFFF]"
                                    >
                                        <Minus className="h-5 w-5 font-bold" />
                                    </button>
                                    <span className="px-4 text-lg font-[400] text-[#1D1D1F]">{crewCount}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleCrewChange("increment")}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#31A7AC] text-[#FFFFFF]"
                                    >
                                        <Plus className="h-5 w-5 font-bold " />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <Select onValueChange={(value) => handleFieldChange("role", value)} value={formValues.role}>
                                <SelectTrigger className="h-[54px] w-full rounded-[15px] border-[#646464] bg-[#ffffff] text-[#000000] sm:w-[243px]">
                                    <SelectValue placeholder="Enter GIG role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="director">Director</SelectItem>
                                    <SelectItem value="producer">Producer</SelectItem>
                                    <SelectItem value="cinematographer">Cinematographer</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select onValueChange={(value) => handleFieldChange("type", value)} value={formValues.type}>
                                <SelectTrigger className="h-[54px] w-full rounded-[15px] border-[#646464] bg-[#ffffff] text-[#000000] sm:w-[243px]">
                                    <SelectValue placeholder="Enter GIG type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="full-time">Full time</SelectItem>
                                    <SelectItem value="part-time">Part time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Input
                            placeholder="Select GIG department"
                            value={formValues.department}
                            onChange={(event) => handleFieldChange("department", event.target.value)}
                            className="h-[54px] rounded-2xl border-[#E4E7EC] bg-[#ffffff] text-[#515151]"
                        />
                        <Input
                            placeholder="Enter GIG location(s)"
                            value={formValues.location}
                            onChange={(event) => handleFieldChange("location", event.target.value)}
                            className="h-[54px] rounded-2xl border-[#646464] bg-[#ffffff] text-[#515151]"
                        />
                        <Input
                            placeholder="Enter production company name (optional)"
                            value={formValues.company}
                            onChange={(event) => handleFieldChange("company", event.target.value)}
                            className="h-[54px] rounded-2xl border-[#646464] bg-[#ffffff] text-[#515151]"
                        />

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#1D1D1F]">Edit description</Label>
                            <Textarea
                                placeholder="I am looking for..."
                                value={formValues.description}
                                onChange={(event) => handleFieldChange("description", event.target.value)}
                                className="min-h-[120px] rounded-2xl border-[#646464] bg-[#ffffff] text-[#515151]"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-[#1D1D1F]">Choose date(s)</Label>
                            </div>
                            <div className="rounded-[24px] p-4">

                                <div className="mx-auto sm:mx-0 mb-5 flex w-full max-w-[425px] flex-row items-center justify-between gap-2 rounded-[10px] p-[10px] text-[#1D1D1F] bg-[#ffffff] min-h-[56px]">
                                    <span className="text-[24px] font-[400] text-[#FA596E]">{format(currentMonth, "MMM, yyyy")}</span>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="ghost" size="icon" className="h-10 rounded-full" onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}>
                                            -
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon" className="h-10 rounded-full" onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}>
                                            +
                                        </Button>
                                    </div>
                                    <CalendarIcon className="h-5 w-5 text-[#FF5470]" />
                                </div>


                                <div className="mx-auto sm:mx-0 grid w-full max-w-[425px] grid-cols-7 items-center gap-2 rounded-t-[10px] bg-[#ffffff] text-center text-[25px] font-[400] text-[#FF8FA5] min-h-[60px]">
                                    {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
                                        <span key={day}>{day}</span>
                                    ))}
                                </div>
                                <ScrollArea className="mx-auto sm:mx-0 max-h-[333px] w-full max-w-[425px] rounded-b-[10px] bg-[#ffffff]">
                                    <div className="grid grid-cols-7 gap-x-0 gap-y-2">
                                        {calendarDays.map((day, index) => {
                                            const dayNumber = day.getDate()
                                            const isCurrentMonthDay = isSameMonth(day, currentMonth)
                                            const dayKey = getDateKey(day)
                                            const isSelected = isCurrentMonthDay && selectedDates.includes(dayKey)
                                            const columnIndex = index % 7
                                            const atRowStart = columnIndex === 0
                                            const atRowEnd = columnIndex === 6
                                            const prevCell = columnIndex > 0 ? calendarDays[index - 1] : null
                                            const nextCell = columnIndex < 6 ? calendarDays[index + 1] : null
                                            const isPrevSelected = Boolean(
                                                prevCell &&
                                                isSameMonth(prevCell, currentMonth) &&
                                                selectedDates.includes(getDateKey(prevCell))
                                            )
                                            const isNextSelected = Boolean(
                                                nextCell &&
                                                isSameMonth(nextCell, currentMonth) &&
                                                selectedDates.includes(getDateKey(nextCell))
                                            )

                                            const shapeClass = cn(
                                                "rounded-full",
                                                isSelected && isPrevSelected && isNextSelected && "rounded-none",
                                                isSelected && isPrevSelected && !isNextSelected &&
                                                (atRowEnd ? "rounded-none" : "rounded-r-full rounded-l-none"),
                                                isSelected && !isPrevSelected && isNextSelected && (atRowStart ? "rounded-none" : "rounded-l-full rounded-r-none"),
                                                isSelected && !isPrevSelected && !isNextSelected && [
                                                    atRowStart ? "rounded-l-none" : "rounded-l-full",
                                                    atRowEnd ? "rounded-r-none" : "rounded-r-full",
                                                ]
                                            )

                                            return (
                                                <button
                                                    key={day.toISOString()}
                                                    type="button"
                                                    disabled={!isCurrentMonthDay}
                                                    onClick={() => toggleDate(day)}
                                                    className={cn(
                                                        "flex h-[54px] w-full items-center justify-center text-[26px] font-[400] transition",
                                                        shapeClass,
                                                        !isCurrentMonthDay && "text-[#D7E3E5]",
                                                        isCurrentMonthDay && !isSelected && "text-[#199490]",
                                                        isSelected && "bg-[#1FB3B0] text-white",
                                                        !isCurrentMonthDay && "cursor-default"
                                                    )}
                                                >
                                                    {dayNumber}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>

                            <div className="ml-0 flex items-center gap-3 sm:ml-10">
                                <Checkbox id="tbc" checked={isTbc} onCheckedChange={() => setIsTbc((prev) => !prev)} className="h-[27px] w-[27px]" />
                                <Label htmlFor="tbc" className="text-[18px] font-[400] text-[#1D1D1F]">
                                    TBC
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-[#1D1D1F]">
                                Include reference (optional)
                            </Label>
                            <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
                                <Input
                                    placeholder="Enter URL"
                                    value={formValues.referenceUrl}
                                    onChange={(event) => handleFieldChange("referenceUrl", event.target.value)}
                                    className="h-[54px] rounded-2xl border-[#646464] bg-[#ffffff] text-[#515151]"
                                />
                                <div className="space-y-3">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl border-[#E4E7EC] text-[#1D1D1F]"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <UploadCloud className="h-4 w-4" />
                                        Upload file
                                    </Button>
                                    {referenceFile && (
                                        <div className="flex items-center gap-3 rounded-2xl border border-[#646464] bg-[#ffffff] px-4 py-2 text-sm text-[#515151]">
                                            <div className="flex-1">
                                                <p className="font-[400]">{referenceFile.name}</p>
                                                <p className="text-xs text-[#8F8F8F]">{(referenceFile.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleFileRemove}
                                                className="text-[#FF5470] transition hover:opacity-80"
                                                aria-label="Remove file"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-[#1D1D1F]">
                                Qualifying criteria (optional)
                            </Label>
                            <Textarea
                                placeholder="Describe your qualifying criteria"
                                value={formValues.qualifyingCriteria}
                                onChange={(event) => handleFieldChange("qualifyingCriteria", event.target.value)}
                                className="min-h-[120px] rounded-2xl border-[#646464] bg-[#ffffff] text-[#515151]"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-[#1D1D1F]">GIG rate</Label>
                            <div className="flex flex-col w-full items-start gap-3">
                                <div className="flex flex-1 items-center rounded-[15px] w-full border border-[#646464] bg-[#ffffff] text-[#515151]">
                                    <div>
                                        <span className="px-4 text-sm font-[400] text-[#7B7B7B]">AED</span>
                                        <span className="w-px h-full border border-[#646464]" />
                                    </div>

                                    <Input
                                        type="number"
                                        placeholder="$ 000.00"
                                        value={formValues.gigRate}
                                        onChange={(event) => handleFieldChange("gigRate", event.target.value)}
                                        disabled={requestQuote}
                                        className="h-[54px] border-0 bg-transparent focus-visible:ring-0"
                                    />
                                </div>
                                <div className="flex items-center gap-2 ml-0 sm:ml-[18px]">
                                    <Checkbox
                                        className="h-[27px] w-[27px]"
                                        id="request-quote"
                                        checked={requestQuote}
                                        onCheckedChange={() => setRequestQuote((prev) => !prev)}
                                    />
                                    <Label htmlFor="request-quote" className="text-[18px] font-[400] text-[#1D1D1F]">
                                        Request quote
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-[18px] font-[400] text-[#444444]">GIG expiry date</Label>
                            <p className="text-[14px] font-[400] text-[#444444]">The GIG will expire after 3 days if a date is not selected</p>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "flex w-full max-w-[403px] items-center justify-between rounded-[10px] h-[56px] border-[#646464] bg-[#ffffff]  text-left text-[#515151]",
                                            !expiryDate && "text-[#A3A3A3]"
                                        )}
                                    >
                                        <span className="font-[400] text-[24px] text-[#FF5470]">
                                            {expiryDate ? format(expiryDate, "dd MMM, yyyy") : "Select expiry date"}

                                        </span>
                                        <Calendar className=" text-[#FF5470]" size={30} />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-auto border-0 p-0 shadow-none">
                                    <CalendarPicker
                                        mode="single"
                                        selected={expiryDate ?? undefined}
                                        onSelect={(date) => {
                                            if (date) {
                                                setExpiryDate(date)
                                                handleFieldChange("expiryDate", format(date, "dd MMM, yyyy"))
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </section>

                    <div className="mt-8 flex flex-col gap-3 border-t border-[#F0F0F0] pt-6 md:flex-row md:items-center md:justify-between">
                        <button
                            type="button"
                            className="flex items-center gap-2 text-sm font-[400] text-[#F8C028]"
                        >
                            <Zap className="h-4 w-4" /> Return to Quick GIG
                        </button>
                        <div className="flex flex-1 justify-end gap-3">
                            <Button type="button" variant="outline" className="rounded-[10px] border-[#2AA9A7] text-[#2AA9A7] h-[47px] w-[102px]">
                                Publish
                            </Button>
                            <Button type="submit" className="rounded-[10px] bg-[#2AA9A7] px-6 text-white h-[47px] w-[102px]">
                                Save to draft
                            </Button>
                        </div>
                    </div>
                </form>

                <aside className="w-full rounded-[32px]">
                    <h2 className="text-lg font-[400] text-[#1D1D1F]">Preview</h2>
                    <div className="mt-4 rounded-[28px] p-6">
                        {hasActivePreview ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={previewAvatarSrc}
                                        alt="Project owner avatar"
                                        width={44}
                                        height={44}
                                        className="rounded-full object-cover"
                                        unoptimized={Boolean(referencePreview)}
                                    />
                                    <div>
                                        <p className="text-sm font-[400] text-[#1D1D1F]">Michael Molar</p>
                                        <p className="text-xs text-[#8F8F8F]">Project owner</p>
                                    </div>
                                </div>
                                <p className="mt-4 text-lg font-[400] text-[#1D1D1F]">
                                    {crewCount} {capitalizeLabel(formValues.role) || "Crew"} for {capitalizeLabel(formValues.type) || "Gig"}
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-sm text-[#6F6F6F]">
                                    <MapPin className="h-4 w-4" />
                                    <span>{formValues.location || "Location details pending"}</span>
                                </div>
                                <p className="mt-3 text-sm text-[#6F6F6F]">
                                    {formValues.description || "Description of the GIG will be here ..."}
                                </p>
                                <div className="my-4 h-px w-full border-b border-dotted border-[#E0E0E0]" />

                                <div className="space-y-4 text-sm text-[#1D1D1F]">
                                    <div className="flex gap-3">
                                        <CalendarIcon className="mt-1 h-4 w-4 text-[#6F6F6F]" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-[400] uppercase tracking-wide text-[#8F8F8F]">Selected dates</p>
                                            {monthDateSummaries.length ? (
                                                <div className="space-y-1">
                                                    {monthDateSummaries.map((entry) => (
                                                        <p key={`${entry.label}-${entry.ranges}`} className="text-sm text-[#4F4F4F]">
                                                            <span className="font-[400] text-[#1D1D1F]">{entry.label}</span>
                                                            <span className="px-2 text-[#A3A3A3]">|</span>
                                                            {entry.ranges}
                                                        </p>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[#6F6F6F]">No dates selected yet</p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-base font-[400]">
                                        {requestQuote ? "Requesting quote" : `AED ${formValues.gigRate || "0"}`}
                                    </p>
                                    <p className="text-sm font-[400] text-[#1D1D1F]">
                                        Qualifying criteria:
                                        <span className="pl-1 font-normal text-[#6F6F6F]">
                                            {formValues.qualifyingCriteria || "This is where the qualifying criteria value comes"}
                                        </span>
                                    </p>
                                    {referenceLabel && (
                                        <div className="flex items-center gap-2 text-sm text-[#1D1D1F]">
                                            <FileText className="h-4 w-4" />
                                            <span>Reference included{referenceFile ? ` (${referenceFile.name})` : ""}</span>
                                        </div>
                                    )}
                                </div>

                                {/* <div className="mt-6">
                                    <p className="text-xs font-[400] uppercase tracking-wide text-[#199490]">Form summary</p>
                                    <dl className="mt-3 grid gap-3 text-sm text-[#1D1D1F]">
                                        {previewDetailRows.map((row) => (
                                            <div
                                                key={row.label}
                                                className="rounded-xl px-3 py-2"
                                            >
                                                <dt className="text-xs font-[400] uppercase tracking-wide text-[#8F8F8F]">
                                                    {row.label}
                                                </dt>
                                                <dd className="text-sm text-[#1D1D1F]">{row.value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div> */}

                                <p className="mt-4 text-xs text-[#8F8F8F]">Posted on {format(new Date(), "d MMM, yyyy")}</p>
                                <p className="mt-1 text-xs font-[400] text-[#FF5470]">
                                    Apply before {formValues.expiryDate || formattedMonthLabel}
                                </p>
                            </>
                        ) : (
                            <div className="space-y-4 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-full bg-[#F0F0F0]" />
                                    <div className="space-y-2">
                                        <div className="h-3 w-24 rounded-full bg-[#F0F0F0]" />
                                        <div className="h-2 w-16 rounded-full bg-[#F0F0F0]" />
                                    </div>
                                </div>
                                <div className="h-4 w-56 rounded-full bg-[#F0F0F0]" />
                                <div className="h-3 w-40 rounded-full bg-[#F0F0F0]" />
                                <div className="h-16 rounded-2xl bg-[#F0F0F0]" />
                                <div className="space-y-2">
                                    <div className="h-3 w-48 rounded-full bg-[#F0F0F0]" />
                                    <div className="h-3 w-36 rounded-full bg-[#F0F0F0]" />
                                    <div className="h-3 w-28 rounded-full bg-[#F0F0F0]" />
                                </div>
                                <div className="h-2 w-32 rounded-full bg-[#F0F0F0]" />
                            </div>
                        )}
                    </div>
                </aside>
            </div>
            {/** create gig form with ai */}
            <div className={`grid w-full  max-w-[1200px] gap-8 lg:grid-cols-[1.2fr_0.8fr] ${oscarAiSuggestion ? 'hidden' : 'grid'}  `}>
                <form
                    onSubmit={handleSubmit}
                    className="w-full mb-10"
                >
                    <div className="flex items-start justify-between">
                        <div className="">
                            <div className="text-[20px] font-[400] text-[#1D1D1F] flex flex-row gap-1 justify-center items-center"><span><Image src="/assets/icons/zap.png" alt="Zap Icon" width={30} height={30} /></span><span> Create a Quick GIG</span></div>
                        </div>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-2xl leading-none text-[#CECFD2] transition hover:text-[#7B7B7B]"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>

                    <section className="mt-8 space-y-6">






                        <div className="space-y-2">
                            <Textarea
                                placeholder="I am looking for..."
                                value={formValues.description}
                                onChange={(event) => handleFieldChange("description", event.target.value)}
                                className="min-h-[120px] rounded-2xl border-[#646464] bg-[#ffffff] text-[#515151]"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium text-[#1D1D1F]">Choose date(s)</Label>
                            </div>
                            <div className="rounded-[24px] p-4">

                                <div className="mx-auto sm:mx-0 mb-5 flex w-full max-w-[425px] flex-row items-center justify-between gap-2 rounded-[10px] p-[10px] text-[#1D1D1F] bg-[#ffffff] min-h-[56px]">
                                    <span className="text-[24px] font-[400] text-[#FA596E]">{format(currentMonth, "MMM, yyyy")}</span>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="ghost" size="icon" className="h-10 rounded-full" onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}>
                                            -
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon" className="h-10 rounded-full" onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}>
                                            +
                                        </Button>
                                    </div>
                                    <CalendarIcon className="h-5 w-5 text-[#FF5470]" />
                                </div>


                                <div className="mx-auto sm:mx-0 grid w-full max-w-[425px] grid-cols-7 items-center gap-2 rounded-t-[10px] bg-[#ffffff] text-center text-[25px] font-[400] text-[#FF8FA5] min-h-[60px]">
                                    {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
                                        <span key={day}>{day}</span>
                                    ))}
                                </div>
                                <ScrollArea className="mx-auto sm:mx-0 max-h-[333px] w-full max-w-[425px] rounded-b-[10px] bg-[#ffffff]">
                                    <div className="grid grid-cols-7 gap-x-0 gap-y-2">
                                        {calendarDays.map((day, index) => {
                                            const dayNumber = day.getDate()
                                            const isCurrentMonthDay = isSameMonth(day, currentMonth)
                                            const dayKey = getDateKey(day)
                                            const isSelected = isCurrentMonthDay && selectedDates.includes(dayKey)
                                            const columnIndex = index % 7
                                            const atRowStart = columnIndex === 0
                                            const atRowEnd = columnIndex === 6
                                            const prevCell = columnIndex > 0 ? calendarDays[index - 1] : null
                                            const nextCell = columnIndex < 6 ? calendarDays[index + 1] : null
                                            const isPrevSelected = Boolean(
                                                prevCell &&
                                                isSameMonth(prevCell, currentMonth) &&
                                                selectedDates.includes(getDateKey(prevCell))
                                            )
                                            const isNextSelected = Boolean(
                                                nextCell &&
                                                isSameMonth(nextCell, currentMonth) &&
                                                selectedDates.includes(getDateKey(nextCell))
                                            )

                                            const shapeClass = cn(
                                                "rounded-full",
                                                isSelected && isPrevSelected && isNextSelected && "rounded-none",
                                                isSelected && isPrevSelected && !isNextSelected &&
                                                (atRowEnd ? "rounded-none" : "rounded-r-full rounded-l-none"),
                                                isSelected && !isPrevSelected && isNextSelected && (atRowStart ? "rounded-none" : "rounded-l-full rounded-r-none"),
                                                isSelected && !isPrevSelected && !isNextSelected && [
                                                    atRowStart ? "rounded-l-none" : "rounded-l-full",
                                                    atRowEnd ? "rounded-r-none" : "rounded-r-full",
                                                ]
                                            )

                                            return (
                                                <button
                                                    key={day.toISOString()}
                                                    type="button"
                                                    disabled={!isCurrentMonthDay}
                                                    onClick={() => toggleDate(day)}
                                                    className={cn(
                                                        "flex h-[54px] w-full items-center justify-center text-[26px] font-[400] transition",
                                                        shapeClass,
                                                        !isCurrentMonthDay && "text-[#D7E3E5]",
                                                        isCurrentMonthDay && !isSelected && "text-[#199490]",
                                                        isSelected && "bg-[#1FB3B0] text-white",
                                                        !isCurrentMonthDay && "cursor-default"
                                                    )}
                                                >
                                                    {dayNumber}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>

                            <div className="ml-0 flex items-center gap-3 sm:ml-10">
                                <Checkbox id="tbc" checked={isTbc} onCheckedChange={() => setIsTbc((prev) => !prev)} className="h-[27px] w-[27px]" />
                                <Label htmlFor="tbc" className="text-[18px] font-[400] text-[#1D1D1F]">
                                    TBC
                                </Label>
                            </div>
                        </div>
                    </section>

                    <div className="mt-8 flex flex-col gap-3 border-t-[2px] border-[#F0F0F0] pt-6 md:flex-row md:items-center md:justify-between">
                        <button
                            type="button"
                            className="flex items-center gap-2 text-sm font-[400] "
                        >
                            Discard
                        </button>
                        <div className="flex flex-1 justify-end gap-3">
                            <Button type="button" variant="outline" className="rounded-[10px] border-[#2AA9A7] text-[#2AA9A7] h-[47px] w-[102px]">
                                Publish
                            </Button>
                            <Button type="submit" className="rounded-[10px] bg-[#2AA9A7] px-6 text-white h-[47px] w-[102px]">
                                Save to draft
                            </Button>
                        </div>
                    </div>
                </form>

                <aside className="rounded-[32px]">
                    <h2 className="text-lg font-[400] text-[#1D1D1F]">Preview</h2>
                    <div className="mt-4 rounded-[28px]">
                        {hasActivePreview ? (
                            <div className="bg-white shadow p-4 rounded-[17px] mb-4">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={previewAvatarSrc}
                                        alt="Project owner avatar"
                                        width={24}
                                        height={24}
                                        className="rounded-full object-cover"
                                        unoptimized={Boolean(referencePreview)}
                                    />
                                    <div>
                                        <p className="text-sm font-[400] text-[#1D1D1F]">Michael Molar</p>
                                        <p className="text-xs text-[#8F8F8F]">Project owner</p>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-[#6F6F6F]">
                                    {formValues.description || "Description of the GIG will be here ..."}
                                </p>
                                <div className="my-4 h-px w-full  border-dotted border-[#E0E0E0]" />

                                <div className="space-y-4 text-sm text-[#1D1D1F]">
                                    <div className="flex gap-3">
                                        <CalendarIcon className="mt-1 h-4 w-4 text-[#6F6F6F]" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-[400] uppercase tracking-wide text-[#8F8F8F]">Selected dates</p>
                                            {monthDateSummaries.length ? (
                                                <div className="space-y-1">
                                                    {monthDateSummaries.map((entry) => (
                                                        <p key={`${entry.label}-${entry.ranges}`} className="text-sm text-[#4F4F4F]">
                                                            <span className="font-[400] text-[#1D1D1F]">{entry.label}</span>
                                                            <span className="px-2 text-[#A3A3A3]">|</span>
                                                            {entry.ranges}
                                                        </p>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-[#6F6F6F]">No dates selected yet</p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-base font-[400]">
                                        {requestQuote ? "Requesting quote" : `AED ${formValues.gigRate || "0"}`}
                                    </p>
                                    <p className="text-sm font-[400] text-[#1D1D1F]">
                                        Qualifying criteria:
                                        <span className="pl-1 font-normal text-[#6F6F6F]">
                                            {formValues.qualifyingCriteria || "This is where the qualifying criteria value comes"}
                                        </span>
                                    </p>
                                    {referenceLabel && (
                                        <div className="flex items-center gap-2 text-sm text-[#1D1D1F]">
                                            <FileText className="h-4 w-4" />
                                            <span>Reference included{referenceFile ? ` (${referenceFile.name})` : ""}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="mt-4 text-xs text-[#8F8F8F]">Posted on {format(new Date(), "d MMM, yyyy")}</p>
                                <p className="mt-1 text-xs font-[400] text-[#FF5470]">
                                    Apply before {formValues.expiryDate || formattedMonthLabel}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-full bg-[#F0F0F0]" />
                                    <div className="space-y-2">
                                        <div className="h-3 w-24 rounded-full bg-[#F0F0F0]" />
                                        <div className="h-2 w-16 rounded-full bg-[#F0F0F0]" />
                                    </div>
                                </div>
                                <div className="h-4 w-56 rounded-full bg-[#F0F0F0]" />
                                <div className="h-3 w-40 rounded-full bg-[#F0F0F0]" />
                                <div className="h-16 rounded-2xl bg-[#F0F0F0]" />
                                <div className="space-y-2">
                                    <div className="h-3 w-48 rounded-full bg-[#F0F0F0]" />
                                    <div className="h-3 w-36 rounded-full bg-[#F0F0F0]" />
                                    <div className="h-3 w-28 rounded-full bg-[#F0F0F0]" />
                                </div>
                                <div className="h-2 w-32 rounded-full bg-[#F0F0F0]" />
                            </div>
                        )}
                        <div className="h-[126px] border border-[#FA596E] rounded-[10px] flex flex-col px-3 font-[600] text-[15px] justify-center max-w-[441px]">
                            <span>Your GIG could look even better with AI!</span>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex h-[54px]  items-center justify-center gap-2  border-[#FA596E] text-[14px] font-[600] text-[#FA596E] w-[158px] rounded-[10px] mt-4"
                                onClick={() => {
                                    setOscarAiSuggestion(true)
                                    fillSampleGigData()
                                }}
                            >
                                <Image src="/assets/icons/ai-gig.png" alt="Sparkles Icon" width={31} height={31} />
                                Try Oscar AI
                            </Button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}
