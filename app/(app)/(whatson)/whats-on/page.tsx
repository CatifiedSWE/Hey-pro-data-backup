"use client";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Filter, MapPin, Search } from "lucide-react";
import Link from "next/link";
import React, { JSX } from "react";
import { format } from "date-fns";
// import WhatsOnMainContent from "../components/main-content";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EventListingPage from "../components/main-content";
const initialFilterState = {
    price: "free",
    relevance: true,
    eventType: "",
    eventStatus: "",
    location: "UAE, Dubai",
    attendance: "online",
    highlightedSingles: [1, 2, 4, 17],
    highlightedRange: [13, 14, 15, 16],
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

type CalendarCell = { day: number; type: "prev" | "current" | "next" };

const buildCalendarCells = (activeMonth: Date): CalendarCell[] => {
    const year = activeMonth.getFullYear();
    const month = activeMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const shift = (firstDay.getDay() + 6) % 7;
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

export default function WhatsOnHeader() {
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const [filterForm, setFilterForm] = React.useState<typeof initialFilterState>(initialFilterState);

    const handleFilterChange = (field: keyof typeof initialFilterState, value: string | number | boolean | number[]) => {
        setFilterForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFilterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Applied filters:", filterForm);
    };

    const [calendarMonth, setCalendarMonth] = React.useState(() => new Date(2025, 8, 1));
    const calendarCells = React.useMemo(() => buildCalendarCells(calendarMonth), [calendarMonth]);
    const monthLabel = format(calendarMonth, "MMM, yyyy");

    const singleSet = React.useMemo(() => new Set(filterForm.highlightedSingles), [filterForm.highlightedSingles]);
    const highlightedSet = React.useMemo(() => {
        const set = new Set<number>();
        filterForm.highlightedSingles.forEach((day) => set.add(day));
        filterForm.highlightedRange.forEach((day) => set.add(day));
        return set;
    }, [filterForm.highlightedRange, filterForm.highlightedSingles]);

    const gradientDivider = <div className="h-[2px] w-full rounded-full bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]" />;

    const getHighlightClasses = (day: number | null) => {
        if (!day || !highlightedSet.has(day)) return "";

        const baseColor = "bg-[#1AA0A2] text-white";
        const hasPrev = highlightedSet.has(day - 1);
        const hasNext = highlightedSet.has(day + 1);

        if (!hasPrev && !hasNext) return `${baseColor} rounded-full`;
        if (!hasPrev && hasNext) return `${baseColor} rounded-l-full pl-4`;
        if (hasPrev && !hasNext) return `${baseColor} rounded-r-full pr-4`;
        return `${baseColor} rounded-none`;
    };

    const toggleSingleDay = (day: number) => {
        handleFilterChange(
            "highlightedSingles",
            singleSet.has(day)
                ? filterForm.highlightedSingles.filter((d) => d !== day)
                : [...filterForm.highlightedSingles, day]
        );
    };

    const resetForm = () => setFilterForm(initialFilterState);

    const goToMonth = (delta: number) => {
        setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };
    return (
        <>
            <div className=" w-full overflow-x-hidden overflow-hidden">
                <div className="flex flex-row mx-auto px-1 gap-2 sm:gap-0 sm:items-center sm:justify-between justify-center">
                    <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-[26px] font-semibold">{"What's On"}</span>
                    <Link href="/whats-on/manage-whats-on" className="ml-2 text-white bg-[#31A7AC] border rounded-[10px] sm:w-auto w-[192px] px-4 py-2 "> <span className="text-[16px] font-[400]">Manage What’s On</span></Link>
                </div>

                <div className="flex flex-row mx-auto  justify-center w-full items-center gap-0.5 space-x-4 mt-4 sm:w-full">
                    <div
                        className={`sm:flex items-center hidden justify-center space-x-2 h-[48px] w-[111px] border rounded-full px-4 py-2 cursor-pointer transition-all ${isFilterOpen ? 'w-[300px] bg-[#FA6E80]' : 'w-[150px] bg-[#f7f7f700] border-[#FA6E80] '}`}
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        <button className={`text-sm font-medium ${isFilterOpen ? 'text-white' : 'text-[#FA6E80]'}`}>Filter (<span>{"3"}</span>)</button>
                        <Filter className={`h-5 w-5 ${isFilterOpen ? 'text-white' : 'text-[#FA6E80]'}`} />
                    </div>
                    <div className="flex flex-row border rounded-full px-1 py-2 justify-between items-center h-[48px] w-[240px] sm:w-[960px]">
                        <input
                            placeholder="Search by name, role, or department..."
                            className=" px-2 border-none outline-none focus:ring-0 text-sm bg-transparent"
                            onChange={(e) => console.log(e.target.value)}
                        />
                        <span className="relative flex items-center justify-center border rounded-full h-[34px] w-[34px] bg-[#FA6E80]">
                            <Search className="h-5 w-5 text-white" />
                        </span>
                    </div>
                    <MobileFilter
                        filterForm={filterForm}
                        calendarCells={calendarCells}
                        monthLabel={monthLabel}
                        goToMonth={goToMonth}
                        gradientDivider={gradientDivider}
                        getHighlightClasses={getHighlightClasses}
                        toggleSingleDay={toggleSingleDay}
                        isFilterOpen={isFilterOpen}
                        handleFilterChange={handleFilterChange}
                        handleFilterSubmit={handleFilterSubmit}
                        resetForm={resetForm}
                    />


                </div>
                <div className=" flex flex-row mx-auto justify-center ">
                    {isFilterOpen && (
                        <div className="hidden w-full max-w-[280px] overflow-y-auto p-4 space-y-2 sm:block">
                            <form onSubmit={handleFilterSubmit} className="space-y-5 rounded-[10px] border bg-white p-4 text-[#017A7C] shadow-sm">
                                <div className="space-y-2">
                                    <div className="flex gap-3">
                                        {["free", "paid"].map((price) => (
                                            <button
                                                key={price}
                                                type="button"
                                                onClick={() => handleFilterChange("price", price)}
                                                className={`flex-1 rounded-[10px]  border px-4 py-2 text-sm font-semibold ${filterForm.price === price ? "border-[#FA6E80] text-[#FA6E80] bg-[#FFE5EA]" : "border-[#FA6E80]/40 text-gray-500"}`}
                                            >
                                                {price === "free" ? "Free" : "Paid"}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleFilterChange("relevance", !filterForm.relevance)}
                                        className={`w-full rounded-[10px] border px-4 py-2 text-left text-sm font-semibold ${filterForm.relevance ? "border-[#FA6E80] text-[#FA6E80]" : "border-[#FA6E80]/40 text-gray-500"}`}
                                    >
                                        Relevant to you <span className="text-xs font-normal text-gray-500">(beta)</span>
                                    </button>
                                    <div className="relative">
                                        <select
                                            value={filterForm.eventType}
                                            onChange={(e) => handleFilterChange("eventType", e.target.value)}
                                            className="w-full appearance-none rounded-[10px] border border-[#FA6E80] text-[#FA6E80] px-4 py-2 text-sm focus:outline-none focus:ring-2 "
                                        >
                                            <option value="">Select Event Type</option>
                                            <option value="screening">Screening</option>
                                            <option value="festival">Festival</option>
                                            <option value="masterclass">Masterclass</option>
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FA6E80]" />
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={filterForm.eventStatus}
                                            onChange={(e) => handleFilterChange("eventStatus", e.target.value)}
                                            className="w-full appearance-none rounded-[10px] border border-[#FA596E] text-[#FA596E]  px-4 py-2 text-sm focus:outline-none focus:ring-2 "
                                        >
                                            <option value="">Select Status</option>
                                            <option value="upcoming">Upcoming</option>
                                            <option value="ongoing">Ongoing</option>
                                            <option value="ended">Past</option>
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FA6E80]" />
                                    </div>
                                </div>
                                {gradientDivider}
                                <div className="space-y-3">
                                    <div className="flex items-center text-[#FA6E80] border border-[#FA596E] rounded-[10px] h-[29px] px-3 justify-between text-sm font-semibold">
                                        <span>{monthLabel}</span>
                                        <Calendar className="h-4 w-4 text-[#FA6E80]" />
                                    </div>
                                    <div className="flex w-full max-w-[310px] min-w-[217px] flex-col gap-4 rounded-[18px]  bg-white/80 ">
                                        <div className="flex items-center justify-between rounded-[10px] bg-white px-2 py-2 text-[#FA596E] ">
                                            <button type="button" onClick={() => goToMonth(-1)} className="rounded-full bg-[#FA596E]/10 p-1 text-[#FA596E]">
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            <span className="text-base font-medium tracking-tight text-[#0F3B3F]">{monthLabel}</span>
                                            <button type="button" onClick={() => goToMonth(1)} className="rounded-full bg-[#FA596E]/10 p-1 text-[#FA596E]">
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="rounded-[16px] ">
                                            <div className="grid grid-cols-7 text-center text-sm font-semibold uppercase tracking-[0.08em] text-[#F96E83]">
                                                {DAY_LABELS.map((label) => (
                                                    <span key={label}>{label}</span>
                                                ))}
                                            </div>
                                            <div className="mt-3 grid grid-cols-7 gap-x-0 gap-y-2">
                                                {calendarCells.map((cell, index) => {
                                                    const isCurrent = cell.type === "current";
                                                    const highlight = getHighlightClasses(isCurrent ? cell.day : null);
                                                    const baseClasses = [
                                                        "flex h-10 w-full items-center justify-center text-[13px] font-[400] transition duration-150",
                                                        isCurrent ? "text-[#00939C]" : "text-[#BBD4D8]",
                                                        isCurrent ? highlight || "rounded-full hover:bg-[#DFF3F4]" : "opacity-60",
                                                        "disabled:cursor-not-allowed",
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" ");

                                                    return (
                                                        <button
                                                            type="button"
                                                            key={`${cell.type}-${cell.day}-${index}`}
                                                            onClick={() => isCurrent && toggleSingleDay(cell.day)}
                                                            className={baseClasses}
                                                            disabled={!isCurrent}
                                                        >
                                                            {cell.day}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#31A7AC]">
                                                Selected {singleSet.size} day{singleSet.size === 1 ? "" : "s"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {gradientDivider}

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Location</label>
                                    <div className="flex items-center gap-2 rounded-2xl border border-[#017A7C]/30 px-4 py-2">
                                        <input
                                            value={filterForm.location}
                                            onChange={(e) => handleFilterChange("location", e.target.value)}
                                            className="w-full border-none text-sm outline-none"
                                        />
                                        <MapPin className="h-4 w-4 text-[#31A7AC]" />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {["online", "in-person"].map((mode) => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => handleFilterChange("attendance", mode)}
                                            className={`flex-1 rounded-[10px] border px-4 py-2 text-sm font-semibold ${filterForm.attendance === mode ? "border-[#FA6E80] text-[#FA6E80] bg-[#FFE5EA]" : "border-[#FA6E80]/40 text-gray-500"}`}
                                        >
                                            {mode === "online" ? "Online" : "In-person"}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="submit"
                                        className="flex-1 rounded-[10px] bg-[#31A7AC] py-2 text-sm font-semibold text-white hover:bg-[#279497]"
                                    >
                                        Apply Filters
                                    </button>
                                    <button
                                        type="button"
                                        className="flex-1 rounded-[10px] border border-[#31A7AC] py-2 text-sm font-semibold text-[#31A7AC]"
                                        onClick={resetForm}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    <EventListingPage isFilterOpen={isFilterOpen} />

                </div>

            </div>
        </>
    )
}

function MobileFilter({
    isFilterOpen,
    filterForm,
    handleFilterChange,
    handleFilterSubmit,
    calendarCells,
    monthLabel,
    goToMonth,
    gradientDivider,
    getHighlightClasses,
    toggleSingleDay,
    resetForm,
}: {
    isFilterOpen: boolean;
    filterForm: typeof initialFilterState;
    handleFilterChange: (field: keyof typeof initialFilterState, value: string | number | boolean | number[]) => void;
    handleFilterSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    calendarCells: CalendarCell[];
    monthLabel: string;
    goToMonth: (delta: number) => void;
    gradientDivider: JSX.Element;
    getHighlightClasses: (day: number | null) => string;
    toggleSingleDay: (day: number) => void;
    resetForm: () => void;
}) {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div
                        className={`flex items-center sm:hidden  justify-center space-x-1 h-[48px] w-[111px] border rounded-full px-4 py-2 cursor-pointer transition-all  bg-[#ffffff]`}
                    >
                        <button className={`text-[10px] font-medium ${isFilterOpen ? 'text-white' : 'text-[#FA6E80]'}`}>Filter (<span>{"3"}</span>)</button>
                        <Filter className={`h-5 w-5 ${isFilterOpen ? 'text-white' : 'text-[#FA6E80]'}`} />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[273px] border-none" align="start">
                    <div className="h-screen max-w-[280px] w-full overflow-y-auto p-4 space-y-2">
                        <form onSubmit={handleFilterSubmit} className="space-y-5 rounded-[10px] border bg-white p-4 text-[#017A7C] shadow-sm">
                            <div className="flex gap-3">
                                {["free", "paid"].map((price) => (
                                    <button
                                        key={price}
                                        type="button"
                                        onClick={() => handleFilterChange("price", price)}
                                        className={`flex-1 rounded-[10px] border px-4 py-2 text-sm font-semibold ${filterForm.price === price ? "border-[#FA6E80] text-[#FA6E80] bg-[#FFE5EA]" : "border-[#FA6E80]/40 text-gray-500"}`}
                                    >
                                        {price === "free" ? "Free" : "Paid"}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => handleFilterChange("relevance", !filterForm.relevance)}
                                className={`w-full rounded-[10px] border px-4 py-2 text-left text-sm font-semibold ${filterForm.relevance ? "border-[#FA6E80] text-[#FA6E80]" : "border-[#FA6E80]/40 text-gray-500"}`}
                            >
                                Relevant to you <span className="text-xs font-normal text-[#FA6E80]">(beta)</span>
                            </button>

                            <div className="space-y-2">
                                <div className="relative">
                                    <select
                                        value={filterForm.eventType}
                                        onChange={(e) => handleFilterChange("eventType", e.target.value)}
                                        className="w-full appearance-none rounded-[10px] border text-[#FA6E80] border-[#FA6E80] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#31A7AC]"
                                    >
                                        <option value="">Select Event Type</option>
                                        <option value="screening">Screening</option>
                                        <option value="festival">Festival</option>
                                        <option value="masterclass">Masterclass</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FA6E80]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <select
                                        value={filterForm.eventStatus}
                                        onChange={(e) => handleFilterChange("eventStatus", e.target.value)}
                                        className="w-full appearance-none rounded-[10px] border border-[#FA6E80] text-[#FA6E80]  px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#31A7AC]"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="ongoing">Ongoing</option>
                                        <option value="ended">Past</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#FA6E80]" />
                                </div>
                            </div>

                            {gradientDivider}
                            <div className="space-y-3">
                                <div className="flex items-center text-[#FA6E80] border border-[#FA596E] rounded-[10px] h-[29px] px-3 justify-between text-sm font-semibold">
                                    <span>{monthLabel}</span>
                                    <Calendar className="h-4 w-4 text-[#FA6E80]" />
                                </div>
                                <div className="flex w-full max-w-[310px] min-w-[217px] flex-col gap-4 rounded-[18px]  bg-white/80 ">
                                    <div className="flex items-center justify-between rounded-[10px] bg-white px-2 py-2 text-[#FA596E] ">
                                        <button type="button" onClick={() => goToMonth(-1)} className="rounded-full bg-[#FA596E]/10 p-1 text-[#FA596E]">
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <span className="text-base font-medium tracking-tight text-[#0F3B3F]">{monthLabel}</span>
                                        <button type="button" onClick={() => goToMonth(1)} className="rounded-full bg-[#FA596E]/10 p-1 text-[#FA596E]">
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="rounded-[16px] ">
                                        <div className="grid grid-cols-7 text-center text-sm font-semibold uppercase tracking-[0.08em] text-[#F96E83]">
                                            {DAY_LABELS.map((label) => (
                                                <span key={label}>{label}</span>
                                            ))}
                                        </div>
                                        <div className="mt-3 grid grid-cols-7 gap-x-0 gap-y-2">
                                            {calendarCells.map((cell, index) => {
                                                const isCurrent = cell.type === "current";
                                                const highlight = getHighlightClasses(isCurrent ? cell.day : null);
                                                const baseClasses = [
                                                    "flex h-10 w-full items-center justify-center text-[13px] font-[400] transition duration-150",
                                                    isCurrent ? "text-[#00939C]" : "text-[#BBD4D8]",
                                                    isCurrent ? highlight || "rounded-full hover:bg-[#DFF3F4]" : "opacity-60",
                                                    "disabled:cursor-not-allowed",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ");

                                                return (
                                                    <button
                                                        type="button"
                                                        key={`${cell.type}-${cell.day}-${index}`}
                                                        onClick={() => isCurrent && toggleSingleDay(cell.day)}
                                                        className={baseClasses}
                                                        disabled={!isCurrent}
                                                    >
                                                        {cell.day}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {gradientDivider}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Location</label>
                                <div className="flex items-center gap-2 rounded-2xl border border-[#017A7C]/30 px-4 py-2">
                                    <input
                                        value={filterForm.location}
                                        onChange={(e) => handleFilterChange("location", e.target.value)}
                                        className="w-full border-none text-sm outline-none"
                                    />
                                    <MapPin className="h-4 w-4 text-[#31A7AC]" />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {["online", "in-person"].map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        onClick={() => handleFilterChange("attendance", mode)}
                                        className={`flex-1 rounded-[10px] border px-4 py-2 text-sm font-semibold ${filterForm.attendance === mode ? "border-[#FA6E80] text-[#FA6E80] bg-[#FFE5EA]" : "border-[#FA6E80]/40 text-gray-500"}`}
                                    >
                                        {mode === "online" ? "Online" : "In-person"}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="submit"
                                    className="flex-1 rounded-[10px] bg-[#31A7AC] py-2 text-sm font-semibold text-white hover:bg-[#279497]"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    type="button"
                                    className="flex-1 rounded-[10px] border border-[#31A7AC] py-2 text-sm font-semibold text-[#31A7AC]"
                                    onClick={resetForm}
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}