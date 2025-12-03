"use client"
import { Briefcase, CalendarDays, Edit, MapPin, Users } from "lucide-react";
import Image from "next/image";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button";

type JobType = {
    id: number;
    name: string;
    title: string;
    logo: string;
    expiryDate: string;
    description: string;
    location: string;
    requiredPositions: number;
    date: string;
    status: string;
    postedfor: string;
    rate: string;
    skills: string[];
    projectTimeLine: {
        "Pre-Production": string;
        "Production": string;
        "Post-Production": string;
        "Release": string;
    };
};

export default function GigDetails({ job }: { job: JobType }) {
    return (
        <div className="overflow-auto h-screen  max-w-7xl mx-auto">
            <div>
                <div className=" flex flex-row justify-between items-center">
                    <div className="flex flex-row gap-4 items-center">
                        {job.logo && job.logo.trim() !== "" ? (
                            <Image src={job.logo} height={100} width={100} alt="Company Logo" className=" h-12 w-12 rounded-full shadow" />
                        ) : (
                            <div className="h-12 w-12 rounded-full shadow bg-gray-200 flex items-center justify-center">
                                <Briefcase className="h-6 w-6 text-gray-500" />
                            </div>
                        )}
                        <h1 className="text-xl">{job.name}</h1>
                    </div>
                    <div>
                        <Button size={"icon"} variant={"link"} className="  text-white px-4 py-2 border hover:bg-none rounded-full bg-[#31A7AC] mt-2 mb-4"><Edit /></Button>
                    </div>
                </div>

                <div>
                    <h2 className="">{job.title}</h2>
                    Expiry Date:
                    <span className="text-[#FA6E80] font-semibold"> {job.expiryDate}</span>
                    <p className="">
                        {job.description}
                    </p>
                </div>
                <div className="flex flex-wrap my-2 gap-10 justify-start" >
                    <div className="flex items-center gap-6 text-gray-500 whitespace-nowrap">
                        <span><CalendarDays /></span>
                        <span>{job.date}</span>
                    </div>
                    <div className="flex items-center gap-6 text-gray-500 whitespace-nowrap">
                        <span><MapPin /></span>
                        <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-6 text-gray-500 whitespace-nowrap">
                        <span><Briefcase /> </span>
                        <span>GIG</span>
                    </div>
                </div>
                <div className=" flex flex-row gap-1 my-2 items-center">
                    <Users className="inline mr-2" />
                    <span className="  ">{job.requiredPositions}</span>
                    <span className=" "> peoples needed</span>

                </div>
                <div className="w-full flex flex-wrap gap-2 my-2">
                    <span className=" text-gray-500 font-semibold">Status:</span>
                    <span className=" text-[#31A7AC] ">{job.status}</span>
                </div>
                <div>
                    <Button variant={"outline"} className=" h-10 bg-transparent text-black px-4 py-2 border hover:bg-none rounded-lg mt-2 mb-4">Manage Crew Members</Button>
                </div>
                <div className="w-full h-[1px] bg-gray-300 mb-4" />
                <div>
                    <span className=" text-gray-500 font-semibold">Posted For:</span>
                    <span className=" text-[#FA6E80] font-semibold "> {job.postedfor}</span>
                </div>
                <div className="w-full h-[1px] bg-gray-300 mb-4 mt-4" />
                <div>
                    <span className=" text-gray-500 font-semibold">Rate the GIG :</span>
                    <span className=" text-[#FA6E80] font-semibold "> {job.rate}</span>
                </div>
                <div className="w-full h-[1px] bg-gray-300 mb-4 mt-4" />
                <div>
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full"
                        defaultValue="item-1"
                    >

                        <AccordionItem value="item-1">
                            <AccordionTrigger>Project Timeline</AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-4 text-balance">
                                {Object.entries(job.projectTimeLine).map(([key, value]) => (
                                    <div key={key} className="flex flex-row gap-2">
                                        <span className="text-gray-500 font-semibold">{key}:</span>
                                        <span>{value}</span>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>


            </div>
        </div>
    )
}
