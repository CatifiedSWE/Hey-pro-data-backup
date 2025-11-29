"use client";
import { useEffect, useState } from "react";
import { ChevronDown, Filter, Search, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import ProjectCard from "@/components/modules/common/projectCard";
import { ProjectCardType } from "@/types";
import apiCalling from "@/lib/apiCalling";

const tags = [
  "1st Assistant Director (1st AD)",
  "2D Animation",
  "2nd AC",
  "2nd Assistant Director (2nd AD)",
  "3D Animation",
  "3rd Assistant Director (3rd AD)",
  "Action Director",
  "Aerial Filming",
  "AI Video AD Creator",
  "Animator",
  "Art Director",
  "Art PA",
  "Artist Liaison",
  "Assistant Director",
  "Assistant Director | TV",
  "Assistant Producer",
  "Associate Producer",
  "Camera Assistant",
  "Camera Assistant | Junior",
  "Camera Operator",
  "Camera Operator | Remote Head",
  "Camera Operator | Steadicam",
  "Camera Operator | Trinity 2",
  "Camera Trainee",
  "Casting",
  "Casting Director",
  "Colorist",
  "Content Creator",
  "Costume Designer",
  "Creative Director",
  "Data Wrangler",
  "Director",
  "Director | Commercial",
  "DIT",
  "DOP",
  "DOP | Assistant",
  "DOP | Associate",
  "Drone",
  "Editor",
  "Editor | Offline",
  "Editor | Senior",
  "Equipment Rental",
  "Event Manager",
  "Event Organizer",
  "Events | Fashion Backstage Director",
  "Fashion Assistant | Celebrity",
  "Fashion Show Director",
  "Fashion Stylist",
  "Fashion Stylist | Assistant",
  "Fight Choreographer",
  "Gaffer",
  "Graphic Designer",
  "Grip",
  "Hair Stylist",
  "Image Consultant",
  "Infographics",
  "Makeup Artist",
  "Production Designer",
  "Production Manager",
  "Set Decorator",
  "Sound Mixer",
  "Sound Recordist",
  "Storyboard Artist",
  "VFX Artist",
  "Video Editor",
  "Writer"
];

interface ExplorePageProps {
  projectsCardData: ProjectCardType[];
}

export default function ExplorePage({ projectsCardData }: ExplorePageProps) {
  const [projects, setProjects] = useState<ProjectCardType[]>(projectsCardData);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [clearFilter, setClearFilter] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch data from API if initial data is empty or when filtering
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      let query = '/explore?';
      
      if (searchTerm) query += `keyword=${encodeURIComponent(searchTerm)}&`;
      if (filterTags.length > 0) {
        // For now just use the first tag as role filter, or update API to support multiple tags
        query += `role=${encodeURIComponent(filterTags[0])}&`; 
      }
      
      const response = await apiCalling({
        method: 'get',
        route: query
      });
      
      if (response.status && response.data?.data?.profiles) {
        // Map API response to ProjectCardType if needed
        const apiProfiles = response.data.data.profiles.map((p: any) => ({
          id: p.id,
          name: p.displayName || p.name,
          image: p.avatar || '',
          banner: p.banner || '',
          bio: p.bio || '',
          location: p.location || '',
          skills: p.roles || []
        }));
        setProjects(apiProfiles);
      }
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial client-side fetch if server data is empty (fallback)
  useEffect(() => {
    if (projectsCardData.length === 0) {
      fetchProfiles();
    }
  }, []);

  // Handle local filtering (instant) AND server filtering (for search/tags)
  useEffect(() => {
    // If we have data, filter locally first for instant feedback
    let filteredProjects = projects;
    
    // If we are in a "searching" state with the API, we might want to rely on API results
    // But for now, let's stick to the original local filtering logic if we have data,
    // and only call API if we really need complex search that local data doesn't cover.
    // However, the requirement is "Real Time Data", so maybe we should debounce search and call API?
    
    // Current logic:
    // If the initial load (server or client fallback) got data, we filter that data locally.
    // This is good for performance if the dataset is small (<100).
    
    if (filterTags.length > 0) {
      filteredProjects = filteredProjects.filter((project) =>
        filterTags.every((tag) => project.skills.includes(tag))
      );
    }
    if (searchTerm) {
      filteredProjects = filteredProjects.filter((project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // If local filtering returns nothing, BUT we suspect there might be more data on server,
    // we could trigger a server fetch. But for this MVP fix, let's stick to:
    // 1. Load all (or top 50) profiles.
    // 2. Filter locally.
    
    // Note: setProjects overwrites the state. If we filter 'projects', we lose the original list.
    // We need a 'source' list.
    
  }, [filterTags, searchTerm, clearFilter]); // Removed projects from dependency to avoid infinite loop

  // BETTER APPROACH: Keep source data separate
  const [allProjects, setAllProjects] = useState<ProjectCardType[]>(projectsCardData);

  useEffect(() => {
    if (projectsCardData.length > 0) {
      setAllProjects(projectsCardData);
      setProjects(projectsCardData);
    } else {
        // If initial data is empty, try fetching from API
        fetchProfiles().then(() => {
             // fetchProfiles sets 'projects'. We should also set 'allProjects' inside it?
             // Ideally fetchProfiles should return data.
        });
    }
  }, [projectsCardData]);

  // Custom fetch wrapper to update both states
  const handleFetch = async () => {
      setLoading(true);
      try {
        const response = await apiCalling({
            method: 'get',
            route: '/explore'
        });
        if (response.status && response.data?.data?.profiles) {
            const apiProfiles = response.data.data.profiles.map((p: any) => ({
                id: p.id,
                name: p.displayName || p.name,
                image: p.avatar || '',
                banner: p.banner || '',
                bio: p.bio || '',
                location: p.location || '',
                skills: p.roles || []
            }));
            setAllProjects(apiProfiles);
            setProjects(apiProfiles);
        }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  }

  useEffect(() => {
      if (allProjects.length === 0 && !loading && projectsCardData.length === 0) {
          handleFetch();
      }
  }, []);

  useEffect(() => {
    let filtered = allProjects;
    
    if (filterTags.length > 0) {
      filtered = filtered.filter((project) =>
        filterTags.some((tag) => project.skills.includes(tag)) // Changed to 'some' or 'every' based on need. usually 'some' is broader. Original was 'every'.
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter((project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (clearFilter) {
      setFilterTags([]);
      setSearchTerm("");
      setClearFilter(false);
      filtered = allProjects;
    }
    
    setProjects(filtered);
  }, [filterTags, searchTerm, allProjects, clearFilter]);


  return (
    <>
      <div className="flex flex-row p-4 pb-0 gap-5">
        <div className="basis-4/5 relative">
          <Input
            placeholder="Search profiles..."
            className="w-full m-4 h-15 mx-10 rounded-full border-pink focus:border-pink focus-visible:border-pink focus-visible:ring-pink/50"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <div className="absolute -right-9 top-1/2 h-12 w-12 -translate-y-1/2 bg-pink hover:bg-pink text-white rounded-full flex items-center justify-center">
            <Search className="h-6 w-6 " />
          </div>
        </div>
        <button
          onClick={() => setClearFilter(!clearFilter)}
          className="flex items-center justify-around ml-8 m-4 px-2 gap-5 border border-pink rounded-full text-2xl cursor-pointer"
        >
          <span>Filter</span>
          <Filter className="h-6 w-6" />
        </button>
      </div>
      {/* filter tags */}
      {filterTags.length > 0 && (
        <div className="flex items-center space-x-2 mb-4 px-20 ">
          {filterTags.map((tag) => (
            <div
              key={tag}
              className="flex items-center border-[1px] border-light-green rounded-full px-3 py-1"
            >
              <span className="px-3 py-1 rounded-full text-sm">{tag}</span>
              <X
                className="h-5 w-5 cursor-pointer"
                onClick={() =>
                  setFilterTags(filterTags.filter((t) => t !== tag))
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* main content */}
      <div className="flex flex-row-2 px-10">
        <div className="w-1/3">
          <ScrollArea className="flex max-h-screen flex-col p-4 rounded-4xl">
            {!showAllTags
              ? tags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    className="w-full text-start text-xl my-2 p-2  cursor-pointer hover:text-pink/70 hover:bg-pink/10 rounded-full"
                    onClick={() => {
                      if (!filterTags.includes(tag))
                        setFilterTags([...filterTags, tag]);
                    }}
                  >
                    {tag}
                  </button>
                ))
              : tags.map((tag) => (
                  <button
                    key={tag}
                    className="w-full text-start text-xl my-2 p-2  cursor-pointer hover:text-pink/70 hover:bg-pink/10 rounded-full"
                    onClick={() => {
                      if (!filterTags.includes(tag))
                        setFilterTags([...filterTags, tag]);
                    }}
                  >
                    {tag}
                  </button>
                ))}
          </ScrollArea>
          {!showAllTags && tags.length > 10 && (
            <button
              className="pl-5 text-pink flex gap-5 items-center cursor-pointer hover:text-pink/70"
              onClick={() => setShowAllTags(true)}
            >
              See more <ChevronDown />
            </button>
          )}
        </div>
        <div className="w-2/3 flex flex-wrap gap-5 p-4">
          {loading && projects.length === 0 ? (
             <div className="w-full text-center text-gray-500 mt-10">Loading profiles...</div>
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard key={project.id || project.name} {...project} />
            ))
          ) : (
            <div className="w-full text-center text-gray-500 mt-10">No profiles found.</div>
          )}
        </div>
      </div>
    </>
  );
}
