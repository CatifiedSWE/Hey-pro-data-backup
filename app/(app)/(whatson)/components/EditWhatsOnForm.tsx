"use client";

import Image from "next/image";
import { Calendar as CalendarIcon, LocationEdit, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
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

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const DEFAULT_START_TIME = "21:00";
const DEFAULT_END_TIME = "22:00";

type CalendarCell = {
    day: number;
    type: "prev" | "current" | "next";
};
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
};

export function EditWhatsOnForm({ event }: EditWhatsOnFormProps) {
    const [title, setTitle] = React.useState(event.title);
    const [venue, setVenue] = React.useState(event.location);
    const [isOnline, setIsOnline] = React.useState(event.isOnline);
    const [dateRange, setDateRange] = React.useState(event.rsvpBy);
    const [schedule, setSchedule] = React.useState(event.schedule);
    const [description, setDescription] = React.useState(event.description.join("\n\n"));
    const [terms, setTerms] = React.useState(event.terms.join("\n\n"));
    const [tags, setTags] = React.useState(event.tags);
    const [tagInput, setTagInput] = React.useState("");
    const [posterPreview, setPosterPreview] = React.useState(event.heroImage);
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

    const handlePosterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            if (typeof loadEvent.target?.result === "string") {
                setPosterPreview(loadEvent.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const goToMonth = (delta: number) => {
        setCalendarMonth((prev) => {
            const next = new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
            return next;
        });
    };

    const handleDayToggle = (day: number) => {
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
        <section className="relative mx-auto w-full max-w-[1075px] rounded-[32px] bg-white p-4  sm:p-6 lg:p-8">
            <form className="flex flex-col gap-8" onSubmit={(event) => event.preventDefault()}>
                <div className="flex flex-col-reverse sm:w-[1075px] sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex flex-col gap-4">
                        <div>
                            <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-2xl border border-black/20 bg-black/5 px-4 py-3 text-sm text-black focus:border-[#31A7AC] focus:outline-none" />
                        </div>
                        <div className="flex flex-row gap-2 sm:flex-row sm:items-center">
                            <Checkbox className="h-5 w-5" />
                            <span className="text-sm text-gray-700">Guest Can Select The Dates To Attend</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <label className="text-[20px] font-[600] text-[#444444] sm:text-[600] sm:min-w-[80px]">Venue</label>
                                <div className="flex flex-row gap-3 sm:flex-row sm:items-center sm:flex-1">
                                    <div className="flex items-center gap-2 rounded-2xl border border-black/20 bg-black/5 px-4 py-3 sm:w-full sm:flex-1">
                                        <LocationEdit className="h-4 w-4 flex-shrink-0" />
                                        <input value={venue} onChange={(event) => setVenue(event.target.value)} className="w-full bg-transparent text-sm text-black focus:border-[#31A7AC] focus:outline-none" placeholder="Enter venue" />
                                    </div>
                                    <Button
                                        type="button"
                                        className={`h-[45px] w-[120px] rounded-[15px] border border-[#444444] text-sm font-[400] ${isOnline ? "bg-[#FA596E] text-white" : "bg-transparent text-black"}`}
                                        onClick={() => setIsOnline(!isOnline)}
                                    >
                                        Online
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full flex-col gap-4">
                            <div className="flex flex-col gap-4 rounded-lg lg:flex-row">

                                <div className="flex flex-col w-[353px] text-[14px] sm:w-[454px]">
                                    <div className="flex-1 rounded-[15px]  border border-[#828282] p-4">
                                        <div className="flex items-center  justify-between border-b border-[#666666]/60 pb-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <div className="flex items-center gap-2 text-[#444444]">
                                                        <CalendarIcon className="h-6 w-6 text-[#FA6E80]" />
                                                        <span className="text-[20px] font-semibold">Event date</span>
                                                    </div>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-full bg-white" align="start">
                                                    <div className="flex w-full max-w-[310px] flex-col gap-3 rounded-[12px] border border-[#DADADA] bg-[rgba(233,233,233,0.18)] p-3 backdrop-blur-[7.3px]">
                                                        <div className="flex flex-row gap-2">
                                                            <TimeField label="Start time" value={startTime} onChange={setStartTime} />
                                                            <TimeField label="End time" value={endTime} onChange={setEndTime} />
                                                        </div>
                                                        <div className="flex flex-row gap-2">

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="outline" className="rounded-[7px] shadow border-none h-[39.7px] text-[16px] w-[145px]"><CalendarIcon className="h-8 w-8" /> {monthLabel}</Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent className="w-56" align="start">
                                                                    <div className="flex w-full max-w-[200px] items-center justify-between rounded-[7px] bg-white px-[7px] py-[6px] text-[#FA596E] shadow-sm">
                                                                        <button type="button" onClick={() => goToMonth(-1)} className="rounded-full bg-[#FA596E]/10 p-1 text-[#FA596E]">
                                                                            <ChevronLeft className="h-4 w-4" />
                                                                        </button>
                                                                        <span className="text-[16.94px] font-[400]">{monthLabel}</span>
                                                                        <button type="button" onClick={() => goToMonth(1)} className="rounded-full bg-[#FA596E]/10 p-1 text-[#FA596E]">
                                                                            <ChevronRight className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>


                                                            <div className="flex  w-full max-w-[145px] items-center justify-center rounded-[7px] bg-white px-[7px] py-[6px] text-[#FA596E] shadow-sm">
                                                                <select
                                                                    value={timezone}
                                                                    onChange={(event) => setTimezone(event.target.value)}
                                                                    className="w-full bg-transparent text-center text-[16.94px] font-normal text-[#FA596E] focus:outline-none"
                                                                >
                                                                    {timezoneOptions.map((zone) => (
                                                                        <option key={zone} value={zone}>
                                                                            {zone}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="rounded-[12px] border border-white/60 bg-white/90 p-[7px] shadow-sm">
                                                            <div className="grid grid-cols-7 text-center text-[18.33px] font-medium text-[#FA596E]">
                                                                {DAY_LABELS.map((label) => (
                                                                    <span key={label}>{label}</span>
                                                                ))}
                                                            </div>
                                                            <div className="mt-2 grid grid-cols-7 gap-y-1">
                                                                {calendarCells.map((cell, index) => {
                                                                    const isCurrent = cell.type === "current";
                                                                    const isSelected = isCurrent && selectedSet.has(cell.day);
                                                                    const hasPrev = selectedSet.has(cell.day - 1);
                                                                    const hasNext = selectedSet.has(cell.day + 1);

                                                                    let shape = "rounded-full";
                                                                    if (isSelected) {
                                                                        if (hasPrev && hasNext) shape = "rounded-none";
                                                                        else if (!hasPrev && hasNext) shape = "rounded-l-full";
                                                                        else if (hasPrev && !hasNext) shape = "rounded-r-full";
                                                                    }

                                                                    const baseClasses = [
                                                                        "flex h-[31px] w-[40.74px] items-center justify-center text-[18.33px] font-medium transition",
                                                                        isCurrent ? "text-[#31A7AC]" : "text-[#31A7AC]/30",
                                                                        shape,
                                                                        isCurrent ? "cursor-pointer" : "",
                                                                        isSelected ? "bg-[#31A7AC] text-white" : "hover:bg-[#31A7AC]/10",
                                                                    ]
                                                                        .filter(Boolean)
                                                                        .join(" ");

                                                                    return (
                                                                        <button
                                                                            type="button"
                                                                            key={`${cell.type}-${cell.day}-${index}`}
                                                                            onClick={() => isCurrent && handleDayToggle(cell.day)}
                                                                            className={baseClasses}
                                                                            disabled={!isCurrent}
                                                                        >
                                                                            {cell.day}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                            <p className="mt-3 text-xs font-semibold text-[#31A7AC]">
                                                                Selected {selectedDays.length} day{selectedDays.length === 1 ? "" : "s"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <button
                                                type="button"
                                                onClick={handleAddSchedule}
                                                disabled={!selectedDays.length}
                                                className={`rounded-[10px] border-2 border-[#31A7AC]  p-1 transition ${selectedDays.length ? "bg-[#31A7AC] text-white" : "bg-transparent text-[#31A7AC]/50"}`}
                                                aria-disabled={!selectedDays.length}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="mt-3 flex gap-4 w-full ">
                                            <div ref={listRef} className="flex-1 max-h-[188px] space-y-3 overflow-y-auto no-scrollbar pr-2">
                                                {schedule.length === 0 ? (
                                                    <p className="text-sm text-gray-500">No schedule added yet. Select dates on the calendar to begin.</p>
                                                ) : (
                                                    schedule.map((slot, index) => (
                                                        <div key={`slot-${slot.dateLabel}-${index}`} className="flex items-center justify-between gap-3">
                                                            <p className="sm:text-[18px] text-[13px] text-black">
                                                                {slot.dateLabel || "Select date"} · {slot.timeRange || `${readableTime(startTime)} - ${readableTime(endTime)}`} {slot.timezone || timezone}
                                                            </p>
                                                            <button type="button" onClick={() => handleRemoveSchedule(index)} aria-label="Remove schedule" className="text-[#FA6E80]">
                                                                <X className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            <div className="relative h-[188px] w-2 rounded-full bg-[#ECECEC]">
                                                <span
                                                    className="absolute left-0 right-0 rounded-full bg-[#31A7AC]"
                                                    style={{ height: `${scrollThumb.height}px`, top: `${scrollThumb.offset}px` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                    </div>

                                    <label className="text-sm font-medium text-gray-500">RSVP by</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button className="mt-2 w-full flex justify-between items-center rounded-[7px] border border-black/20 bg-black/5 px-4 py-3 text-left text-[16px] text-[#FA596E]  focus:outline-none">
                                                {dateRange || "Select date"}
                                                <CalendarIcon className="h-7 w-7" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent align="start" className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={dateRange ? new Date(dateRange) : undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        setDateRange(format(date, "EEE, MMM dd yyyy"));
                                                    }
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="mt-2 flex w-full  sm:w-[188px] flex-col gap-4 rounded-lg lg:mt-6">
                                    <div className="flex items-center gap-2  px-3 py-2">
                                        <Label className="text-sm font-medium text-[#444444]">Max Spots Per Person</Label>
                                        <Input type="number" min={1} defaultValue={1} disabled className="sm:max-w-[120px] w-[251px] h-[47px] border sm:text-center border-[#828282] rounded-[15px] bg-[#E8E8E8]" />
                                    </div>
                                    <div>
                                        <div className="mb-2 flex items-center gap-2 h-[50px] font-[20px] rounded-2xl border border-gray-300 px-4">
                                            <Label className="text-[20px] font-[600] text-[#444444">Spots</Label>
                                            <div className="bg-[#444444] w-px h-[40px] border" />
                                            <Input
                                                type="number"
                                                min={1}
                                                defaultValue={20}
                                                className="w-full border-none bg-transparent px-4 shadow-none py-3 text-sm text-black focus:border-[#31A7AC] focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox className="h-5 w-5" />
                                            <span className="text-[18px] font-[400] text-gray-700">Unlimited spots</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="mb-2 flex items-center gap-2 h-[50px] font-[20px] rounded-2xl border border-gray-300 px-4">
                                            <Label className="text-[20px] font-[600] text-gray-500">ADE</Label>
                                            <div className="bg-[#444444] w-px h-[40px] border" />
                                            <Input
                                                type="number"
                                                min={1}
                                                defaultValue={20}
                                                className="w-full border-none bg-transparent px-4 py-3 text-sm text-black focus:border-[#31A7AC] focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox className="h-5 w-5" />
                                            <span className="text-[18px] font-[400] text-gray-700">Free Event</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div className="flex flex-col gap-4 w-full max-w-[376px] sm:w-[376px] items-center justify-center sm:justify-end mx-auto">
                        <div className="w-full p-2">
                            <div className="relative w-full aspect-[376/460] rounded-[15.45px] overflow-hidden">
                                <input
                                    id="poster-upload"
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    className="hidden"
                                    onClick={(e) => (e.currentTarget.value = "")}
                                    onChange={handlePosterChange}
                                />

                                {posterPreview ? (
                                    <div className="group relative flex h-full w-full items-center justify-center">
                                        <Image
                                            src={posterPreview}
                                            alt={event.title}
                                            fill
                                            sizes="(min-width: 1024px) 376px, 100vw"
                                            className="object-cover rounded-[15.45px] \ opacity-100"
                                            style={{ transform: "rotate(0deg)" }}
                                        />
                                        <div className="absolute inset-0 opacity-0 transition-opacity duration-200 bg-[#656565]/40 ease-out group-hover:opacity-100 rounded-[15.45px]">
                                            {/* <div className="absolute inset-0 bg-black/50" /> */}
                                            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center text-white">
                                                <p className="text-2xl font-semibold">Replace Banner Image</p>
                                                <p className="text-sm opacity-90">Optimal dimensions 3000 x 750px</p>
                                                <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
                                                    <label
                                                        htmlFor="poster-upload"
                                                        className="cursor-pointer rounded-full bg-[#FF6F8F] px-6 py-2 text-sm font-semibold text-white shadow"
                                                    >
                                                        Replace Image
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPosterPreview("")}
                                                        className="rounded-full bg-gray-600/10 px-6 py-2 text-sm font-semibold text-white"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor="poster-upload"
                                        className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 bg-[#656565] text-center px-4 rounded-[15.45px]"
                                    >
                                        <p className="text-2xl font-semibold text-gray-100">Replace Banner Image</p>
                                        <p className="text-sm text-gray-100">Optimal dimensions 3000 x 750px</p>
                                        <span className="mt-2 rounded-full bg-[#FF6F8F] px-6 py-2 text-sm font-semibold text-white">
                                            Add Image
                                        </span>
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-[20px] font-[600] text-gray-600">Details</label>
                    <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-[180px] w-full rounded-[28px] border border-black/20 bg-black/5 p-4 text-sm text-gray-800 focus:border-[#31A7AC] focus:outline-none" />
                </div>

                <div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[20px] font-[600]">What&apos;s on Tags</h3>

                        </div>
                        <div className="w-full min-h-[94px] rounded-[15px] border border-[#444444] p-3">
                            <div className="flex flex-wrap content-start gap-3">
                                {tags.length === 0 && <span className="text-xs text-gray-500">No tags yet. Add one below.</span>}
                                {tags.map((tag) => (
                                    <div key={tag} className="flex h-[32px] items-center gap-2 rounded-full border border-transparent bg-[#F8F8F8] px-4 hover:border-[#444444]">
                                        <span className="text-[12px] capitalize">{tag}</span>
                                        <button type="button" onClick={() => handleRemoveTag(tag)} aria-label={`Remove ${tag}`}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <input
                                    className="h-[38px] min-w-[120px] flex-1 rounded-full bg-[#F8F8F8] px-4 text-[12px] outline-none"
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
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="rounded-full border border-[#31A7AC] px-4 py-1 text-xs font-semibold text-[#31A7AC]"
                                >
                                    + Add
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                <div>
                    <label className="text-sm font-semibold text-gray-600">Terms & Conditions (optional)</label>
                    <textarea value={terms} onChange={(event) => setTerms(event.target.value)} className="mt-2 min-h-[140px] w-full rounded-[28px] border border-black/20 bg-black/5 p-4 text-sm text-gray-800 focus:border-[#31A7AC] focus:outline-none" />
                </div>
            </form>
        </section>
    );
}
