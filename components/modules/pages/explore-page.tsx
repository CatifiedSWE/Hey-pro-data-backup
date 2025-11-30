"use client";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProjectCard from "@/components/modules/common/projectCard";
import { ProjectCardType } from "@/types";

export default function ExplorePage({
  projectsCardData,
}: {
  projectsCardData: ProjectCardType[];
}) {
  // Removed internal state and duplicate UI.
  // Data is now driven by the parent (page.tsx) which reads URL params.
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
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
