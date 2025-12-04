"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  getDate,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Calendar, CircleAlert, Mail, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GigsDataType } from "@/data/gigs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { profileData } from "@/data/profile";
import { DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
type ApplyGigsProps = {
  gig: GigsDataType[number];
};

type DayStatus = "N/A" | "P1" | "P2" | "A";

type ApplicantFormState = {
  savedRate: string;
  customRate: string;
};

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEK_START_OPTIONS = { weekStartsOn: 1 as const };

const STATUS_OPTIONS: { label: DayStatus; color: string }[] = [
  { label: "N/A", color: "bg-[#6B7280]" },
  { label: "P1", color: "bg-[#FFB347]" },
  { label: "P2", color: "bg-[#8BCBFF]" },
];

const STATUS_COLOR_MAP: Record<DayStatus, string> = {
  "N/A": "bg-[#6B7280]",
  P1: "bg-[#FFB347]",
  P2: "bg-[#8BCBFF]",
  A: "bg-[#31A7AC]",
};

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

export default function ApplyGigs({ gig }: ApplyGigsProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<string, DayStatus>
  >({});
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedCreditIds, setSelectedCreditIds] = useState<string[]>([]);
  const buildDefaultFormState = (): ApplicantFormState => ({
    savedRate: gig.budgetLabel ?? "",
    customRate: "",
  });
  const [formValues, setFormValues] = useState<ApplicantFormState>(() =>
    buildDefaultFormState(),
  );

  const availableCredits = useMemo(
    () => profileData.credits ?? [],
    [profileData.credits],
  );

  const highlightedDateMeta = useMemo(() => {
    return gig.calendarMonths.flatMap((month) =>
      month.highlightedDays.map((day) => ({
        key: `${month.year}-${month.month}-${day}`,
        label: format(new Date(month.year, month.month, day), "yyyy-MM-dd"),
      })),
    );
  }, [gig.calendarMonths]);

  const [calendarsPerTab, setCalendarsPerTab] = useState(3);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

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
    const chunkSize = Math.max(calendarsPerTab, 1);
    const groups: Array<typeof gig.calendarMonths> = [];
    for (let index = 0; index < gig.calendarMonths.length; index += chunkSize) {
      groups.push(gig.calendarMonths.slice(index, index + chunkSize));
    }
    return groups;
  }, [gig.calendarMonths, calendarsPerTab]);

  useEffect(() => {
    setActiveGroupIndex(0);
  }, [monthGroups.length]);

  const visibleMonths = monthGroups[activeGroupIndex] ?? [];

  const handleStatusChange = (dateKey: string, status: DayStatus) => {
    setSelectedStatuses((prev) => ({ ...prev, [dateKey]: status }));
  };

  const toggleCreditSelection = (creditId: string) => {
    setSelectedCreditIds((prev) =>
      prev.includes(creditId)
        ? prev.filter((id) => id !== creditId)
        : [...prev, creditId],
    );
  };

  const updateFormValue = (field: keyof ApplicantFormState, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const selectedCreditDetails = useMemo(() => {
    return availableCredits.filter((credit) =>
      selectedCreditIds.includes(credit.id),
    );
  }, [availableCredits, selectedCreditIds]);

  const handleSelectAllChange = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setSelectAllChecked(isChecked);
    if (!isChecked) {
      setSelectedStatuses({});
      return;
    }
    const allSelections: Record<string, DayStatus> = {};
    highlightedDateMeta.forEach(({ key }) => {
      allSelections[key] = "A";
    });
    setSelectedStatuses(allSelections);
    console.log(
      "All highlighted dates marked as A",
      highlightedDateMeta.map(({ label }) => ({ date: label, status: "A" })),
    );
  };

  const handleSubmit = () => {
    const entries = highlightedDateMeta
      .filter(({ key }) => selectedStatuses[key])
      .map(({ key, label }) => ({
        date: label,
        status: selectedStatuses[key] as DayStatus,
      }));

    const payload = {
      gigId: gig.id,
      gigTitle: gig.title,
      applicant: formValues,
      availability: entries,
      credits: selectedCreditDetails.map((credit) => ({
        id: credit.id,
        title: credit.creditTitle,
        startDate: credit.startDate,
        endDate: credit.endDate,
      })),
    };

    console.log("Gig application submission", payload);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          className="inline-flex h-[44px] w-[116px] items-center gap-2 rounded-[14px] bg-[#FA6E80] px-6 py-3 text-sm font-medium text-white shadow-md"
        >
          <Mail className="h-5 w-5" /> Apply
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[100vh] max-h-[100vh] overflow-y-auto border-none px-0"
      >
        <VisuallyHidden>
          <DialogTitle>Apply for Gig</DialogTitle>
        </VisuallyHidden>
        <div className="mx-auto w-full sm:max-w-[921px] px-6 py-8">
          <div className="flex items-start justify-between gap-1">
            <div className="w-full">
              <p className="text-sm font-[400] uppercase tracking-wide text-[#27A4A7]">
                Your Application
              </p>
              <div className="flex flex-row justify-between items-center w-full">
                <div className="mt-4 flex items-center gap-3">
                  <Image
                    src={gig.postedBy.avatar}
                    alt={gig.postedBy.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <div>
                    <p className="text-[16px] font-[400] text-slate-900">
                      {gig.postedBy.name}
                    </p>
                    <p className="text-[9px] text-slate-500">
                      Posted on {gig.postedOn}
                    </p>
                  </div>
                </div>
                <p className="text-[12px] font-[400] text-[#FF4B82]">
                  Apply before {gig.applyBefore}
                </p>
              </div>
            </div>
          </div>

          <section className="mt-1 space-y-2 rounded-[32px] bg-white ">
            <h2 className="text-[18px] font-[400] text-slate-900">
              {gig.title}
            </h2>
            <p className="text-[12px] font-[400] text-[#FF4B82]">
              Apply before {gig.applyBefore}
            </p>

            <div className="flex flex-wrap items-center gap-1 text-[16px] text-slate-500">
              <span className="font-[400] tracking-wide text-[#060606]">
                GIG Rate:
              </span>
              <span className="font-[400] text-[#FF4B82]">
                ADE {gig.budgetLabel}
              </span>
            </div>
            <p className="text-sm text-slate-600">{gig.description}</p>
            <p className="text-sm text-slate-700">
              <span className="font-[600]">Qualifying criteria:</span>{" "}
              {gig.qualifyingCriteria}
            </p>
            <div className=" flex items-center justify-start gap-2 text-[#444444] text-[14px]">
              <MapPin className="h-4 w-4" />
              <p>{gig.location}</p>
            </div>
          </section>

          <section className="mt-8 space-y-5 rounded-[32px] ">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Checkbox
                className="h-5 w-5"
                checked={selectAllChecked}
                onCheckedChange={handleSelectAllChange}
              />
              <span>Available for all highlighted dates</span>
            </div>

            <section
              className={`${selectAllChecked ? "hidden" : "flex flex-col gap-4"}`}
            >
              <div className="flex flex-col items-start justify-start gap-3 text-[14px] font-[400] ">
                <p className="text-[18px] font-[400] text-[#444444]">
                  Select unavailable dates
                </p>

                <div className="flex flex-row items-center justify-start gap-3">
                  <p className="text-[14px] font-[400] text-[#444444]">
                    Click on date to select
                  </p>
                  {STATUS_OPTIONS.map((status) => (
                    <div key={status.label} className="flex items-center gap-1">
                      <span
                        className={`flex h-[24px] w-[35px]  ${status.color} px-[7px] py-[3px] items-center justify-center  gap-[10px]`}
                      >
                        <span className="font-[600] text-[12px] text-white">
                          {status.label}
                        </span>
                      </span>
                    </div>
                  ))}
                  <CircleAlert className="h-4 w-4 text-[#444444]" />
                </div>
              </div>
              <div className="flex gap-4 overflow-x-hidden ">
                {visibleMonths.map((month) => {
                  const monthDate = new Date(month.year, month.month, 1);
                  const matrix = buildMonthMatrix(month.year, month.month);
                  const highlighted = new Set(month.highlightedDays);

                  return (
                    <div
                      key={`${gig.id}-${month.month}-${month.year}`}
                      className="min-w-[250px]  p-4"
                    >
                      <div className="mb-1 flex items-center justify-between text-[18px] font-[400] text-[#FF4B82] p-2 bg-[#F8F8F8] rounded-[6px]">
                        <span>{format(monthDate, "MMM, yyyy")}</span>
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className=" bg-[#F8F8F8] pt-2">
                        <div className="grid grid-cols-7 gap-[6px] text-[11px] font-[400] text-[#FF4B82] rounded-[6px]  bg-[#F8F8F8]">
                          {WEEKDAY_LABELS.map((label, labelIndex) => (
                            <span
                              key={`${gig.id}-${month.month}-weekday-${labelIndex}`}
                              className="text-center"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 space-y-1 ">
                          {matrix.map((week, weekIndex) => (
                            <div
                              key={`week-${weekIndex}`}
                              className="grid grid-cols-7 gap-[2px]"
                            >
                              {week.map((day) => {
                                const dayNumber = getDate(day);
                                const currentMonth = isSameMonth(
                                  day,
                                  monthDate,
                                );
                                const isHighlighted =
                                  currentMonth && highlighted.has(dayNumber);
                                const prevHighlighted =
                                  currentMonth &&
                                  highlighted.has(dayNumber - 1);
                                const nextHighlighted =
                                  currentMonth &&
                                  highlighted.has(dayNumber + 1);
                                const baseColor = currentMonth
                                  ? "text-[#22A5A8]"
                                  : "text-slate-300";
                                const dateKey = `${month.year}-${month.month}-${dayNumber}`;
                                const selectedStatus =
                                  selectedStatuses[dateKey];
                                const highlightBgClass = isHighlighted
                                  ? [
                                      "absolute inset-y-0",
                                      selectedStatus
                                        ? STATUS_COLOR_MAP[selectedStatus]
                                        : "bg-[#22A5A8]",
                                      prevHighlighted
                                        ? "-left-1"
                                        : "left-0 rounded-l-full",
                                      nextHighlighted
                                        ? "-right-1"
                                        : "right-0 rounded-r-full",
                                    ].join(" ")
                                  : "";

                                if (!currentMonth) {
                                  return (
                                    <div
                                      key={day.toISOString()}
                                      className="relative flex h-8 items-center justify-center overflow-visible"
                                    >
                                      <span className="relative z-10 text-sm text-slate-300" />
                                    </div>
                                  );
                                }

                                if (!isHighlighted) {
                                  return (
                                    <div
                                      key={day.toISOString()}
                                      className="relative flex h-8 items-center justify-center overflow-visible"
                                    >
                                      <span
                                        className={`relative z-10 text-sm ${baseColor}`}
                                      >
                                        {dayNumber}
                                      </span>
                                    </div>
                                  );
                                }

                                return (
                                  <div
                                    key={day.toISOString()}
                                    className="relative flex h-8 items-center justify-center overflow-visible"
                                  >
                                    <span className={highlightBgClass} />
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button
                                          type="button"
                                          className="relative z-10 text-sm font-[400] text-white"
                                        >
                                          {dayNumber}
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        className="w-2"
                                        align="start"
                                      >
                                        <DropdownMenuGroup>
                                          {STATUS_OPTIONS.map(
                                            (option, index) => (
                                              <div key={option.label}>
                                                <DropdownMenuItem
                                                  className={`${STATUS_COLOR_MAP[option.label]} text-white`}
                                                  onSelect={() =>
                                                    handleStatusChange(
                                                      dateKey,
                                                      option.label,
                                                    )
                                                  }
                                                >
                                                  {option.label}
                                                </DropdownMenuItem>
                                                {index <
                                                  STATUS_OPTIONS.length - 1 && (
                                                  <Separator />
                                                )}
                                              </div>
                                            ),
                                          )}
                                        </DropdownMenuGroup>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {monthGroups.length > 1 && (
                <div className="mt-4 flex items-center justify-start gap-3">
                  {monthGroups.map((_, index) => (
                    <button
                      key={`${gig.id}-availability-dot-${index}`}
                      type="button"
                      onClick={() => setActiveGroupIndex(index)}
                      aria-current={activeGroupIndex === index}
                      className="p-1"
                    >
                      <span
                        className={`inline-block h-[20px] w-[20px] rounded-full transition-colors ${
                          activeGroupIndex === index
                            ? "bg-[#31A7AC]"
                            : "bg-black"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>
          </section>

          <section className="mt-8 space-y-6 rounded-[32px] bg-white p-6 shadow-[0_20px_50px_rgba(36,35,37,0.08)]">
            <div className="space-y-2">
              <Label className="text-[14px] uppercase tracking-wide text-slate-500">
                Select your credits
              </Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 justify-between rounded-2xl border-slate-200 text-sm font-medium text-slate-700"
                  >
                    <span>
                      {selectedCreditIds.length > 0
                        ? `${selectedCreditIds.length} credit${selectedCreditIds.length > 1 ? "s" : ""} selected`
                        : "Choose credits for this gig"}
                    </span>
                    <span className="text-[14px] text-slate-400">View all</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[360px] max-h-72 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-0"
                  align="start"
                >
                  <DropdownMenuGroup>
                    {availableCredits.map((credit) => {
                      return (
                        <DropdownMenuItem
                          key={credit.id}
                          className="flex items-start gap-3 px-4 py-3 "
                          onSelect={(event) => {
                            event.preventDefault();
                            toggleCreditSelection(credit.id);
                          }}
                        >
                          <div className="">
                            <p className="text-sm font-[600] text-[#444444]">
                              {credit.creditTitle}
                            </p>
                            <p className="text-[12px] font[400] text-[#44444]">
                              {credit.internationalCompany}
                            </p>
                            <p className="text-[14px] font-[400] text-[#444444]">
                              <Calendar className="inline-block h-3 w-3 mr-1" />
                              {format(
                                new Date(credit.startDate),
                                "MMM yyyy",
                              )} –{" "}
                              {format(new Date(credit.endDate), "MMM yyyy")}
                            </p>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedCreditDetails.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedCreditDetails.map((credit) => (
                    <span
                      key={credit.id}
                      className="rounded-full bg-slate-100 px-3 py-1 text-[14px] font-medium text-slate-600"
                    >
                      {credit.creditTitle}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="grid gap-4 max-w-[530px] md:items-center">
              <div className="space-y-2">
                <Label
                  htmlFor="profile-rate"
                  className="text-[14px] uppercase tracking-wide text-slate-500"
                >
                  Select rate from profile
                </Label>
                <Input
                  id="profile-rate"
                  value={formValues.savedRate}
                  onChange={(event) =>
                    updateFormValue("savedRate", event.target.value)
                  }
                  placeholder="Use saved rate"
                />
              </div>
              <div className="flex flex-row justify-center items-center gap-4">
                <span className="h-px w-full bg-[#646464] border " />
                <span className="text-center text-[14px] font-[400] tracking-wide text-[#646464]">
                  or
                </span>
                <span className="h-px w-full bg-[#646464] border " />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="custom-rate"
                  className="text-[14px] uppercase tracking-wide text-slate-500"
                >
                  Enter rate
                </Label>
                <Input
                  id="custom-rate"
                  value={formValues.customRate}
                  onChange={(event) =>
                    updateFormValue("customRate", event.target.value)
                  }
                  placeholder="Enter custom rate"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 h-[68px] w-[274px] rounded-[10px] bg-[#FA6E80] px-6 py-4 text-[18px] font-[400] text-white"
              >
                <Mail className="h-5 w-5" /> Submit Application
              </Button>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
