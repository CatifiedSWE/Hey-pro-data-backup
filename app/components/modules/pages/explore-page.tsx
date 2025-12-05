"use client";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProjectCard from "@/components/modules/common/projectCard";
import ViewProfileModal from "@/components/modules/common/ViewProfileModal";
import { ProjectCardType } from "@/types";

interface ExplorePageProps {
  projectsCardData: (ProjectCardType & { userId?: string })[];
}

export default function ExplorePage({
  projectsCardData,
}: ExplorePageProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug: Check if userId is present in the data
  console.log('Projects data sample:', projectsCardData[0]);

  const handleProfileClick = (userId: string | undefined) => {
    console.log('Profile clicked, userId:', userId);
    if (userId) {
      setSelectedUserId(userId);
      setIsModalOpen(true);
    } else {
      console.warn('No userId provided for profile click');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };
  
  return (
    <>
      <div className="w-full flex justify-center">
        {/* 
          Target Layout: 
          - Max width ~615px 
          - 3 Columns on desktop 
          - Gap 10px
          - Mobile: 2 columns (responsive)
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-[10px] p-2 md:p-0 max-w-[615px] w-full justify-items-stretch auto-rows-max">
          {projectsCardData.length > 0 ? (
            projectsCardData.map((project) => (
              <ProjectCard 
                key={project.id || project.name} 
                {...project} 
                onClick={() => handleProfileClick(project.userId)}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 mt-10">
              <p>No profiles found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile View Modal */}
      <ViewProfileModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userId={selectedUserId}
      />
    </>
  );
}
