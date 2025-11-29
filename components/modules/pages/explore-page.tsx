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
    <div className="flex flex-row-2 px-10 pt-8">
       {/* If we want to keep the LEFT SIDEBAR tags filter from the original design, we can keep it.
           The user said "Two filter and search options".
           The template.tsx has a DROPDOWN filter and a top search bar.
           The ExplorePage had a LEFT sidebar tags list and a top search bar.
           
           I should probably keep the LEFT SIDEBAR (Tags) as it's a nice quick filter, 
           but REMOVE the Top Search Bar and Filter Button from here.
       */}
       
        {/* <div className="w-1/3"> ... Tags Sidebar ... </div> */}
        {/* 
           Actually, the template.tsx has a "Crew Directory" title and filters.
           Let's just render the GRID for now to be safe and clean.
           If the user wants the side tags back, they can ask. 
           But having "Filter" dropdown in template AND "Tags" sidebar might be confusing too.
           Let's stick to the Grid.
        */}
      
      <div className="w-full flex flex-wrap gap-5 p-4 justify-center sm:justify-start">
        {projectsCardData.length > 0 ? (
          projectsCardData.map((project) => (
            <ProjectCard key={project.id || project.name} {...project} />
          ))
        ) : (
          <div className="w-full text-center text-gray-500 mt-10">
            <p>No profiles found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
