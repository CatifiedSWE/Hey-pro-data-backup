"use client";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProjectCard from "@/components/modules/common/projectCard";
import { ProjectCardType } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { MapPin, Briefcase } from "lucide-react";
import axios from "axios";

interface UserProfile {
  id: string;
  userId: string;
  name: string;
  displayName: string;
  avatar: string;
  banner: string;
  bio: string;
  location: string;
  roles: Array<{ id: string; roleName: string }>;
  credits: Array<{ id: string; title: string; role: string; year: string; description?: string }>;
  skills: Array<{ id: string; skillName: string }>;
}

export default function ExplorePage({
  projectsCardData,
}: {
  projectsCardData: ProjectCardType[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCardClick = async (project: ProjectCardType) => {
    if (!project.userId) return;
    
    setIsLoading(true);
    setIsModalOpen(true);
    
    try {
      const response = await axios.get(`/api/explore/${project.userId}`);
      if (response.data.success) {
        setSelectedUser(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
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
            <p>No profiles found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="profile-modal">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading profile...</p>
            </div>
          ) : selectedUser ? (
            <div className="space-y-4">
              {/* Banner */}
              <div className="relative h-32 w-full -mx-6 -mt-6 mb-4">
                <Image
                  src={selectedUser.banner || "/default-banner.png"}
                  alt="Profile banner"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Profile Photo and Name */}
              <div className="flex items-start gap-4 -mt-16 relative z-10">
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg flex-shrink-0">
                  <Image
                    src={selectedUser.avatar || "/default-profile.png"}
                    alt={selectedUser.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-12">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                      {selectedUser.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{selectedUser.location}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedUser.bio && (
                <div className="pt-4">
                  <h3 className="font-semibold text-lg mb-2">About</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedUser.bio}
                  </p>
                </div>
              )}

              {/* Roles */}
              {selectedUser.roles && selectedUser.roles.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.roles.map((role) => (
                      <span
                        key={role.id}
                        className="text-[#31A7AC] bg-white border border-[#31A7AC] text-sm font-medium px-3 py-1 rounded-full"
                      >
                        {role.roleName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Credits */}
              {selectedUser.credits && selectedUser.credits.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Credits
                  </h3>
                  <div className="space-y-3">
                    {selectedUser.credits.map((credit) => (
                      <div
                        key={credit.id}
                        className="border-l-2 border-[#31A7AC] pl-4 py-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {credit.title}
                            </h4>
                            <p className="text-sm text-gray-600">{credit.role}</p>
                            {credit.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {credit.description}
                              </p>
                            )}
                          </div>
                          {credit.year && (
                            <span className="text-sm text-gray-500 font-medium">
                              {credit.year}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {selectedUser.skills && selectedUser.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                      >
                        {skill.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
