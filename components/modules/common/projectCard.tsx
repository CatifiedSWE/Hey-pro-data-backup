import { ProjectCardType } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function ProjectCard(props: ProjectCardType) {
  const hasBio = props.bio && props.bio.trim().length > 0;
  const hasSkills = props.skills && props.skills.length > 0;

  return (
    <div className="w-full max-w-[320px] h-[340px] bg-[#FAFAFA] shadow-lg rounded-2xl mx-auto hover:shadow-xl transition-shadow flex flex-col">
      {/* Header Image - Fixed Height */}
      <div className="relative h-[140px] w-full flex-shrink-0">
        <Image
          src={props.banner || "/bg.jpg"}
          alt={`Banner image for ${props.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-t-2xl object-cover"
        />
      </div>

      {/* Profile Picture - Overlapping */}
      <div className="flex justify-center items-start -mt-[40px] mx-auto relative z-10">
        <div className="relative h-[80px] w-[80px] rounded-full border-4 border-white overflow-hidden bg-white shadow-md flex-shrink-0">
          <Image
            src={props.image || "/image (1).png"}
            alt={props.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content Area - Fixed spacing */}
      <div className="px-4 pb-3 pt-2 flex flex-col flex-1">
        {/* Name - Always same position */}
        <div className="flex flex-col items-center mb-1">
          <h1 className="text-base font-semibold text-center leading-tight">{props.name}</h1>
        </div>

        {/* Location - Always same position */}
        <div className="flex justify-center items-center gap-1 text-gray-500 mb-2">
          <MapPin strokeWidth={1.5} className="w-3.5 h-3.5 flex-shrink-0" />
          <p className="text-xs text-center">{props.location}</p>
        </div>

        {/* Bio Section - Fixed height */}
        <div className="w-full h-[40px] mb-2 flex items-start justify-center">
          <p className="w-full text-gray-600 text-center text-xs line-clamp-2">
            {hasBio ? props.bio : "No bio"}
          </p>
        </div>

        {/* Skills Section - Fixed height */}
        <div className="w-full h-[50px] flex flex-wrap gap-1 justify-center content-start">
          {hasSkills ? (
            <>
              {props.skills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-light-green text-[10px] font-medium px-2.5 py-0.5 border border-light-green rounded-full whitespace-nowrap h-fit"
                >
                  {skill}
                </span>
              ))}
              {props.skills.length > 3 && (
                <span className="text-gray-400 text-[10px] font-medium px-2.5 py-0.5 whitespace-nowrap h-fit">
                  +{props.skills.length - 3}
                </span>
              )}
            </>
          ) : (
            <span className="text-gray-400 text-xs">No role</span>
          )}
        </div>
      </div>
    </div>
  );
}
