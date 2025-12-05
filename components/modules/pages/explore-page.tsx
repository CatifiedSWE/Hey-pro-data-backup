"use client";
import { useRouter } from "next/navigation";
import ProjectCard from "@/components/modules/common/projectCard";
import { ProjectCardType } from "@/types";

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
  credits: Array<{ 
    id: string; 
    creditTitle: string;
    title?: string;
    role: string; 
    year?: string;
    releaseYear?: string;
    description?: string;
    productionType?: string;
    projectTitle?: string;
    brandClient?: string;
    imgUrl?: string;
    localCompany?: string;
    internationalCompany?: string;
    country?: string;
    headlineStats?: string;
    awards?: Array<{ title: string; detail?: string }>;
  }>;
  skills: Array<{ id: string; skillName: string }>;
  highlights: Array<{ 
    id: string; 
    highlight?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    sortOrder: number;
  }>;
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
      console.log("=== API Response ===");
      console.log("Full Response:", response.data);
      if (response.data.success) {
        const userData = response.data.data;
        console.log("User Data:", userData);
        console.log("Credits Count:", userData.credits?.length);
        console.log("Credits Data:", userData.credits);
        console.log("Highlights Count:", userData.highlights?.length);
        console.log("Highlights Data:", userData.highlights);
        
        // Log first credit if exists
        if (userData.credits && userData.credits.length > 0) {
          console.log("First Credit:", userData.credits[0]);
        }
        
        // Log first highlight if exists
        if (userData.highlights && userData.highlights.length > 0) {
          console.log("First Highlight:", userData.highlights[0]);
        }
        
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
    <div className="w-full overflow-x-hidden">
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
          className="!max-w-none !w-screen !h-screen !max-h-screen !p-0 !m-0 !rounded-none !border-0 !top-0 !left-0 !translate-x-0 !translate-y-0 overflow-y-auto overflow-x-hidden [&>button]:bg-white [&>button]:shadow-lg [&>button]:rounded-full [&>button]:w-10 [&>button]:h-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:z-50" 
          data-testid="profile-modal"
        >
          <VisuallyHidden>
            <DialogTitle>
              {selectedUser ? `${selectedUser.name} Profile` : 'User Profile'}
            </DialogTitle>
          </VisuallyHidden>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Loading profile...</p>
            </div>
          ) : selectedUser ? (
            <div className="w-full h-full bg-gray-50 overflow-y-auto overflow-x-hidden">
              {/* Banner Section */}
              <div className="relative w-full overflow-x-hidden pb-12 sm:pb-16 md:pb-20">
                {/* Banner Image */}
                <div className="relative h-[120px] sm:h-[180px] md:h-[220px] w-full overflow-hidden">
                  <Image
                    src={selectedUser.banner || "/default-banner.png"}
                    alt="Profile banner"
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Profile Photo - positioned at bottom of banner */}
                <div className="absolute top-[75px] sm:top-[115px] md:top-[145px] left-4 sm:left-12 z-10">
                  <div className="relative h-[90px] w-[90px] sm:h-[130px] sm:w-[130px] md:h-[150px] md:w-[150px] rounded-full overflow-hidden bg-white border-4 border-white shadow-xl">
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
              <div className="w-full max-w-7xl mx-auto overflow-x-hidden">
                {/* Header Info Section */}
                <div className="flex flex-col gap-4 pt-2 sm:pt-4 px-4 sm:px-12 overflow-x-hidden">
                  <div className="space-y-3">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-black text-left">
                      {selectedUser.name}
                    </h2>
                    
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

                <div className="w-[calc(100%-2rem)] sm:w-[calc(100%-6rem)] bg-gray-200 h-px my-6 mx-4 sm:mx-12" />

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 sm:px-12 pb-12 overflow-x-hidden">
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
                        <div className="space-y-6">
                          {selectedUser.credits.map((credit) => {
                            // Build the heading from available fields
                            const headingParts = [
                              credit.brandClient || credit.projectTitle || credit.creditTitle || credit.title
                            ].filter(Boolean);
                            const heading = headingParts.join(" • ") || "Untitled";
                            
                            // Get production type for display
                            const productionType = credit.productionType || '';
                            
                            // Get year from releaseYear or year field
                            const displayYear = credit.releaseYear || credit.year;
                            
                            // Build role line
                            const roleLine = [credit.role, credit.localCompany || credit.internationalCompany]
                              .filter(Boolean)
                              .join(" • ");
                            const companyLine = [credit.internationalCompany, credit.country].filter(Boolean).join(" • ");
                            
                            return (
                              <article
                                key={credit.id}
                                className="relative flex flex-col gap-4 border-b border-[#E6E6E6] pb-6 last:border-b-0"
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <p className="text-lg font-semibold text-[#181818]">
                                        {heading}
                                        {displayYear && ` (${displayYear})`}
                                      </p>
                                      {credit.headlineStats && (
                                        <p className="text-xs font-semibold text-[#31A7AC]">{credit.headlineStats}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-5 lg:flex-row">
                                  <div className="relative sm:w-[190px] flex-shrink-0">
                                    {credit.imgUrl ? (
                                      <Image
                                        src={credit.imgUrl}
                                        alt={credit.creditTitle}
                                        width={190}
                                        height={225}
                                        className="sm:h-[225px] h-[346px] sm:w-[190px] w-full rounded-[5px] object-cover"
                                      />
                                    ) : (
                                      <div className="relative h-[346px] sm:h-[225px] sm:w-[190px] w-full rounded-[5px] bg-[#ffffff] shadow-[4px_4px_6.4px_rgba(0,0,0,0.03)]">
                                        <div className="absolute left-3 top-3 flex items-center gap-[6px]">
                                          <span className="relative inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-[2px] border-[#25C9D0] bg-white" />
                                          <span className="relative inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border-[2px] border-[#FF5168] bg-white" />
                                        </div>
                                        <p className="absolute inset-0 flex items-center justify-center px-4 text-center text-xl font-medium text-[#444444]">
                                          Too busy to take a pic..!
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-1 flex-col gap-4">
                                    <div className="space-y-0 text-[#181818]">
                                      {roleLine && <p className="text-sm leading-[21px]">{roleLine}</p>}
                                      {companyLine && <p className="text-xs text-[#444444]">{companyLine}</p>}
                                      {productionType && <p className="text-[10px] font-semibold text-[#444444] uppercase">{productionType}</p>}
                                    </div>
                                    {credit.description && (
                                      <p className="text-sm font-normal leading-[18px] text-[#393939]">
                                        {credit.description}
                                      </p>
                                    )}
                                    {credit.awards && credit.awards.length > 0 && (
                                      <div className="relative isolate rounded-r-[5px] bg-white px-2 py-2">
                                        <ScrollArea className="max-h-[85px] p-2 pr-2">
                                          <ul className="space-y-1">
                                            {credit.awards.map((award, index) => (
                                              <li key={`${credit.id}-award-${index}`} className="text-[10px] font-semibold text-[#31A7AC]">
                                                <span>{award.title}</span>
                                                {award.detail && <span className="text-[#6B6B6B]"> {award.detail}</span>}
                                              </li>
                                            ))}
                                          </ul>
                                        </ScrollArea>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </article>
                            );
                          })}
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
                        <ul className="space-y-4">
                          {selectedUser.highlights.map((highlight) => {
                            // Get the text to display
                            // Check for the 'highlight' field first (which is the main text field in the API)
                            const displayText = highlight.highlight || highlight.description || highlight.title || '';
                            const hasTitle = highlight.title && highlight.highlight;
                            
                            if (!displayText) return null;
                            
                            return (
                              <li
                                key={highlight.id}
                                className="flex items-start gap-3 text-gray-700 border-l-4 border-[#31A7AC] pl-4 py-2"
                              >
                                <span className="text-[#31A7AC] text-lg mt-0.5">★</span>
                                <div className="flex-1">
                                  {hasTitle && (
                                    <p className="text-sm font-semibold text-gray-900 mb-1">
                                      {highlight.title}
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-700 leading-relaxed">{displayText}</p>
                                </div>
                              </li>
                            );
                          })}
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
