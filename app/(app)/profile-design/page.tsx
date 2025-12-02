"use client"

import { Edit, List, GripVertical, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { HighlightCard } from "@/app/(app)/profile/components/Highlights"
import HighlightsText from "@/app/(app)/profile/components/highlights-text"
type SectionType = "about" | "skills" | "credits"
import React, { useState, useRef, useEffect } from "react";
import AboutSectionComponent from "./components/About";
import VisaSection from "./components/visa";
import WorkStatusSection from "./components/WorkStatus";
import AddLanguageSection from "./components/Language";
import WhatupNumbers from "./components/WhatAppNumber";
import AvalableCountryForTravel from "./components/AvalableCountryForTravel";
import SkillEditor from "@/app/(app)/profile/components/SkillEditor";
import { Button } from "@/components/ui/button";
import ShortProfile from "./components/ShortProfiel";
import Highlights from "./components/Highlights";
import CreditsSection from "./components/CreditView";
import { profileData, highlightsData } from "@/data/profile";
import SlateView from "./components/slate";
import AddNewSkill from "./components/add-new-skill";
import { RoleDialog } from "./components/role";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<"profile" | "slate">("profile")
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (scrollOffset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };


  useEffect(() => {
    handleScroll();
    const container = scrollContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);
  const profile = profileData
  const highlights = highlightsData
  const [sectionOrder, setSectionOrder] = useState<SectionType[]>(["about", "skills", "credits"])
  const [isReorderDialogOpen, setIsReorderDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as SectionType)
        const newIndex = items.indexOf(over.id as SectionType)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const sectionComponents = {
    about: <AboutSection key="about" Profile={profile} />,
    skills: <SkillsSection key="skills" Profile={profile} />,
    credits: <CreditsSection key="credits" Profile={profile} />,
  }

  return (
    <section className="relative mx-auto flex w-full max-w-[1180px] flex-col items-center gap-8 px-3 xs:px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-center lg:gap-12 pt-6 pb-20">
      <main className="flex w-full max-w-[600px] flex-col space-y-4">
        <ShortProfile Profile={profile} />
        <div className="w-full bg-slate-200 h-px sm:h-[1px] mb-5" />

        <div className="space-y-2 mx-auto w-full">
          <div className="flex flex-row  gap-3 sm:gap-6 text-black mb-6 sm:mb-8">
            <Button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 min-h-[44px] text-sm sm:text-base font-semibold rounded-[12px] sm:rounded-[15px] ${activeTab === "profile"
                ? "bg-[#FA6E80] text-white hover:bg-[#FA6E80] hover:text-white hover:opacity-100"
                : "bg-[#f3f4f6] shadow-sm text-foreground hover:bg-[#f3f4f6] hover:text-foreground hover:opacity-100"
                }`}
            >
              Profile
            </Button>
            <Button
              onClick={() => setActiveTab("slate")}
              className={`flex-1 min-h-[44px] text-sm sm:text-base font-semibold rounded-[12px] sm:rounded-[15px] ${activeTab === "slate"
                ? "bg-[#FA6E80] text-white hover:bg-[#FA6E80] hover:text-white hover:opacity-100"
                : "bg-[#ffffff] shadow-sm text-foreground hover:bg-[#ffffff] hover:text-foreground hover:opacity-100"
                }`}
            >
              Slate
            </Button>
          </div>

          {activeTab === "profile" ? (
            <div className=" max-w-[600px]">
              <div className="relative">
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex flex-row overflow-x-auto gap-x-4 mb-6 sm:mb-7 scrollbar-hide -mx-2 xs:-mx-1 sm:mx-0 px-2 xs:px-1 sm:px-0"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <div className="flex-none ">
                    <AboutSectionComponent title="About" about={profile.about} />
                  </div>
                  <div className="flex-none ">
                    <VisaSection visaType={''} visaIssueBy={''} visaExpData={''} />
                  </div>
                  <div className="flex-none ">
                    <WorkStatusSection statusProp={profile.persionalDetails.availability} />
                  </div>
                  <div className="flex-none ">
                    <AddLanguageSection languages={profile.language} />
                  </div>
                  <div className="flex-none ">
                    <WhatupNumbers
                      countryCode={profile.countryCode}
                      phoneNumber={profile.phoneNumber}
                    />
                  </div>

                  <div className="flex-none">
                    <RoleDialog />
                  </div>
                  <div className="flex-none ">
                    <AvalableCountryForTravel availableCountries={profile.AvailableCountriesForTravel} />
                  </div>
                </div>
                {showLeftArrow && (
                  <Button
                    variant="default"
                    size="icon"
                    className="absolute sm:flex hidden left-1 sm:left-0 top-1/2 -translate-y-1/2 transform bg-[#FA6E80] rounded-full shadow-md z-10"
                    onClick={() => scroll(-200)}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                )}
                {showRightArrow && (
                  <Button
                    variant="default"
                    size="icon"
                    className="absolute sm:flex hidden right-1 sm:right-0 top-1/2 -translate-y-1/2 transform bg-[#FA6E80] rounded-full shadow-md z-10"
                    onClick={() => scroll(200)}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                )}
              </div>

              <Dialog open={isReorderDialogOpen} onOpenChange={setIsReorderDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 w-full gap-2 rounded-full border-[#31A7AC] bg-white text-sm text-[#31A7AC] sm:w-auto sm:text-base"
                  >
                    <List className="h-5 w-5" />
                    Reorder sections
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md w-[90vw] sm:w-auto">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-bold">Reorder Sections</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                          {sectionOrder.map((section) => (
                            <SortableItem key={section} id={section} />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
                    <Button
                      onClick={() => setIsReorderDialogOpen(false)}
                      className="bg-coral-500 hover:bg-coral-600 w-full sm:w-auto"
                    >
                      Done
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="lg:hidden">
                <Button
                  variant="outline"
                  className="h-11 rounded-[10px] mt-3 sm:mt-0 w-full border-[#31A7AC] text-black hover:bg-transparent px-4 flex-shrink-0 mb-3"
                >
                  Edit Highlights
                </Button>
                <div className="flex flex-col items-center gap-3 px-2">
                  <div className="flex items-center gap-3 w-full">
                    <HighlightsText direction="row" letterClassName="h-6 w-6" className="gap-1" />
                    <span className="flex-1 h-px bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-4">
                    {highlights.map((highlight) => (
                      <div key={highlight.id} className="flex-shrink-0 h-[400px] w-[275px]">
                        <HighlightCard highlight={highlight} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="my-8" />
              {sectionOrder.map((section, index) => (
                <div key={section}>
                  {sectionComponents[section]}
                  {index < sectionOrder.length - 1 && <div className="my-8" />}
                </div>
              ))}
            </div>
          ) : (
            <SlateView />
          )}
        </div>
      </main>
      <div className="w-full max-w-[336px]">
        <Highlights highlights={highlights} />
      </div>
    </section>
  )
}

function SkillItem({ department, role, description, experience }: { department: string; role: string; description?: string; experience?: { value: string; title: string; description: string; } }) {
  return (
    <div className="space-y-2 ">
      <h3 className="text-base font-[400] text-[#000] sm:text-lg">{department} <span className="text-5xl">.</span> {role}</h3>
      {description && <p className="text-sm leading-relaxed text-[#444444]">{description}</p>}
      {experience && (
        <div className="space-y-2 ml-10 ">
          <div className="flex flex-wrap items-center justify-start gap-x-1 px-4 bg-[#FFFFFF] h-[31px] w-[233px] rounded-[5px]">
            <h4 className="text-sm font-[600] text-[#000]">{experience.title}</h4>
            <p className="text-[10px] leading-relaxed text-[#444444]">{experience.description}</p>

          </div>
        </div>
      )}
    </div>
  )
}



function SortableItem({ id }: { id: SectionType }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const sectionNames = {
    about: "About",
    skills: "Skills",
    credits: "Credits",
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 sm:p-4 bg-secondary/50 rounded-lg border border-border hover:bg-secondary cursor-move"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-5 w-5 text-muted-foreground" />
      <span className="font-medium text-sm sm:text-base">{sectionNames[id]}</span>
    </div>
  )
}

function AboutSection({ Profile: profile }: { Profile: { about: string } }) {
  return (
    <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-[0_1px_10px_rgba(0,0,0,0.1)] sm:px-10 sm:py-9">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[22px] font-semibold leading-[33px] text-[#000]">About</h2>
        <Button size="icon" variant="ghost" className="rounded-full border border-[#31A7AC]/30 bg-white text-[#31A7AC]">
          <Edit className="h-5 w-5" />
        </Button>
      </div>
      <div className="space-y-4 text-sm leading-[21px] text-[#181818] sm:text-base">
        {profile.about}
      </div>
    </div>
  )
}

function SkillsSection({ Profile: profile }: { Profile: { skills: { id: string, department: string, role: string, description: string, experience?: { value: string; title: string; description: string; } }[] } }) {
  return (
    <div className="w-full rounded-[20px] bg-[#FAFAFA] px-6 py-7 shadow-[0_1px_10px_rgba(0,0,0,0.1)] sm:px-10 sm:py-9">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[22px] font-semibold leading-[33px] text-[#000]">Skills</h2>
        <div className="flex gap-1.5">
          <AddNewSkill
            trigger={
              <Button size="icon" variant="default" className="rounded-full border border-[#31A7AC]/30 bg-[#FA6E80] text-[#ffffff]">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            }
          />
          <SkillEditor
            initialSkills={profile.skills}
            trigger={
              <Button size="icon" variant="default" className="rounded-full border border-[#31A7AC]/30 bg-[#31A7AC] text-[#ffffff]">
                <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            }
          />

        </div>
      </div>
      <div className="space-y-4">
        {profile.skills.map((skill, index) => (
          <SkillItem key={index} department={skill.department} role={skill.role} description={skill.description} experience={skill.experience} />
        ))}
      </div>
    </div>
  )
}


