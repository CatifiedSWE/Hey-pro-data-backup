import { ProjectCardType } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function ProjectCard(props: ProjectCardType) {
  return (
    <div className="w-full max-w-[320px] h-[26rem] bg-[#FAFAFA] shadow-lg rounded-2xl mx-auto hover:shadow-xl transition-shadow">
      <div className="relative h-[12.5rem] w-full">
        <Image
          src={props.banner || "/bg.jpg"}
          alt={`Banner image for ${props.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-t-2xl object-cover"
        />
      </div>
      <div className="flex justify-center items-center -mt-12 mx-auto relative z-10">
        <div className="relative h-[96px] w-[96px] rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
            <Image
            src={props.image || "/image (1).png"}
            alt={props.name}
            fill
            sizes="96px"
            className="object-cover"
            />
        </div>
      </div>
      <div className="px-4 pt-2">
        <div className="flex flex-col justify-center items-center space-y-1">
          <h1 className="text-lg font-semibold text-center">{props.name}</h1>
        </div>
        <div className="flex justify-center items-center space-x-1 text-gray-500 mt-1">
          <MapPin strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{props.location}</p>
        </div>

        <p className="block w-full text-gray-600 mt-3 mb-2 text-center px-1 text-sm line-clamp-2">
          {props.bio}
        </p>

        <div className="w-full flex flex-wrap gap-1.5 justify-center mt-3 h-[4.5rem] overflow-hidden">
          {props.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-light-green text-xs font-medium px-3 py-1 border border-light-green rounded-full"
            >
              {skill}
            </span>
          ))}
          {props.skills.length > 3 && (
             <span className="text-gray-400 text-xs font-medium px-3 py-1">
                +{props.skills.length - 3}
             </span>
          )}
        </div>
      </div>
    </div>
  );
}
