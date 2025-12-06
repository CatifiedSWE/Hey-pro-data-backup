"use client";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/modules/common/projectCard";
import { ProjectCardType } from "@/types";

export default function ExplorePage({
  projectsCardData,
}: {
  projectsCardData: ProjectCardType[];
}) {
  const router = useRouter();

  const handleCardClick = (project: ProjectCardType) => {
    if (!project.userId) return;
    // Navigate to the user's profile page
    router.push(`/profile/${project.userId}`);
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {projectsCardData.length > 0 ? (
          projectsCardData.map((project) => (
            <ProjectCard 
              key={project.id || project.name} 
              {...project} 
              onClick={() => handleCardClick(project)}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 mt-10">
            <p>Seems like people don't match your vibe</p>
          </div>
        )}
      </div>
    </div>
  );
}
