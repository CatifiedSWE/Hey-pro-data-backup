"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { addDays, endOfMonth, endOfWeek, format, getDate, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ArrowLeft, Calendar, FileText, Link2, MapPin, Paperclip, UserPlus } from "lucide-react";

import { type GigsDataType } from "@/data/gigs";
import ApplyGigs from "./applygigs";
import { Button } from "@/components/ui/button";
import { SendRecommendationDialog } from "./recommend-gigs";
import { useAuth } from "@/contexts/AuthContext";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const WEEK_START_OPTIONS = { weekStartsOn: 1 as const };

const buildMonthMatrix = (year: number, month: number) => {
  const firstDay = startOfMonth(new Date(year, month, 1));
  const gridStart = startOfWeek(firstDay, WEEK_START_OPTIONS);
  const gridEnd = endOfWeek(endOfMonth(firstDay), WEEK_START_OPTIONS);

  const days: Date[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  const rows: Date[][] = [];
  for (let index = 0; index < days.length; index += 7) {
    rows.push(days.slice(index, index + 7));
  }
  return rows;
};

export default function GigDetails(gig: GigsDataType[0]) {
  const { user } = useAuth();
  const [calendarsPerTab, setCalendarsPerTab] = useState(3);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  
  // Check if current user is the gig creator
  const isOwnGig = user?.id === gig.created_by;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 640px)");

    const syncTabs = () => {
      setCalendarsPerTab(query.matches ? 1 : 3);
    };

    syncTabs();

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", syncTabs);
      return () => query.removeEventListener("change", syncTabs);
    }

    query.addListener(syncTabs);
    return () => query.removeListener(syncTabs);
  }, []);

  const monthGroups = useMemo(() => {
    const groups: Array<typeof gig.calendarMonths> = [];
    const chunkSize = Math.max(calendarsPerTab, 1);
    for (let index = 0; index < gig.calendarMonths.length; index += chunkSize) {
      groups.push(gig.calendarMonths.slice(index, index + chunkSize));
    }
    return groups;
  }, [gig.calendarMonths, calendarsPerTab]);

  useEffect(() => {
    setActiveGroupIndex(0);
  }, [monthGroups.length]);

  const handleDotClick = (index: number) => {
    setActiveGroupIndex(index);
  };

  const visibleMonths = monthGroups[activeGroupIndex] ?? [];

  const formattedApplyBefore = useMemo(() => {
    if (!gig.applyBefore) return "";
    const date = new Date(gig.applyBefore);
    if (isNaN(date.getTime())) return gig.applyBefore;
    return format(date, "dd MMM, yyyy");
  }, [gig.applyBefore]);

  return (
    <section className="w-full max-w-5xl p-8">
      <Link href="/gigs" className="inline-flex items-center gap-2 text-sm font-[400] text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> back to gig directory
      </Link>

      <div className="mt-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4">
          {gig.postedBy.avatar && gig.postedBy.avatar.trim() !== "" ? (
            <Image src={gig.postedBy.avatar} alt={gig.postedBy.name} width={24} height={24} className="rounded-full" />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
              {gig.postedBy.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-[16px] font-[400] text-slate-900">{gig.postedBy.name}</p>
            <p className="text-[9px] text-[#444444]">Posted on {gig.postedOn}</p>
          </div>
          {formattedApplyBefore && <div className="ml-auto text-sm font-[500] text-[#FA6E80]">Apply before {formattedApplyBefore}</div>}
        </div>

        <div className="space-y-3">

          <span className="text-[18px] font-[400] text-[#000000]">{gig.title}</span>
          <div className="flex flex-row gap-2 justify-start items-center">
            <div className="text-sm uppercase tracking-wide text-slate-400">Gig Rate :</div>
            <div className="text-[16px] font-[400] text-[#FA6E80]">AED {gig.budgetLabel}</div>
          </div>
          <p className="text-[14.9px] text-[#444444]">{gig.description}</p>
          <p className="text-base text-slate-700">
            <span className="font-[600]">Qualifying criteria:</span> {gig.qualifyingCriteria}
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <div className="">
              <MapPin className="h-4 w-4" />
            </div>
            <p>{gig.location}</p>
          </div>

        </div>

        <div className="flex flex-wrap gap-3">
          <SendRecommendationDialog />
          {!isOwnGig && <ApplyGigs gig={gig} />}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-2 text-lg font-[400] text-slate-900">
          <Calendar className="h-5 w-5 text-[#FA6E80]" />
          Gigs Date
        </div>
        <div className="flex flex-row flex-wrap gap-4">
          {visibleMonths.map((month, index) => {
            const monthDate = new Date(month.year, month.month, 1);
            const matrix = buildMonthMatrix(month.year, month.month);
            const highlighted = new Set(month.highlightedDays);

            return (
              <div
                key={`${gig.id}-${month.month}-${month.year}`}
                className="rounded-[22px] border border-[#F2F0ED] bg-white p-4 min-w-[280px]"
              >
                <div className="mb-3 flex items-center justify-between text-base font-semibold text-[#FF4B82]">
                  <span className="text-[16px] font-[400]">{format(monthDate, "MMM, yyyy")}</span>
                  <Calendar className="h-4 w-4 text-[#FF4B82]" />
                </div>
                <div className="grid grid-cols-7 gap-[6px] text-[11px] font-semibold text-[#FF4B82]">
                  {WEEKDAY_LABELS.map((label) => (
                    <span key={`${gig.id}-${month.month}-${label}`} className="text-center font-[400] text-[16px]">
                      {label}
                    </span>
                  ))}
                </div>
                <div className="mt-3 space-y-1">
                  {matrix.map((week, weekIndex) => (
                    <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-[2px]">
                      {week.map((day) => {
                        const dayNumber = getDate(day);
                        const currentMonth = isSameMonth(day, monthDate);
                        const isHighlighted = currentMonth && highlighted.has(dayNumber);
                        const prevHighlighted = currentMonth && highlighted.has(dayNumber - 1);
                        const nextHighlighted = currentMonth && highlighted.has(dayNumber + 1);
                        const baseColor = currentMonth ? "text-[#22A5A8]" : "text-slate-300";
                        const highlightBgClass = isHighlighted
                          ? [
                            "absolute inset-y-0 bg-[#22A5A8] h-[28.27px]",
                            prevHighlighted ? "-left-1" : "left-0 rounded-l-[43px]",
                            nextHighlighted ? "-right-1" : "right-0 rounded-r-[43px]",
                          ].join(" ")
                          : "";

                        return (
                          <div key={day.toISOString()} className="relative flex h-8 items-center justify-center overflow-visible">
                            {isHighlighted && <span className={highlightBgClass} />}
                            <span className={`relative z-10 text-sm ${isHighlighted ? "font-semibold text-white" : baseColor}`}>
                              {currentMonth ? dayNumber : ""}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {monthGroups.length > 1 && (
          <div className="mt-4 flex items-center justify-start gap-3">
            {monthGroups.map((group, index) => {
              const firstMonth = group[0];
              const lastMonth = group[group.length - 1];
              const ariaLabel = firstMonth
                ? `Show calendars ${format(new Date(firstMonth.year, firstMonth.month, 1), "MMM yyyy")}${lastMonth && group.length > 1
                  ? ` - ${format(new Date(lastMonth.year, lastMonth.month, 1), "MMM yyyy")}`
                  : ""
                }`
                : `Show calendar group ${index + 1}`;
              return (
                <button
                  key={`${gig.id}-dot-group-${index}`}
                  type="button"
                  onClick={() => handleDotClick(index)}
                  aria-label={ariaLabel}
                  aria-current={activeGroupIndex === index}
                  className="p-1"
                >
                  <span
                    className={`inline-block h-[20px] w-[20px] rounded-full transition-colors ${activeGroupIndex === index ? "bg-[#31A7AC] h-[22px] w-[22px]" : "bg-black"
                      }`}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-10 space-y-4">
        <h2 className="text-lg font-[400] text-slate-900">References</h2>
        <div className="flex flex-col gap-3">
          {gig.references.map((reference, index) => {
            const Icon = reference.type === "file" ? FileText : Link2;
            const content = (
              <div className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-[400] text-slate-700">
                <Icon className="h-4 w-4 text-[#2AA9A7]" />
                <span className="truncate">{reference.label}</span>
              </div>
            );
            return reference.href ? (
              <a key={`${reference.label}-${index}`} href={reference.href} className="block" target="_blank" rel="noreferrer">
                {content}
              </a>
            ) : (
              <div key={`${reference.label}-${index}`}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
