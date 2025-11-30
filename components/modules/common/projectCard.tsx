import { ProjectCardType } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function ProjectCard(props: ProjectCardType) {
  return (
    <div className="w-full max-w-[320px] bg-[#FAFAFA] shadow-lg rounded-2xl mx-auto hover:shadow-xl transition-shadow flex flex-col">
      <div className="relative h-[200px] w-full flex-shrink-0">
        <Image
          src={props.banner || "/bg.jpg"}
          alt={`Banner image for ${props.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-t-2xl object-cover"
        />
      </div>
      <div className="flex justify-center items-start -mt-[48px] mx-auto relative z-10 mb-3">
        <div className="relative h-[96px] w-[96px] rounded-full border-4 border-white overflow-hidden bg-white shadow-md flex-shrink-0">
            <Image
            src={props.image || "/image (1).png"}
            alt={props.name}
            fill
            sizes="96px"
            className="object-cover"
            />
        </div>
      </div>
      <div className="px-4 pb-4 flex flex-col flex-1">
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-semibold text-center leading-tight">{props.name}</h1>
        </div>
        <div className="flex justify-center items-center gap-1 text-gray-500 mt-2">
          <MapPin strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm text-center">{props.location}</p>
        </div>

        <p className="w-full text-gray-600 text-center text-sm line-clamp-2 mt-3 min-h-[2.5rem]">
          {props.bio || "\u00A0"}
        </p>

        <div className="w-full flex flex-wrap gap-1.5 justify-center mt-4">
          {props.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-light-green text-xs font-medium px-3 py-1 border border-light-green rounded-full whitespace-nowrap"
            >
              {skill}
            </span>
          ))}
          {props.skills.length > 3 && (
             <span className="text-gray-400 text-xs font-medium px-3 py-1 whitespace-nowrap">
                +{props.skills.length - 3}
             </span>
          )}
        </div>
      </div>
    </div>
  );
}
