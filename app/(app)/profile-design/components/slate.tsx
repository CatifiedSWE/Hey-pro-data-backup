"use client";
import { Separator } from "@/components/ui/separator";
import { Ellipsis, Heart, MessageCircle, Send } from "lucide-react";
import Image from "next/image";
import React from "react";
export default function SlateView() {
    interface Slate {
        id: string,
        profileAvtar: string,
        profileName: string,
        role: string,
        totlerole: string,
        noLike: number,
        noComment: number,
        description: string
        slateSrc?: string

    }
    const slate: Slate[] = [
        {
            id: "1",
            profileAvtar: "/Image (1).png",
            profileName: "Jone Dev",
            role: "Cinematographer",
            totlerole: "15 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            id: "2",
            profileAvtar: "/Image (2).png",
            profileName: "Jone Dev",
            role: "Cinematographer",
            totlerole: "15 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            id: "3",
            profileAvtar: "/Image (3).png",
            profileName: "Jone Dev",
            role: "Cinematographer",
            totlerole: "15 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        },
        {
            id: "4",
            profileAvtar: "/slate.png",
            profileName: "Jone Dev",
            role: "Cinematographer",
            totlerole: "15 Roles",
            noLike: 10000,
            noComment: 1000,
            slateSrc: "/slate.png",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        }

    ]
    return (
        <div className="mt-3 space-y-6">
            {slate.map((item) => (
                <SlateCard
                    key={item.id}
                    profileAvtar={item.profileAvtar}
                    profileName={item.profileName}
                    role={item.role}
                    totlerole={item.totlerole}
                    noLike={item.noLike}
                    noComment={item.noComment}
                    description={item.description}
                    slateSrc={item.slateSrc}
                />
            ))}
        </div>
    );
}


function SlateCard({ profileAvtar,
    profileName,
    role,
    totlerole,
    description,
    slateSrc
}: {
    profileAvtar: string,
    profileName: string,
    role: string,
    totlerole: string,
    noLike: number,
    noComment: number,
    description: string,
    slateSrc?: string
}) {
    return (
        <div className=" w-[600px] rounded-3xl  bg-white p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center">
                    <Image
                        src={profileAvtar}
                        alt={profileName}
                        height={200}
                        width={200}
                        className="w-11 h-11 rounded-full mr-4 object-cover"
                    />
                    <div>
                        <h2 className="text-lg font-semibold">{profileName}</h2>
                        <p className="text-sm text-gray-600">{role} + {totlerole}</p>
                    </div>
                </div>
                <div>
                    <Ellipsis className="h-6 w-6 text-slate-500" />
                </div>
            </div>
            {slateSrc && (
                <div className="mb-5 overflow-hidden rounded-3xl">
                    <Image
                        src={slateSrc}
                        alt={profileName}
                        width={800}
                        height={600}
                        className="h-auto w-full max-h-[560px] object-cover"
                    />
                </div>
            )}
            <div className="mb-4 flex flex-row gap-4 text-slate-600">
                <Heart className="h-6 w-6" />
                <MessageCircle className="h-6 w-6" />
                <Send className="h-6 w-6" />
            </div>
            <DescriptionWithShowMore description={description} />
            <Separator />

        </div>
    );
}

function DescriptionWithShowMore({ description }: { description: string }) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const shouldTruncate = description.length > 150;
    const displayedDescription = isExpanded || !shouldTruncate
        ? description
        : description.slice(0, 200) + '...';

    return (
        <div className="mb-4">
            <p className="text-gray-700 mb-1 text-[12px]">{displayedDescription}</p>
            {shouldTruncate && (
                <button
                    onClick={toggleExpand}
                    className="text-[12px]"
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            )}
        </div>
    );
}