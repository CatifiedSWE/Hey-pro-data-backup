import { ProjectCardType } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function ProjectCard(props: ProjectCardType) {
  const hasBio = props.bio && props.bio.trim().length > 0;
  const hasSkills = props.skills && props.skills.length > 0;

  return (
    <div className="w-full max-w-[280px] h-[280px] bg-white shadow-md rounded-2xl mx-auto hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 group">
      {/* Header Image - Reduced height for square aspect */}
      <div className="relative h-[85px] w-full flex-shrink-0">
        <Image
          src={props.banner || "/bg.jpg"}
          alt={`Banner image for ${props.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 280px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Profile Picture - Scaled down */}
      <div className="flex justify-center items-start -mt-[35px] relative z-10">
        <div className="relative h-[70px] w-[70px] rounded-full border-[3px] border-white overflow-hidden bg-white shadow-sm flex-shrink-0">
          <Image
            src={props.image || "/image (1).png"}
            alt={props.name}
            fill
            sizes="70px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content Area - Compact layout */}
      <div className="px-3 pt-1 pb-3 flex flex-col flex-1 items-center">
        {/* Name */}
        <h1 className="text-lg font-semibold text-gray-900 leading-tight text-center mb-0.5 font-poppins">
            {props.name}
        </h1>

        {/* Location */}
        <div className="flex items-center justify-center gap-1 text-gray-500 mb-2">
          <MapPin strokeWidth={1.5} className="w-3 h-3 flex-shrink-0" />
          <p className="text-xs text-gray-500">{props.location}</p>
        </div>

        {/* Bio - Limited to 2 lines, small text */}
        <div className="w-full mb-2 flex items-start justify-center h-[32px]">
          <p className="text-center text-gray-600 text-[11px] line-clamp-2 leading-tight w-full px-1">
            {hasBio ? props.bio : "No bio available"}
          </p>
        </div>

        {/* Skills/Roles - Compact tags */}
        <div className="w-full mt-auto">
            <div className="flex flex-wrap gap-1.5 justify-center items-center">
            {hasSkills ? (
                <>
                {props.skills.slice(0, 2).map((skill) => (
                    <span
                    key={skill}
                    className="text-[#31A7AC] border border-[#31A7AC] text-[10px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap bg-white"
                    >
                    {skill}
                    </span>
                ))}
                {props.skills.length > 2 && (
                    <span className="text-gray-400 text-[10px] font-medium ml-0.5">
                    +{props.skills.length - 2}
                    </span>
                )}
                </>
            ) : (
                <span className="text-gray-400 text-[10px] italic">No roles</span>
            )}
            </div>
        </div>
      </div>
    </div>
  );
}
