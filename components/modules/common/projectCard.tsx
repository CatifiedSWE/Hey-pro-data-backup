import { ProjectCardType } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function ProjectCard(props: ProjectCardType) {
  const hasBio = props.bio && props.bio.trim().length > 0;
  const hasSkills = props.skills && props.skills.length > 0;

  return (
    <div className="w-[197px] h-[218px] bg-[#FAFAFA] shadow-md mx-auto hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 group" style={{ borderRadius: '8.5px' }}>
      {/* Header Image - Proportional to new card height */}
      <div className="relative h-[87px] w-full flex-shrink-0">
        <Image
          src={props.banner || "/bg.jpg"}
          alt={`Banner image for ${props.name}`}
          fill
          sizes="197px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Profile Picture - Overlapping background, positioned left */}
      <div className="flex justify-start items-start -mt-[26px] relative z-10 px-3">
        <div className="relative h-[52px] w-[52px] rounded-full border-3 border-white overflow-hidden bg-white shadow-md flex-shrink-0">
          <Image
            src={props.image || "/image (1).png"}
            alt={props.name}
            fill
            sizes="52px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content Area - Left-aligned layout */}
      <div className="px-3 pt-1.5 pb-3 flex flex-col flex-1">
        {/* Name - Left aligned, bold */}
        <h1 className="text-[13px] font-bold text-gray-900 leading-tight mb-1 truncate">
          {props.name}
        </h1>

        {/* Location - Left aligned */}
        <div className="flex items-center gap-1 text-gray-600 mb-1.5">
          <MapPin strokeWidth={1.5} className="w-3 h-3 flex-shrink-0" />
          <p className="text-[10px] truncate">{props.location}</p>
        </div>

        {/* Bio - Left-aligned, limited height */}
        <div className="w-full mb-1.5">
          <p className="text-left text-gray-600 text-[10px] leading-snug line-clamp-2">
            {hasBio ? props.bio : "No bio available"}
          </p>
        </div>

        {/* Skills/Roles - Left-aligned, wrapping layout */}
        <div className="w-full mt-auto">
          <div className="flex flex-wrap gap-1 items-center">
            {hasSkills ? (
              props.skills.slice(0, 2).map((skill) => (
                <span
                  key={skill}
                  className="text-[#31A7AC] bg-white border border-[#31A7AC] text-[9px] font-medium px-1.5 py-0.5 rounded whitespace-nowrap"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-[9px] italic">No roles</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
