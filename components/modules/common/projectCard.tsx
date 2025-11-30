import { ProjectCardType } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function ProjectCard(props: ProjectCardType) {
  const hasBio = props.bio && props.bio.trim().length > 0;
  const hasSkills = props.skills && props.skills.length > 0;

  return (
    <div className="w-[320px] h-[380px] bg-white shadow-md rounded-2xl mx-auto hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 group">
      {/* Header Image - 40-45% of card height */}
      <div className="relative h-[170px] w-full flex-shrink-0">
        <Image
          src={props.banner || "/bg.jpg"}
          alt={`Banner image for ${props.name}`}
          fill
          sizes="320px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Profile Picture - Overlapping background */}
      <div className="flex justify-start items-start -mt-[55px] relative z-10 px-5">
        <div className="relative h-[110px] w-[110px] rounded-full border-4 border-white overflow-hidden bg-white shadow-md flex-shrink-0">
          <Image
            src={props.image || "/image (1).png"}
            alt={props.name}
            fill
            sizes="110px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content Area - Left-aligned layout */}
      <div className="px-5 pt-4 pb-5 flex flex-col flex-1">
        {/* Name - Left aligned, bold */}
        <h1 className="text-[20px] font-bold text-gray-900 leading-tight mb-2">
          {props.name}
        </h1>

        {/* Location - Left aligned */}
        <div className="flex items-center gap-1.5 text-gray-600 mb-4">
          <MapPin strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
          <p className="text-[15px]">{props.location}</p>
        </div>

        {/* Bio - Left-aligned, grows to fill space */}
        <div className="w-full mb-4 flex-1">
          <p className="text-left text-gray-600 text-[14px] leading-relaxed line-clamp-3">
            {hasBio ? props.bio : "No bio available"}
          </p>
        </div>

        {/* Skills/Roles - Left-aligned, wrapping layout */}
        <div className="w-full">
          <div className="flex flex-wrap gap-2 items-center">
            {hasSkills ? (
              props.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-[#31A7AC] bg-white border-2 border-[#31A7AC] text-[14px] font-medium px-4 py-2 rounded-xl whitespace-nowrap"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-[14px] italic">No roles</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
