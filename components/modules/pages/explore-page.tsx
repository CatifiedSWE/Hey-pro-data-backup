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
import { MapPin, Briefcase, Calendar } from "lucide-react";
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
  availableForWork: boolean;
  roles: Array<{ id: string; roleName: string; category?: string }>;
  credits: Array<{ id: string; title: string; role: string; year: string; description?: string }>;
  skills: Array<{ id: string; skillName: string }>;
  highlights: Array<{ id: string; highlight: string; sortOrder: number }>;
  availability: Array<{ id: string; date: string; status: string }>;
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
      console.log("API Response:", response.data);
      if (response.data.success) {
        const userData = response.data.data;
        console.log("User Data:", userData);
        console.log("Credits:", userData.credits);
        console.log("Highlights:", userData.highlights);
        setSelectedUser(userData);
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

      {/* Profile Modal - Full Screen */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent 
          className="!max-w-none !w-screen !h-screen !max-h-screen !p-0 !m-0 !rounded-none !border-0 !top-0 !left-0 !translate-x-0 !translate-y-0 overflow-y-auto" 
          data-testid="profile-modal"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading profile...</p>
            </div>
          ) : selectedUser ? (
            <div className="w-full h-full">
              {/* Banner */}
              <div className="relative h-64 w-full">
                <Image
                  src={selectedUser.banner || "/default-banner.png"}
                  alt="Profile banner"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Main Content Container */}
              <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10">
                {/* Profile Photo and Header Info */}
                <div className="flex items-start gap-6 mb-8">
                  <div className="relative h-40 w-40 rounded-full overflow-hidden bg-white border-4 border-white shadow-xl flex-shrink-0">
                    <Image
                      src={selectedUser.avatar || "/default-profile.png"}
                      alt={selectedUser.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-16 md:mt-24 flex-1">
                    <DialogHeader>
                      <DialogTitle className="text-4xl font-bold text-gray-900">
                        {selectedUser.name}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-5 h-5" />
                        <span className="text-base">{selectedUser.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            selectedUser.availableForWork
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedUser.availableForWork ? "Available for Work" : "Not Available"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
                  {/* Left Column - Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Bio */}
                    {selectedUser.bio && (
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-xl mb-3">About</h3>
                        <p className="text-gray-700 text-base leading-relaxed">
                          {selectedUser.bio}
                        </p>
                      </div>
                    )}

                    {/* Credits */}
                    {selectedUser.credits && selectedUser.credits.length > 0 ? (
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                          <Briefcase className="w-6 h-6 text-[#31A7AC]" />
                          Credits & Work History ({selectedUser.credits.length})
                        </h3>
                        <div className="space-y-4">
                          {selectedUser.credits.map((credit) => (
                            <div
                              key={credit.id}
                              className="border-l-4 border-[#31A7AC] pl-5 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg text-gray-900">
                                    {credit.title}
                                  </h4>
                                  <p className="text-base text-[#31A7AC] font-medium mt-1">
                                    {credit.role}
                                  </p>
                                  {credit.description && (
                                    <p className="text-sm text-gray-600 mt-2">
                                      {credit.description}
                                    </p>
                                  )}
                                </div>
                                {credit.year && (
                                  <span className="text-base text-gray-500 font-semibold ml-4">
                                    {credit.year}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                          <Briefcase className="w-6 h-6 text-[#31A7AC]" />
                          Credits & Work History
                        </h3>
                        <p className="text-gray-500 text-sm">No credits added yet.</p>
                      </div>
                    )}

                    {/* Highlights */}
                    {selectedUser.highlights && selectedUser.highlights.length > 0 ? (
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-xl mb-4">Highlights ({selectedUser.highlights.length})</h3>
                        <ul className="space-y-3">
                          {selectedUser.highlights.map((highlight) => (
                            <li
                              key={highlight.id}
                              className="flex items-start gap-3 text-gray-700"
                            >
                              <span className="text-[#31A7AC] mt-1">★</span>
                              <span className="text-base">{highlight.highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-xl mb-4">Highlights</h3>
                        <p className="text-gray-500 text-sm">No highlights added yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Sidebar */}
                  <div className="space-y-6">
                    {/* Roles */}
                    {selectedUser.roles && selectedUser.roles.length > 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-xl mb-4">Professional Roles</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.roles.map((role) => (
                            <span
                              key={role.id}
                              className="text-[#31A7AC] bg-[#31A7AC]/10 border border-[#31A7AC] text-sm font-medium px-3 py-2 rounded-lg"
                            >
                              {role.roleName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {selectedUser.skills && selectedUser.skills.length > 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-xl mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded-lg font-medium"
                            >
                              {skill.skillName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Availability Calendar */}
                    {selectedUser.availability && selectedUser.availability.length > 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                          <Calendar className="w-6 h-6 text-[#31A7AC]" />
                          Availability
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {selectedUser.availability.slice(0, 30).map((avail) => {
                            const statusColors = {
                              available: "bg-green-100 text-green-800 border-green-300",
                              hold: "bg-yellow-100 text-yellow-800 border-yellow-300",
                              na: "bg-red-100 text-red-800 border-red-300"
                            };
                            const statusLabels = {
                              available: "Available",
                              hold: "On Hold",
                              na: "Not Available"
                            };
                            return (
                              <div
                                key={avail.id}
                                className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                              >
                                <span className="text-sm text-gray-700">
                                  {new Date(avail.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full border font-medium ${
                                    statusColors[avail.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {statusLabels[avail.status as keyof typeof statusLabels] || avail.status}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {selectedUser.availability.length > 30 && (
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            Showing first 30 dates
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
