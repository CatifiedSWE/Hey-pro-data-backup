"use client";

import Image from "next/image";
import { Calendar as CalendarIcon, LocationEdit, Plus, X, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { format } from "date-fns";
import React from "react";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { WhatsOnEvent } from "@/data/whatsOnEvents";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getAccessToken } from "@/lib/supabase/client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const DEFAULT_START_TIME = "21:00";
const DEFAULT_END_TIME = "22:00";

type CalendarCell = {
    day: number;
    type: "prev" | "current" | "next";
};

const buildCalendarCells = (activeMonth: Date): CalendarCell[] => {
    const year = activeMonth.getFullYear();
    const month = activeMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const shift = (firstDay.getDay() + 6) % 7; // start week on Monday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const cells: CalendarCell[] = [];
    const totalCells = 42;

    for (let index = 0; index < totalCells; index += 1) {
        const dayNumber = index - shift + 1;
        if (dayNumber < 1) {
            cells.push({ day: daysInPrevMonth + dayNumber, type: "prev" });
            continue;
        }
        if (dayNumber > daysInMonth) {
            cells.push({ day: dayNumber - daysInMonth, type: "next" });
            continue;
        }
        cells.push({ day: dayNumber, type: "current" });
    }

    return cells;
};

type Meridiem = "AM" | "PM";

const padTime = (value: number) => String(value).padStart(2, "0");

const timeToParts = (time: string) => {
    const [hours = "00", minutes = "00"] = time.split(":");
    const hourNum = Number(hours);
    const minuteNum = Number(minutes);
    const period: Meridiem = hourNum >= 12 ? "PM" : "AM";
    const displayHour = hourNum % 12 || 12;
    return { hours: displayHour, minutes: minuteNum, period };
};

const partsToTime = (hours: number, minutes: number, period: Meridiem) => {
    const safeHours = Math.min(Math.max(hours || 1, 1), 12);
    const safeMinutes = Math.min(Math.max(minutes || 0, 0), 59);
    let hour24 = safeHours % 12;
    if (period === "PM" && safeHours !== 12) hour24 += 12;
    if (period === "AM" && safeHours === 12) hour24 = 0;
    return `${padTime(hour24)}:${padTime(safeMinutes)}`;
};

const readableTime = (time: string) => {
    const { hours, minutes, period } = timeToParts(time);
    return `${hours}:${padTime(minutes)} ${period}`;
};

const labelTo24Hour = (label?: string, fallback = DEFAULT_START_TIME) => {
    if (!label) return fallback;
    const match = label.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return fallback;
    const [, hourRaw, minuteRaw, periodRaw] = match;
    let hours = Number(hourRaw) % 12;
    if (periodRaw.toUpperCase() === "PM") hours += 12;
    else if (hours === 12) hours = 0;
    const minutes = Number(minuteRaw) || 0;
    return `${padTime(hours)}:${padTime(minutes)}`;
};

const splitTimeRange = (range?: string): string[] => {
    if (!range) return [];
    return range.split("-").map((value) => value.trim());
};

// Helper to get today at midnight for comparison
const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

type TimeFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
};

const TimeField = ({ label, value, onChange }: TimeFieldProps) => {
    const parts = timeToParts(value);
    const updateValue = (next: Partial<typeof parts>) => {
        const merged = { ...parts, ...next };
        onChange(partsToTime(merged.hours, merged.minutes, merged.period));
    };

    return (
        <label className="flex w-full max-w-[145px] flex-col gap-1 text-xs font-[400] text-[#FA596E]">
            <span className="sr-only">{label}</span>
            <div className="flex items-center justify-between rounded-[7px] bg-white px-[1px] py-[6px] text-[#FA596E] shadow-sm">
                <div className="flex items-baseline gap-1 text-[16.94px] leading-[25px]">
                    <input
                        type="number"
                        min={1}
                        max={12}
                        value={parts.hours}
                        onChange={(event) => updateValue({ hours: Number(event.target.value) || 1 })}
                        className="w-10 bg-transparent text-center text-[16.94px] font-normal text-[#FA596E] focus:outline-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span>:</span>
                    <input
                        type="number"
                        min={0}
                        max={59}
                        value={padTime(parts.minutes)}
                        onChange={(event) => updateValue({ minutes: Number(event.target.value) || 0 })}
                        className="w-10 bg-transparent text-center text-[16.94px] font-normal text-[#FA596E] focus:outline-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>
                <select
                    value={parts.period}
                    onChange={(event) => updateValue({ period: event.target.value as Meridiem })}
                    className="bg-transparent text-[16.94px] font-medium text-[#FA596E] focus:outline-none"
                >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
            </div>
        </label>
    );
};

type EditWhatsOnFormProps = {
    event: WhatsOnEvent;
    onChange?: (updatedEvent: any) => void;
};

export function EditWhatsOnForm({ event, onChange }: EditWhatsOnFormProps) {
    const [title, setTitle] = React.useState(event.title || "");
    const [venue, setVenue] = React.useState(event.location || "");
    const [isOnline, setIsOnline] = React.useState(event.isOnline || false);
    const [isPaid, setIsPaid] = React.useState(event.isPaid || false);
    const [priceAmount, setPriceAmount] = React.useState<number>(
        typeof event.priceAmount === 'number' ? event.priceAmount : 0
    );
    const [priceCurrency, setPriceCurrency] = React.useState(
        (event as any).priceCurrency || 'AED'
    );
    const [totalSpots, setTotalSpots] = React.useState<number>(
        typeof (event as any).totalSpots === 'number' ? (event as any).totalSpots : 20
    );
    const [isUnlimitedSpots, setIsUnlimitedSpots] = React.useState(
        (event as any).isUnlimitedSpots || false
    );
    const [maxSpotsPerPerson, setMaxSpotsPerPerson] = React.useState<number>(
        typeof (event as any).maxSpotsPerPerson === 'number' ? (event as any).maxSpotsPerPerson : 1
    );
    const [dateRange, setDateRange] = React.useState(event.rsvpBy || "");
    const [schedule, setSchedule] = React.useState(event.schedule || []);
    const [description, setDescription] = React.useState(
        Array.isArray(event.description) ? event.description.join("\n\n") : event.description || ""
    );
    const [terms, setTerms] = React.useState(
        Array.isArray(event.terms) ? event.terms.join("\n\n") : (event as any).terms || ""
    );
    const [tags, setTags] = React.useState(event.tags || []);
    const [tagInput, setTagInput] = React.useState("");
    const [posterPreview, setPosterPreview] = React.useState(event.heroImage || "");
    const [status, setStatus] = React.useState<'draft' | 'published'>(
        (event as any).status || 'draft'
    );
    const [calendarMonth, setCalendarMonth] = React.useState(() => {
        const initial = event.schedule[0]?.dateLabel ? new Date(event.schedule[0].dateLabel) : new Date();
        return new Date(initial.getFullYear(), initial.getMonth(), 1);
    });
    const [selectedDays, setSelectedDays] = React.useState<number[]>([]);
    const [startTime, setStartTime] = React.useState(() => {
        const [startLabel] = splitTimeRange(event.schedule[0]?.timeRange);
        return labelTo24Hour(startLabel, DEFAULT_START_TIME);
    });
    const [endTime, setEndTime] = React.useState(() => {
        const [, endLabel] = splitTimeRange(event.schedule[0]?.timeRange);
        return labelTo24Hour(endLabel, DEFAULT_END_TIME);
    });
    const [timezone, setTimezone] = React.useState(event.schedule[0]?.timezone ?? "IST");
    const listRef = React.useRef<HTMLDivElement>(null);
    const [scrollThumb, setScrollThumb] = React.useState({ height: 44, offset: 0 });

    const calendarCells = React.useMemo(() => buildCalendarCells(calendarMonth), [calendarMonth]);
    const selectedSet = React.useMemo(() => new Set(selectedDays), [selectedDays]);
    const monthLabel = format(calendarMonth, "MMM, yyyy");
    const timezoneOptions = ["IST", "GST", "UTC", "PST", "EST"];

    const handlePosterChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            if (typeof loadEvent.target?.result === "string") {
                setPosterPreview(loadEvent.target.result);
            }
        };
        reader.readAsDataURL(file);

        // Upload to server in background
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'hero');

            const response = await fetch('/api/upload/whatson-image', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${await getAccessToken()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPosterPreview(data.data.url);
                console.log('Image uploaded successfully:', data.data.url);
            }
        } catch (error) {
            console.error('Failed to upload image:', error);
            // Keep the preview but log the error
        }
    };

    const goToMonth = (delta: number) => {
        setCalendarMonth((prev) => {
            const next = new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
            return next;
        });
    };

    const handleDayToggle = (day: number) => {
        // Check if past date
        const targetDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
        if (targetDate < getToday()) {
            return;
        }

        setSelectedDays((prev) => {
            const next = new Set(prev);
            if (next.has(day)) {
                next.delete(day);
            } else {
                next.add(day);
            }
            return Array.from(next).sort((a, b) => a - b);
        });
    };

    const handleAddSchedule = () => {
        if (!selectedDays.length) return;
        const entries = [...selectedDays]
            .sort((a, b) => a - b)
            .map((day) => {
                const fullDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                return {
                    dateLabel: format(fullDate, "EEE, MMM dd yyyy"),
                    timeRange: `${readableTime(startTime)} - ${readableTime(endTime)}`,
                    timezone,
                };
            });
        setSchedule((prev) => [...prev, ...entries]);
        setSelectedDays([]);
    };

    const handleRemoveSchedule = (index: number) => {
        setSchedule((prev) => prev.filter((_, i) => i !== index));
    };

    const updateScrollThumb = React.useCallback(() => {
        const container = listRef.current;
        if (!container) return;
        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollHeight <= clientHeight || clientHeight === 0) {
            setScrollThumb({ height: clientHeight || 44, offset: 0 });
            return;
        }
        const ratio = clientHeight / scrollHeight;
        const height = Math.max(ratio * clientHeight, 44);
        const maxOffset = clientHeight - height;
        const offset = (scrollTop / (scrollHeight - clientHeight)) * maxOffset;
        setScrollThumb({ height, offset });
    }, []);

    React.useEffect(() => {
        updateScrollThumb();
    }, [schedule, updateScrollThumb]);

    React.useEffect(() => {
        const container = listRef.current;
        if (!container) return;
        container.addEventListener("scroll", updateScrollThumb);
        return () => container.removeEventListener("scroll", updateScrollThumb);
    }, [updateScrollThumb]);

    // Notify parent of changes
    React.useEffect(() => {
        if (onChange) {
            onChange({
                title,
                location: venue,
                isOnline,
                isPaid,
                priceAmount,
                priceCurrency,
                totalSpots,
                isUnlimitedSpots,
                maxSpotsPerPerson,
                rsvpBy: dateRange,
                schedule,
                description,
                terms,
                tags,
                heroImage: posterPreview,
                thumbnail: posterPreview,
                status
            });
        }
    }, [title, venue, isOnline, isPaid, priceAmount, priceCurrency, totalSpots, isUnlimitedSpots, maxSpotsPerPerson, dateRange, schedule, description, terms, tags, posterPreview, status, onChange]);


    const handleAddTag = () => {
        const value = tagInput.trim();
        if (!value || tags.includes(value)) return;
        setTags((prev) => [...prev, value]);
        setTagInput("");
    };

    const handleRemoveTag = (value: string) => {
        setTags((prev) => prev.filter((tag) => tag !== value));
    };

    return (
        <section className="relative mx-auto w-full max-w-[1200px] bg-white sm:p-0 lg:p-0">
            <form className="flex flex-col gap-8" onSubmit={(event) => event.preventDefault()}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Form Column */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        
                        {/* Title */}
                        <div>
                            <Label className="sr-only">Title</Label>
                            <input 
                                value={title} 
                                onChange={(event) => setTitle(event.target.value)} 
                                placeholder="Title"
                                className="w-full rounded-2xl border border-black/20 bg-white px-4 py-3 text-lg font-medium text-black focus:border-[#31A7AC] focus:outline-none placeholder:text-gray-400" 
                            />
                        </div>

                        {/* Checkbox */}
                        <div className="flex items-center gap-2">
                            <Checkbox className="h-5 w-5 border-[#FA6E80] text-[#FA6E80] data-[state=checked]:bg-[#FA6E80] data-[state=checked]:text-white" />
                            <span className="text-sm text-gray-700">Guests can select the dates to attend</span>
                        </div>

                        {/* Venue */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <label className="text-[16px] font-[600] text-[#444444] min-w-[60px]">Venue</label>
                            <div className="flex-1 w-full flex gap-3">
                                <div className="relative flex-1">
                                    <LocationEdit className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
                                    <input 
                                        value={venue} 
                                        onChange={(event) => setVenue(event.target.value)} 
                                        className="w-full rounded-[15px] border border-black/20 bg-white pl-12 pr-4 py-3 text-sm text-black focus:border-[#31A7AC] focus:outline-none" 
                                        placeholder="Start typing..." 
                                    />
                                </div>
                                <Button
                                    type="button"
                                    className={`h-[46px] w-[100px] rounded-[15px] border border-[#444444] text-sm font-[400] transition-colors ${isOnline ? "bg-[#FA596E] text-white border-[#FA596E]" : "bg-white text-black"}`}
                                    onClick={() => setIsOnline(!isOnline)}
                                >
                                    Online
                                </Button>
                            </div>
                        </div>

                        {/* Dates & Spots Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                            
                            {/* Left: Event Date & RSVP */}
                            <div className="flex flex-col gap-4">
                                {/* Event Date Section */}
                                <div className="rounded-[20px] border border-[#444444] p-4 relative min-h-[140px]">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-5 w-5 text-[#FA6E80]" />
                                            <span className="text-[16px] font-[600] text-[#444444]">Event date</span>
                                        </div>
                                        
                                        {/* Add Date Trigger (Using existing Dropdown/Calendar logic) */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button type="button" className="bg-[#31A7AC] hover:bg-[#288a8e] text-white rounded-lg p-1 transition-colors">
                                                    <Plus className="h-5 w-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-full bg-white p-0" align="end">
                                                {/* Existing Calendar UI Logic preserved but wrapped */}
                                                <div className="flex w-full max-w-[310px] flex-col gap-3 rounded-[12px] border border-[#DADADA] bg-white p-3 shadow-lg">
                                                    {/* ... (Same calendar UI as before) ... */}
                                                    <div className="flex flex-row gap-2">
                                                        <TimeField label="Start time" value={startTime} onChange={setStartTime} />
                                                        <TimeField label="End time" value={endTime} onChange={setEndTime} />
                                                    </div>
                                                    <div className="flex flex-row gap-2 items-center justify-between">
                                                        <span className="text-sm font-medium">{monthLabel}</span>
                                                        <div className="flex gap-1">
                                                            <button type="button" onClick={() => goToMonth(-1)} className="p-1"><ChevronLeft className="h-4 w-4" /></button>
                                                            <button type="button" onClick={() => goToMonth(1)} className="p-1"><ChevronRight className="h-4 w-4" /></button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-7 text-center text-xs font-medium text-[#FA596E]">
                                                        {DAY_LABELS.map((label, i) => <span key={i}>{label}</span>)}
                                                    </div>
                                                    <div className="grid grid-cols-7 gap-y-1">
                                                        {calendarCells.map((cell, index) => {
                                                            const isCurrent = cell.type === "current";
                                                            const isSelected = isCurrent && selectedSet.has(cell.day);
                                                            
                                                            // Check if date is in past
                                                            const cellDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), cell.day);
                                                            const isPast = cellDate < getToday();

                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={`${cell.type}-${cell.day}-${index}`}
                                                                    onClick={() => isCurrent && !isPast && handleDayToggle(cell.day)}
                                                                    className={`h-8 w-8 flex items-center justify-center rounded-full text-sm 
                                                                        ${isSelected ? 'bg-[#31A7AC] text-white' : 'text-gray-700 hover:bg-gray-100'} 
                                                                        ${!isCurrent && 'invisible'}
                                                                        ${isPast && isCurrent ? 'text-gray-300 cursor-not-allowed hover:bg-transparent' : ''}
                                                                    `}
                                                                    disabled={!isCurrent || isPast}
                                                                >
                                                                    {cell.day}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    <Button onClick={handleAddSchedule} className="w-full bg-[#31A7AC] hover:bg-[#288a8e] text-white">Add Selected Dates</Button>
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    
                                    {/* Custom Scrollable List */}
                                    <div className="flex gap-2 h-[120px]">
                                        <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto no-scrollbar pr-2">
                                            {schedule.length === 0 ? (
                                                <p className="text-sm text-gray-400 italic">No dates added yet</p>
                                            ) : (
                                                schedule.map((slot, index) => (
                                                    <div key={`slot-${index}`} className="flex items-start gap-2 group">
                                                        <CalendarIcon className="h-4 w-4 text-[#FA6E80] mt-1 shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="text-[14px] font-medium text-[#FA6E80]">{slot.dateLabel}</p>
                                                            <p className="text-[12px] text-gray-500">{slot.timeRange} {slot.timezone}</p>
                                                        </div>
                                                        <button type="button" onClick={() => handleRemoveSchedule(index)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {/* Scroll Indicator */}
                                        <div className="relative h-full w-1.5 rounded-full bg-[#ECECEC]">
                                            <span
                                                className="absolute left-0 right-0 rounded-full bg-[#31A7AC] transition-all duration-150"
                                                style={{ height: `${scrollThumb.height}px`, top: `${scrollThumb.offset}px` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* RSVP By */}
                                <div className="flex items-center gap-3">
                                    <label className="text-[16px] font-[600] text-[#444444] min-w-[70px]">RSVP by</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="flex-1 flex justify-between items-center rounded-[15px] border border-black/20 bg-white px-4 py-3 text-left text-[14px] text-[#FA6E80] focus:outline-none">
                                                {dateRange || "Select date"}
                                                <CalendarIcon className="h-5 w-5 text-[#FA6E80]" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={dateRange ? new Date(dateRange) : undefined}
                                                disabled={(date) => date < getToday()}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        setDateRange(format(date, "EEE, MMM dd yyyy"));
                                                    }
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {/* Right: Spots & Price */}
                            <div className="flex flex-col gap-4">
                                {/* Max Spots */}
                                <div className="flex items-center gap-2 justify-between rounded-[15px] border border-[#828282] bg-[#EFEFEF] px-4 py-2">
                                    <Label className="text-[14px] text-[#444444]">Max Spots per person</Label>
                                    <Input 
                                        type="number" 
                                        min={1} 
                                        value={maxSpotsPerPerson}
                                        onChange={(e) => setMaxSpotsPerPerson(parseInt(e.target.value) || 1)}
                                        className="w-[60px] text-center border border-[#C4C4C4] rounded-[8px] bg-white h-[36px]" 
                                    />
                                </div>

                                {/* Total Spots */}
                                <div className="flex items-center gap-2 justify-between rounded-[15px] border border-[#828282] bg-[#EFEFEF] px-4 py-2">
                                    <Label className="text-[16px] font-[600] text-[#444444]">Spots</Label>
                                    <div className="h-[24px] w-px bg-gray-400" />
                                    <Input
                                        type="number"
                                        min={1}
                                        value={totalSpots}
                                        onChange={(e) => setTotalSpots(parseInt(e.target.value) || 20)}
                                        disabled={isUnlimitedSpots}
                                        className="w-[80px] text-right bg-transparent border-none h-[36px] focus:ring-0 p-0 text-[16px]"
                                        placeholder="00"
                                    />
                                </div>

                                {/* Unlimited Checkbox */}
                                <div className="flex items-center gap-2">
                                    <Checkbox 
                                        className="h-5 w-5 border-[#FA6E80] text-[#FA6E80] data-[state=checked]:bg-[#FA6E80] data-[state=checked]:text-white"
                                        checked={isUnlimitedSpots}
                                        onCheckedChange={(checked) => setIsUnlimitedSpots(checked === true)}
                                    />
                                    <span className="text-[14px] text-[#444444]">Unlimited spots</span>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-2 justify-between rounded-[15px] border border-[#828282] bg-[#EFEFEF] px-4 py-2 mt-2">
                                    <Label className="text-[16px] font-[600] text-[#444444]">{priceCurrency}</Label>
                                    <div className="h-[24px] w-px bg-gray-400" />
                                    <Input
                                        type="number"
                                        min={0}
                                        value={priceAmount}
                                        onChange={(e) => setPriceAmount(parseInt(e.target.value) || 0)}
                                        disabled={!isPaid}
                                        className="w-[80px] text-right bg-transparent border-none h-[36px] focus:ring-0 p-0 text-[16px]"
                                        placeholder="000"
                                    />
                                </div>

                                {/* Free Event Checkbox */}
                                <div className="flex items-center gap-2">
                                    <Checkbox 
                                        className="h-5 w-5 border-[#FA6E80] text-[#FA6E80] data-[state=checked]:bg-[#FA6E80] data-[state=checked]:text-white"
                                        checked={!isPaid}
                                        onCheckedChange={(checked) => setIsPaid(checked !== true)}
                                    />
                                    <span className="text-[14px] text-[#444444]">Free Event</span>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div>
                            <label className="text-[18px] font-[600] text-[#444444] mb-2 block">Details</label>
                            <textarea 
                                value={description} 
                                onChange={(event) => setDescription(event.target.value)} 
                                className="w-full min-h-[180px] rounded-[20px] border border-black/20 bg-white p-4 text-sm text-gray-800 focus:border-[#31A7AC] focus:outline-none resize-none"
                                placeholder="Your What's on details..."
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <h3 className="text-[18px] font-[600] text-[#444444] mb-2">What&apos;s on Tags</h3>
                            <div className="w-full min-h-[80px] rounded-[20px] border border-[#444444] p-3 bg-white">
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {tags.map((tag) => (
                                        <div key={tag} className="flex h-[32px] items-center gap-2 rounded-full bg-[#F8F8F8] px-3 border border-gray-200">
                                            <span className="text-[12px]">{tag}</span>
                                            <button type="button" onClick={() => handleRemoveTag(tag)}>
                                                <X className="h-3 w-3 text-gray-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <input
                                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                                    placeholder="Type tag and press enter"
                                    value={tagInput}
                                    onChange={(event) => setTagInput(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            handleAddTag();
                                        }
                                    }}
                                />
                            </div>
                        </div>

                         {/* Terms */}
                         <div>
                            <label className="text-[18px] font-[600] text-[#444444] mb-2 block">Terms & Conditions <span className="text-[14px] font-normal text-gray-500">(optional)</span></label>
                            <textarea 
                                value={terms} 
                                onChange={(event) => setTerms(event.target.value)} 
                                className="w-full min-h-[140px] rounded-[20px] border border-black/20 bg-white p-4 text-sm text-gray-800 focus:border-[#31A7AC] focus:outline-none resize-none"
                                placeholder="Your T&C"
                            />
                        </div>
                    </div>

                    {/* Right Column: Banner Image */}
                    <div className="lg:col-span-4">
                        <div className="bg-[#656565] rounded-[20px] aspect-[4/3] lg:aspect-[3/4] w-full relative overflow-hidden flex flex-col items-center justify-center text-center p-6">
                            {posterPreview ? (
                                <>
                                    <Image
                                        src={posterPreview}
                                        alt="Banner"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                                         <p className="text-white text-lg font-semibold mb-2">Replace Banner Image</p>
                                         <p className="text-white/80 text-xs mb-4">Optimal dimensions 3000 x 750px</p>
                                         <label className="cursor-pointer bg-[#FA6E80] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#f05b6d] transition-colors">
                                            Replace Image
                                            <input type="file" accept="image/*" className="hidden" onChange={handlePosterChange} />
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-white text-xl font-semibold mb-2">Replace Banner Image</p>
                                    <p className="text-white/80 text-sm mb-6">Optimal dimensions 3000 x 750px</p>
                                    <label className="cursor-pointer bg-[#FA6E80] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#f05b6d] transition-colors">
                                        Add Image
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePosterChange} />
                                    </label>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </form>
        </section>
    );
}
