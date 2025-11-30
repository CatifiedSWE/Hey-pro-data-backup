import { ProjectCardType } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function ProjectCard(props: ProjectCardType) {
  const hasBio = props.bio && props.bio.trim().length > 0;
  const hasSkills = props.skills && props.skills.length > 0;

  return (
    <div className="w-full max-w-[300px] h-[520px] bg-white shadow-lg rounded-2xl mx-auto hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 group">
      {/* Header Image */}
      <div className="relative h-[180px] w-full flex-shrink-0">
        <Image
          src={props.banner || "/bg.jpg"}
          alt={`Banner image for ${props.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Profile Picture */}
      <div className="flex justify-center items-start -mt-[50px] relative z-10">
        <div className="relative h-[100px] w-[100px] rounded-full border-[4px] border-white overflow-hidden bg-white shadow-sm flex-shrink-0">
          <Image
            src={props.image || "/image (1).png"}
            alt={props.name}
            fill
            sizes="100px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 pt-3 pb-6 flex flex-col flex-1 items-center">
        {/* Name */}
        <h1 className="text-[22px] leading-tight text-gray-900 mb-1 text-center font-medium font-poppins">
            {props.name}
        </h1>

        {/* Location */}
        <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-4">
          <MapPin strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-normal">{props.location}</p>
        </div>

        {/* Bio */}
        <div className="w-full mb-6 flex items-start justify-center min-h-[60px]">
          <p className="text-center text-gray-600 text-sm line-clamp-3 leading-relaxed w-full font-light px-2">
            {hasBio ? props.bio : "No bio available"}
          </p>
        </div>

        {/* Skills/Roles */}
        <div className="w-full mt-auto">
            <div className="flex flex-wrap gap-2 justify-center items-center">
            {hasSkills ? (
                <>
                {props.skills.slice(0, 3).map((skill) => (
                    <span
                    key={skill}
                    className="text-[#31A7AC] border border-[#31A7AC] text-sm font-normal px-3 py-1.5 rounded-lg whitespace-nowrap bg-white hover:bg-[#31A7AC]/5 transition-colors"
                    >
                    {skill}
                    </span>
                ))}
                {props.skills.length > 3 && (
                    <span className="text-gray-400 text-xs font-medium ml-1">
                    +{props.skills.length - 3}
                    </span>
                )}
                </>
            ) : (
                <span className="text-gray-400 text-sm italic">No roles specified</span>
            )}
            </div>
        </div>
      </div>
    </div>
  );
}
