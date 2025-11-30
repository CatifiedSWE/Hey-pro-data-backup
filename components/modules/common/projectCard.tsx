import { ProjectCardType } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function ProjectCard(props: ProjectCardType) {
  const hasBio = props.bio && props.bio.trim().length > 0;
  const hasSkills = props.skills && props.skills.length > 0;

  return (
    <div className="w-full max-w-[340px] h-[440px] bg-white shadow-lg rounded-3xl mx-auto hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden border border-gray-100 group">
      {/* Header Image */}
      <div className="relative h-[150px] w-full flex-shrink-0">
        <Image
          src={props.banner || "/bg.jpg"}
          alt={`Banner image for ${props.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Profile Picture */}
      <div className="flex justify-center items-start -mt-[55px] relative z-10">
        <div className="relative h-[110px] w-[110px] rounded-full border-[5px] border-white overflow-hidden bg-white shadow-md flex-shrink-0">
          <Image
            src={props.image || "/image (1).png"}
            alt={props.name}
            fill
            sizes="110px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 pt-4 pb-8 flex flex-col flex-1 items-center">
        {/* Name */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2 leading-tight tracking-tight">
            {props.name}
        </h1>

        {/* Location */}
        <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-5">
          <MapPin strokeWidth={2} className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm font-medium">{props.location}</p>
        </div>

        {/* Bio */}
        <div className="w-full mb-6 flex items-start justify-center min-h-[44px]">
          <p className="text-center text-gray-600 text-sm line-clamp-2 leading-relaxed w-full">
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
                    className="text-light-green border border-light-green text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap bg-white hover:bg-light-green/5 transition-colors"
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
