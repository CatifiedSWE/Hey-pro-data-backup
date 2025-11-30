import { ProjectCardType } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function ProjectCard(props: ProjectCardType) {
  const hasBio = props.bio && props.bio.trim().length > 0;
  const hasSkills = props.skills && props.skills.length > 0;

  return (
    <div className="w-full max-w-[320px] bg-white shadow-md rounded-2xl mx-auto hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 group">
      {/* Header Image - Increased height for more prominence */}
      <div className="relative h-[140px] w-full flex-shrink-0">
        <Image
          src={props.banner || "/bg.jpg"}
          alt={`Banner image for ${props.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 320px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Profile Picture - Larger and more prominent */}
      <div className="flex justify-center items-start -mt-[50px] relative z-10">
        <div className="relative h-[100px] w-[100px] rounded-full border-4 border-white overflow-hidden bg-white shadow-lg flex-shrink-0">
          <Image
            src={props.image || "/image (1).png"}
            alt={props.name}
            fill
            sizes="100px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content Area - More spacious layout */}
      <div className="px-4 pt-2 pb-4 flex flex-col items-center">
        {/* Name */}
        <h1 className="text-xl font-bold text-gray-900 leading-tight text-center mb-1">
            {props.name}
        </h1>

        {/* Location */}
        <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-3">
          <MapPin strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm text-gray-600">{props.location}</p>
        </div>

        {/* Bio - Left-aligned with more space */}
        <div className="w-full mb-4">
          <p className="text-left text-gray-600 text-xs leading-relaxed line-clamp-3">
            {hasBio ? props.bio : "No bio available"}
          </p>
        </div>

        {/* Skills/Roles - Multi-row layout with teal styling */}
        <div className="w-full">
          <div className="flex flex-wrap gap-2 justify-center items-center">
            {hasSkills ? (
              props.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={skill}
                  className="text-[#31A7AC] bg-[#E6F7F8] border border-[#31A7AC] text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs italic">No roles</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
