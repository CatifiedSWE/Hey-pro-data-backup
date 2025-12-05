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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
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
            <div className="w-full h-full bg-gray-50 overflow-y-auto">
              {/* Banner Section */}
              <div className="relative w-full">
                {/* Banner Image */}
                <div className="relative h-[140px] sm:h-[200px] w-full overflow-hidden">
                  <Image
                    src={selectedUser.banner || "/default-banner.png"}
                    alt="Profile banner"
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Profile Photo - positioned at bottom of banner */}
                <div className="absolute bottom-0 left-4 sm:left-8 transform translate-y-1/2 z-10">
                  <div className="relative h-[100px] w-[100px] sm:h-[140px] sm:w-[140px] rounded-full overflow-hidden bg-white border-4 border-white shadow-lg">
                    <Image
                      src={selectedUser.avatar || "/default-profile.png"}
                      alt={selectedUser.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Main Content Container */}
              <div className="w-full max-w-6xl mx-auto">
                {/* Header Info Section */}
                <div className="flex flex-col gap-4 pt-16 sm:pt-20 px-4 sm:px-8">
                  <div className="space-y-3">
                    <DialogHeader className="p-0 space-y-1 text-left">
                      <DialogTitle className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black text-left">
                        {selectedUser.name}
                      </DialogTitle>
                    </DialogHeader>
                    
                    {/* Location and Availability */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{selectedUser.location}</span>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          selectedUser.availableForWork
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {selectedUser.availableForWork ? "Available" : "Not Available"}
                      </span>
                    </div>
                  </div>

                  {/* Role Badges */}
                  {selectedUser.roles && selectedUser.roles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.roles.slice(0, 6).map((role) => (
                        <span
                          key={role.id}
                          className="inline-flex items-center rounded-full bg-[#FA6E80] px-4 py-1.5 text-xs sm:text-sm font-medium text-white"
                        >
                          {role.roleName}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bio Preview */}
                  {selectedUser.bio && (
                    <p className="text-sm leading-relaxed text-gray-700 line-clamp-2">{selectedUser.bio}</p>
                  )}
                </div>

                <div className="w-full bg-gray-200 h-px my-6" />

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 sm:px-8 pb-12">
                  {/* Left Column - Main Content */}
                  <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                    {/* Bio - Full Version */}
                    {selectedUser.bio && (
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-xl mb-3">About</h3>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {selectedUser.bio}
                        </p>
                      </div>
                    )}

                    {/* Credits */}
                    {selectedUser.credits && selectedUser.credits.length > 0 ? (
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-[#31A7AC]" />
                          Credits & Work History ({selectedUser.credits.length})
                        </h3>
                        <div className="space-y-4">
                          {selectedUser.credits.map((credit) => (
                            <div
                              key={credit.id}
                              className="border-l-4 border-[#31A7AC] pl-4 py-3 hover:bg-gray-50 transition-colors rounded-r"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-base text-gray-900">
                                    {credit.title}
                                  </h4>
                                  <p className="text-sm text-[#31A7AC] font-medium mt-1">
                                    {credit.role}
                                  </p>
                                  {credit.description && (
                                    <p className="text-sm text-gray-600 mt-2">
                                      {credit.description}
                                    </p>
                                  )}
                                </div>
                                {credit.year && (
                                  <span className="text-sm text-gray-500 font-semibold">
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
                          <Briefcase className="w-5 h-5 text-[#31A7AC]" />
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
                              <span className="text-[#31A7AC] text-lg mt-0.5">★</span>
                              <span className="text-sm flex-1">{highlight.highlight}</span>
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
                  <div className="space-y-6 order-1 lg:order-2">
                    {/* Skills */}
                    {selectedUser.skills && selectedUser.skills.length > 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-xl mb-4">Skills</h3>
                        <div className="flex flex-col gap-3">
                          {selectedUser.skills.map((skill) => (
                            <div
                              key={skill.id}
                              className="bg-gray-100 text-gray-800 text-sm px-4 py-3 rounded-lg font-medium"
                            >
                              {skill.skillName}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Availability Calendar */}
                    {selectedUser.availability && selectedUser.availability.length > 0 && (
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-[#31A7AC]" />
                          Availability
                        </h3>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {selectedUser.availability.slice(0, 30).map((avail) => {
                            const statusColors = {
                              available: "bg-green-50 text-green-700 border-green-200",
                              hold: "bg-yellow-50 text-yellow-700 border-yellow-200",
                              na: "bg-red-50 text-red-700 border-red-200"
                            };
                            const statusLabels = {
                              available: "Available",
                              hold: "On Hold",
                              na: "Not Available"
                            };
                            return (
                              <div
                                key={avail.id}
                                className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span className="text-sm text-gray-700 font-medium">
                                  {new Date(avail.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                <span
                                  className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
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
                          <p className="text-xs text-gray-500 mt-3 text-center">
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
