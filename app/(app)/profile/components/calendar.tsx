"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProfile } from "@/contexts/ProfileContext"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { addDays, endOfMonth, endOfWeek, format, getDate, isSameMonth, startOfMonth, startOfWeek, subMonths, addMonths } from "date-fns"
import { toast } from "sonner"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]
const WEEK_START_OPTIONS = { weekStartsOn: 1 as const }

type AvailabilityStatus = 'available' | 'hold' | 'na'

const buildMonthMatrix = (year: number, month: number) => {
    const firstDay = startOfMonth(new Date(year, month, 1))
    const gridStart = startOfWeek(firstDay, WEEK_START_OPTIONS)
    const gridEnd = endOfWeek(endOfMonth(firstDay), WEEK_START_OPTIONS)

    const days: Date[] = []
    let cursor = gridStart
    while (cursor <= gridEnd) {
        days.push(cursor)
        cursor = addDays(cursor, 1)
    }

    const rows: Date[][] = []
    for (let index = 0; index < days.length; index += 7) {
        rows.push(days.slice(index, index + 7))
    }
    return rows
}

type CalendarDialogProps = {
    triggerClassName?: string
    triggerLabel?: React.ReactNode
}

export function CalendarDialog({ triggerClassName, triggerLabel }: CalendarDialogProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedStatus, setSelectedStatus] = useState<AvailabilityStatus>('available')
    const [isUpdating, setIsUpdating] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    
    // Use availability from ProfileContext
    const { availability: contextAvailability, fetchAvailability, updateAvailability: contextUpdateAvailability } = useProfile();
    
    // Track if we've fetched for current month to prevent duplicate calls
    const fetchedMonthRef = useRef<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    const monthStr = format(new Date(currentYear, currentMonth, 1), 'yyyy-MM');

    // Convert array to map for easier lookup
    const availabilityData = new Map(
        contextAvailability.map(item => [item.availability_date, item])
    );

    useEffect(() => {
        // Only fetch if dialog is open and we haven't fetched this month yet
        if (isOpen && fetchedMonthRef.current !== monthStr) {
            fetchedMonthRef.current = monthStr;
            setIsLoading(true);
            fetchAvailability(monthStr).finally(() => setIsLoading(false));
        }
    }, [currentYear, currentMonth, isOpen, monthStr, fetchAvailability])

    const handleDateClick = async (date: Date) => {
        if (!isSameMonth(date, new Date(currentYear, currentMonth, 1))) {
            return // Don't allow clicking dates outside current month
        }

        const dateStr = format(date, 'yyyy-MM-dd')
        
        setIsUpdating(true)
        try {
            const result = await contextUpdateAvailability(dateStr, selectedStatus);
            
            if (result.success) {
                toast.success(`Date marked as ${selectedStatus}`)
            } else {
                toast.error(result.message || 'Failed to update availability')
            }
        } catch (error) {
            console.error('Error updating availability:', error)
            toast.error('Failed to update availability')
        } finally {
            setIsUpdating(false)
        }
    }

    const goToPreviousMonth = () => {
        setCurrentDate(prev => subMonths(prev, 1))
    }

    const goToNextMonth = () => {
        setCurrentDate(prev => addMonths(prev, 1))
    }

    const monthDate = new Date(currentYear, currentMonth, 1)
    const matrix = buildMonthMatrix(currentYear, currentMonth)

    const getStatusColor = (status: AvailabilityStatus) => {
        switch (status) {
            case 'available':
                return 'bg-[#1F9BA7]'
            case 'hold':
                return 'bg-[#FFA500]'
            case 'na':
                return 'bg-[#FF6B6B]'
            default:
                return 'bg-[#1F9BA7]'
        }
    }

    const getStatusTextColor = (status: AvailabilityStatus) => {
        switch (status) {
            case 'available':
                return 'text-white'
            case 'hold':
                return 'text-white'
            case 'na':
                return 'text-white'
            default:
                return 'text-white'
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className={cn("border-none text-[#31A7AC]", triggerClassName)}>
                    {triggerLabel ?? (
                        <>
                            <span>View in Calendar</span>
                            <Calendar className="ml-2 h-5 w-5" color="#31A7AC" />
                        </>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] rounded-[24px] border-none px-0 pb-6 pt-4">
                <DialogHeader className="px-6">
                    <DialogTitle className="text-left text-base font-semibold text-[#FA6E80]">Availability calendar</DialogTitle>
                </DialogHeader>
                
                {/* Status Selector */}
                <div className="px-6">
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Select status to mark dates:
                        </label>
                        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as AvailabilityStatus)}>
                            <SelectTrigger className="w-full rounded-lg">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="available">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#1F9BA7]"></div>
                                        Available
                                    </div>
                                </SelectItem>
                                <SelectItem value="hold">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#FFA500]"></div>
                                        Hold
                                    </div>
                                </SelectItem>
                                <SelectItem value="na">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#FF6B6B]"></div>
                                        Not Available
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-1">
                            Click on dates to mark them with the selected status
                        </p>
                    </div>
                </div>

                <div className="mt-2 px-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-[#31A7AC]" />
                        </div>
                    ) : (
                        <div className="rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(15,139,141,0.12)]">
                            {/* Month Navigation */}
                            <div className="mb-4 flex items-center justify-between text-base font-semibold text-[#FA6E80]">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={goToPreviousMonth}
                                    className="h-8 w-8"
                                    disabled={isUpdating}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <span>{format(monthDate, "MMM, yyyy")}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={goToNextMonth}
                                    className="h-8 w-8"
                                    disabled={isUpdating}
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </div>
                            
                            {/* Weekday Labels */}
                            <div className="grid grid-cols-7 gap-[8px] text-center text-[11px] font-semibold uppercase tracking-wide text-[#FA6E80]">
                                {WEEKDAY_LABELS.map((label, idx) => (
                                    <span key={`label-${idx}`}>{label}</span>
                                ))}
                            </div>
                            
                            {/* Calendar Grid */}
                            <div className="mt-4 space-y-1">
                                {matrix.map((week, weekIndex) => (
                                    <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-[4px]">
                                        {week.map((day) => {
                                            const dayNumber = getDate(day)
                                            const currentMonth = isSameMonth(day, monthDate)
                                            const dateStr = format(day, 'yyyy-MM-dd')
                                            const availability = availabilityData.get(dateStr)
                                            const hasAvailability = !!availability
                                            
                                            const baseColor = currentMonth ? "text-[#1F9BA7]" : "text-[#CAE6E7]"
                                            
                                            return (
                                                <button
                                                    key={day.toISOString()}
                                                    onClick={() => handleDateClick(day)}
                                                    disabled={!currentMonth || isUpdating}
                                                    className={cn(
                                                        "relative flex h-9 items-center justify-center overflow-visible rounded-lg transition-colors",
                                                        currentMonth && "hover:bg-gray-100 cursor-pointer",
                                                        !currentMonth && "cursor-not-allowed",
                                                        isUpdating && "opacity-50 cursor-wait"
                                                    )}
                                                >
                                                    {hasAvailability && (
                                                        <span className={cn(
                                                            "absolute inset-0 rounded-lg",
                                                            getStatusColor(availability.status)
                                                        )} />
                                                    )}
                                                    <span className={cn(
                                                        "relative z-10 text-sm",
                                                        hasAvailability ? getStatusTextColor(availability.status) : baseColor,
                                                        hasAvailability && "font-semibold"
                                                    )}>
                                                        {currentMonth ? dayNumber : ""}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Legend:</p>
                                <div className="flex flex-wrap gap-3 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded bg-[#1F9BA7]"></div>
                                        <span className="text-gray-600">Available</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded bg-[#FFA500]"></div>
                                        <span className="text-gray-600">Hold</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded bg-[#FF6B6B]"></div>
                                        <span className="text-gray-600">Not Available</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
