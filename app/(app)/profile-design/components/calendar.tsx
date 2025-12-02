"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { addDays, endOfMonth, endOfWeek, format, getDate, isSameMonth, startOfMonth, startOfWeek } from "date-fns"

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]
const WEEK_START_OPTIONS = { weekStartsOn: 1 as const }

const calendarMonths = [
    {
        id: "sep-2025",
        title: "Sep, 2025",
        year: 2025,
        month: 8, // September (0-indexed)
        highlightedDays: [1, 2, 4, 13, 14, 15, 16, 17],
    },
]

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
    return (
        <Dialog>
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
            <DialogContent className="sm:max-w-[360px] rounded-[24px] border-none px-0 pb-6 pt-4">
                <DialogHeader className="px-6">
                    <DialogTitle className="text-left text-base font-semibold text-[#FA6E80]">Availability calendar</DialogTitle>
                </DialogHeader>
                <div className="mt-2 px-6">
                    {calendarMonths.map((month) => {
                        const monthDate = new Date(month.year, month.month, 1)
                        const matrix = buildMonthMatrix(month.year, month.month)
                        const highlighted = new Set(month.highlightedDays)

                        return (
                            <div key={month.id} className="rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(15,139,141,0.12)]">
                                <div className="mb-4 flex items-center justify-between text-base font-semibold text-[#FA6E80]">
                                    <span>{month.title ?? format(monthDate, "MMM, yyyy")}</span>
                                    <Calendar className="h-5 w-5 text-[#FA6E80]" />
                                </div>
                                <div className="grid grid-cols-7 gap-[8px] text-center text-[11px] font-semibold uppercase tracking-wide text-[#FA6E80]">
                                    {WEEKDAY_LABELS.map((label) => (
                                        <span key={`${month.id}-${label}`}>{label}</span>
                                    ))}
                                </div>
                                <div className="mt-4 space-y-1">
                                    {matrix.map((week, weekIndex) => (
                                        <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-[4px]">
                                            {week.map((day) => {
                                                const dayNumber = getDate(day)
                                                const currentMonth = isSameMonth(day, monthDate)
                                                const isHighlighted = currentMonth && highlighted.has(dayNumber)
                                                const prevHighlighted = currentMonth && highlighted.has(dayNumber - 1)
                                                const nextHighlighted = currentMonth && highlighted.has(dayNumber + 1)
                                                const baseColor = currentMonth ? "text-[#1F9BA7]" : "text-[#CAE6E7]"
                                                const highlightBgClass = isHighlighted
                                                    ? [
                                                        "absolute inset-y-0 bg-[#1F9BA7]",
                                                        prevHighlighted ? "-left-1" : "left-0 rounded-l-full",
                                                        nextHighlighted ? "-right-1" : "right-0 rounded-r-full",
                                                    ].join(" ")
                                                    : ""

                                                return (
                                                    <div key={day.toISOString()} className="relative flex h-9 items-center justify-center overflow-visible">
                                                        {isHighlighted && <span className={highlightBgClass} />}
                                                        <span className={`relative z-10 text-sm ${isHighlighted ? "font-semibold text-white" : baseColor}`}>
                                                            {currentMonth ? dayNumber : ""}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}
