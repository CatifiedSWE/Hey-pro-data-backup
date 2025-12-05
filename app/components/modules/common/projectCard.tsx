import { ProjectCardType } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";

interface ProjectCardProps extends ProjectCardType {
  onClick?: () => void;
  userId?: string;
}

export default function ProjectCard(props: ProjectCardProps) {
  const hasBio = props.bio && props.bio.trim().length > 0;
  const hasSkills = props.skills && props.skills.length > 0;

  return (
    <div 
      className="w-full h-[218px] bg-white shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 min-w-0 cursor-pointer" 
      style={{ borderRadius: '8.5px' }}
      data-testid="profile-card"
      onClick={props.onClick}
    >
      {/* Banner Image at top */}
      <div className="relative h-[70px] w-full flex-shrink-0 bg-gray-100">
        <Image
          src={props.banner || "/bg.jpg"}
          alt={`Banner image for ${props.name}`}
          fill
          sizes="(max-width: 768px) 50vw, 197px"
          className="object-cover"
        />
      </div>

      {/* Profile Picture - Centered, overlapping banner */}
      <div className="flex justify-center items-center -mt-[26px] relative z-10">
        <div className="relative h-[52px] w-[52px] rounded-full overflow-hidden bg-white shadow-sm flex-shrink-0 border-[2px] border-white">
          <Image
            src={props.image || "/default-profile.png"}
            alt={props.name}
            fill
            sizes="52px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="px-1.5 pt-1 pb-2 flex flex-col flex-1 min-w-0">
        {/* Name - Centered, bold */}
        <h1 className="text-[13px] font-bold text-gray-900 leading-tight mb-0.5 text-center truncate w-full px-1">
          {props.name}
        </h1>

        {/* Location - Centered */}
        <div className="flex items-center justify-center gap-0.5 text-gray-500 mb-1.5 w-full">
           <MapPin className="w-3 h-3 flex-shrink-0" />
          <p className="text-[10px] truncate max-w-full px-1">{props.location}</p>
        </div>

        {/* Bio - Left-aligned, limited height */}
        <div className="w-full mb-auto px-1">
          <p className="text-center text-gray-600 text-[10px] leading-snug line-clamp-2">
            {hasBio ? props.bio : "No bio available"}
          </p>
        </div>

        {/* Skills/Roles - Centered/Wrapped */}
        <div className="w-full mt-1.5 px-0.5">
          <div className="flex flex-wrap gap-1 justify-center">
            {hasSkills ? (
              props.skills.slice(0, 2).map((skill) => (
                <span
                  key={skill}
                  className="text-[#31A7AC] bg-[#F0FDFA] border border-[#31A7AC]/30 text-[9px] font-medium px-1.5 py-0.5 rounded-[4px] whitespace-nowrap truncate max-w-full"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-[9px] italic">No roles</span>
            )}
             {hasSkills && props.skills.length > 2 && (
                <span className="text-gray-400 text-[9px] py-0.5">+</span>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
