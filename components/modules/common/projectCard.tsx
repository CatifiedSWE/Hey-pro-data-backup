import { ProjectCardType } from "@/types";
import { MapPin } from "lucide-react";
import Image from "next/image";

export default function ProjectCard(props: ProjectCardType) {
  return (
    <div className="w-80 h-[26rem] bg-[#FAFAFA] shadow-xl rounded-2xl">
      <div className="relative h-[12.5rem] w-full">
        <Image
          src={props.banner || "/bg.jpg"}
          alt={`Banner image for ${props.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-t-2xl object-cover"
        />
      </div>
      <div className="flex justify-center items-center -mt-10 mx-auto relative z-10">
        <div className="relative h-[100px] w-[100px] rounded-full border-4 border-white overflow-hidden bg-white">
            <Image
            src={props.image || "/image (1).png"}
            alt={props.name}
            fill
            sizes="100px"
            className="object-cover"
            />
        </div>
      </div>
      <div className="px-2">
        <div className="flex flex-col justify-center items-center mt-2 space-y-2">
          <h1 className="text-lg font-semibold">{props.name}</h1>
        </div>
        <div className="flex justify-center items-center space-x-1 text-gray-500">
          <MapPin strokeWidth={1.2} absoluteStrokeWidth className="w-4 h-4" />
          <p className="text-sm">{props.location}</p>
        </div>

        <p className="block w-full text-gray-500 my-1 text-start px-2 text-sm line-clamp-2">
          {props.bio}
        </p>

        <div className="w-full flex flex-wrap gap-1 p-2 h-[4.5rem] overflow-hidden">
          {props.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-light-green text-xs font-medium px-2 py-0.5 border border-light-green rounded-sm"
            >
              {skill}
            </span>
          ))}
          {props.skills.length > 3 && (
             <span className="text-gray-400 text-xs font-medium px-2 py-0.5">
                +{props.skills.length - 3}
             </span>
          )}
        </div>
      </div>
    </div>
  );
}
