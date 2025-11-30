import { ProjectCardType } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function ProjectCard(props: ProjectCardType) {
  const hasBio = props.bio && props.bio.trim().length > 0;
  const hasSkills = props.skills && props.skills.length > 0;

  return (
    <div className="w-[197px] h-[218px] bg-[#FAFAFA] shadow-md hover:shadow-lg transition-all duration-300 flex flex-col border border-[#31A7AC] overflow-hidden" style={{ borderRadius: '8.5px' }}>
      {/* Profile Picture - Centered at top */}
      <div className="flex justify-center items-center pt-4 pb-2">
        <div className="relative h-[52px] w-[52px] rounded-full overflow-hidden bg-gray-200 shadow-md flex-shrink-0">
          <Image
            src={props.image || "/image (1).png"}
            alt={props.name}
            fill
            sizes="52px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="px-3 pb-3 flex flex-col flex-1">
        {/* Name - Centered, bold */}
        <h1 className="text-[13px] font-bold text-gray-900 leading-tight mb-1 text-center">
          {props.name}
        </h1>

        {/* Location - Centered */}
        <div className="flex items-center justify-center gap-1 text-gray-600 mb-2">
          <MapPin strokeWidth={1.5} className="w-3 h-3 flex-shrink-0" />
          <p className="text-[10px]">{props.location}</p>
        </div>

        {/* Bio - Left-aligned, limited height */}
        <div className="w-full mb-2">
          <p className="text-left text-gray-600 text-[10px] leading-snug line-clamp-2">
            {hasBio ? props.bio : "No bio available"}
          </p>
        </div>

        {/* Skills/Roles - Left-aligned, wrapping layout */}
        <div className="w-full mt-auto">
          <div className="flex flex-wrap gap-1 items-start">
            {hasSkills ? (
              props.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-[#31A7AC] bg-white border border-[#31A7AC] text-[9px] font-medium px-2 py-1 rounded-md whitespace-nowrap"
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
