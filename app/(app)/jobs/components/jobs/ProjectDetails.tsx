"use client"
import { CalendarDays, Folder, MapPin } from "lucide-react";
import Image from "next/image";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button";

interface Job {
    id: number;
    name: string;
    title: string;
    logo: string;
    description: string;
    location: string;
    date: string;
    status: string;
    skills: string[];
    projectDetails: {
        [key: string]: string;
    };
    projectTimeLine: {
        [key: string]: string;
    };
    "terms&Conditions": string;
    location2: string;
}

interface ProjectDetailsProps {
    job: Job;
}

export default function ProjectDetails({ job }: ProjectDetailsProps) {
    return (
        <>
            <div className="overflow-auto h-screen  max-w-7xl mx-auto">
                <div>
                    <div className="flex flex-row gap-4 items-center">
                        {job.logo && job.logo.trim() !== "" ? (
                            <Image src={job.logo} height={100} width={100} alt="Company Logo" className=" h-12 w-12 rounded-full shadow" />
                        ) : (
                            <div className="h-12 w-12 rounded-full shadow bg-gray-200 flex items-center justify-center">
                                <Folder className="h-6 w-6 text-gray-500" />
                            </div>
                        )}
                        <h1 className="text-xl">{job.name}</h1>
                    </div>
                    <div>
                        <h2 className="">{job.title}</h2>
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
                            <span><Folder /> </span>
                            <span>Project</span>
                        </div>
                    </div>
                    <div className="w-full flex flex-wrap gap-2 my-4">
                        <span className=" text-gray-500 font-semibold">Status:</span>
                        <span className=" text-[#31A7AC] ">{job.status}</span>
                    </div>
                    <div>
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                            defaultValue="item-1"
                        >
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Project Details</AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4 text-balance">
                                    {Object.entries(job.projectDetails).map(([key, value]) => (
                                        <div key={key} className="flex flex-row gap-2">
                                            <span className="text-gray-500 font-semibold">{key}:</span>
                                            <span>{value}</span>
                                        </div>
                                    ))}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
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
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Return Policy</AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4 text-balance">
                                    <p>{job["terms&Conditions"]}</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                    <div className="w-full flex flex-wrap gap-2 my-4">
                        <span className=" text-gray-500 font-semibold">Project Gigs:</span>
                    </div>
                    <div className="w-full flex flex-wrap gap-5 my-4 px-5">
                        <div className="flex items-center gap-6 text-gray-500 whitespace-nowrap border-[1px] border-[#FA6E80] h-40 w-72 rounded-md">
                            <div className="flex flex-col justify-center items-center mx-auto">
                                <p className=" text-[#FA6E80] text-center">Add new role for<br /> the project</p>
                                <Button className="bg-[#FA6E80] text-white px-4 py-2 rounded-lg mt-2">Add GIG</Button>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 text-gray-500 whitespace-nowrap border-[1px] border-[#31A7AC] h-40 w-72 rounded-md">
                            <div className="flex flex-col justify-center items-center mx-auto">
                                <p className=" text-[#31A7AC]">Music Director</p>
                                <span>25 Applies</span>
                                <div className="flex flex-row gap-2 mt-2 ">
                                    <Button className="bg-transparent text-[#000000] white px-4 py-2 rounded-lg mt-2" variant={"outline"}>Shortlist</Button>
                                    <Button className="bg-[#31A7AC] text-white px-4 py-2 rounded-lg mt-2">Add GIG</Button>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-wrap gap-5 my-4 px-5">
                        <div className="flex items-center gap-6 text-gray-500 whitespace-nowrap bg-slate-100 h-30 w-72 rounded-md">
                            <div className="flex flex-col gap-5 w-full p-3 h-full text-sm">
                                <div className="flex flex-col">
                                    <p>Sarah Mitchell</p>
                                    <p>Director</p>
                                </div>
                                <div className="flex flex-row gap-2 text-[#FA596E]">
                                    <span><MapPin /></span>
                                    <span>{job.location2}</span>
                                </div>
                            </div>

                        </div>
                        <div className="flex items-center gap-6 text-gray-500 whitespace-nowrap bg-slate-100 h-30 w-72">
                            <div className="flex flex-col gap-5 w-full p-3 h-full text-sm">
                                <div className="flex flex-col">
                                    <p>James Rodriguez</p>
                                    <p>Producer</p>
                                </div>
                                <div className="flex flex-row gap-2 text-[#FA596E]">
                                    <span><MapPin /></span>
                                    <span>{job.location2}</span>
                                </div>
                            </div>


                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
