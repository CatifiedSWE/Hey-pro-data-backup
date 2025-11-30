"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProjectCard from "@/components/modules/common/projectCard";
import { ProjectCardType } from "@/types";

export default function ExplorePage({
  projectsCardData,
}: {
  projectsCardData: ProjectCardType[];
}) {
  // Data is now driven by the parent (page.tsx) which reads URL params.
  
  return (
    <div className="w-full flex justify-center">
      {/* 
        Target Layout: 
        - Max width ~615px 
        - 3 Columns on desktop 
        - Gap 10px
        - Mobile: 2 columns (responsive)
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-[10px] p-4 md:p-0 max-w-[615px] w-full justify-items-center auto-rows-max">
        {projectsCardData.length > 0 ? (
          projectsCardData.map((project) => (
            <ProjectCard key={project.id || project.name} {...project} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 mt-10">
            <p>No profiles found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
