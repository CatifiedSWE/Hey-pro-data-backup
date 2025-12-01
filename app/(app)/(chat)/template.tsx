"use client";
import Link from "next/link";
import React from "react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import Image from "next/image";

import { chatData, Groups } from '@/data/chatMessage';
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();

    // Logic to determine if a specific chat is open
    const isChatOpen = pathname?.includes('/inbox/c/') || pathname?.includes('/inbox/g/');

    return (
        <div className="w-full h-screen bg-[#F8F8F8] md:bg-white overflow-hidden flex flex-col md:flex-row justify-center items-stretch gap-4 p-0 md:p-6 max-w-[1600px] mx-auto">

            {/* SIDEBAR SECTION 
              - Hidden on Mobile if a chat is open
              - Always Block/Flex on Desktop (md:flex)
            */}
            <div
                className={`${isChatOpen ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-[400px] lg:w-[450px] shrink-0 h-full sm:h-[calc(100vh-100px)]`}
            >
                <div
                    className="flex flex-col gap-6 border w-full h-full bg-white/70 md:bg-white/40 md:backdrop-blur-[10px] rounded-none md:rounded-[25px] p-[1px] shadow-lg"
                    style={{
                        background: "linear-gradient(90deg, #FA6E80 0%, #6A89BE 41.52%, #85AAB7 62.27%, #31A7AC 103.79%)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                    }}
                >
                    <div className="flex flex-col h-full w-full bg-white rounded-none md:rounded-[24px] shadow-md overflow-hidden">
                        <Tabs defaultValue="chat" className="w-full h-full sm:w-[] flex flex-col">

                            {/* Tabs Header */}
                            <div className="p-4 shrink-0">
                                <TabsList className="flex flex-row w-full gap-2 mx-auto sm:w-96">
                                    <TabsTrigger
                                        value="chat"
                                        className="flex-1 flex justify-center items-center px-[25px] py-[10px] h-[47px] rounded-[20px] cursor-pointer border-none relative bg-white data-[state=active]:bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]"
                                    >
                                        <span className="font-medium text-[18px] leading-[27px] text-black data-[state=active]:text-white z-10">
                                            Chats
                                        </span>
                                        {/* Gradient Border for inactive state */}
                                        <span
                                            className="absolute inset-0 rounded-[20px] pointer-events-none data-[state=active]:hidden"
                                            style={{
                                                padding: "1px",
                                                background: "linear-gradient(90deg, #FA6E80 0%, #6A89BE 41.52%, #85AAB7 62.27%, #31A7AC 103.79%)",
                                                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                                WebkitMaskComposite: "xor",
                                                maskComposite: "exclude",
                                            }}
                                        />
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="groups"
                                        className="flex-1 flex justify-center items-center px-[25px] py-[10px] h-[47px] rounded-[20px] cursor-pointer border-none relative bg-white data-[state=active]:bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]"
                                    >
                                        <span className="font-medium text-[18px] leading-[27px] text-black data-[state=active]:text-white z-10">
                                            Groups
                                        </span>
                                        <span
                                            className="absolute inset-0 rounded-[20px] pointer-events-none data-[state=active]:hidden"
                                            style={{
                                                padding: "1px",
                                                background: "linear-gradient(90deg, #FA6E80 0%, #6A89BE 41.52%, #85AAB7 62.27%, #31A7AC 103.79%)",
                                                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                                WebkitMaskComposite: "xor",
                                                maskComposite: "exclude",
                                            }}
                                        />
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Chat List Scrollable Area */}
                            <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-4 sm:mb-0 mb-30">
                                <TabsContent value="chat" className="mt-0">
                                    <div className="flex flex-col items-start gap-[5px] w-full">
                                        {chatData.map((chat, index) => (
                                            <React.Fragment key={index}>
                                                <Link href={`/inbox/c/${chat.messageId}`} className="flex flex-row items-center p-[10px] gap-[19px] w-full h-[70px] rounded-[10px] hover:bg-gray-50 transition-colors cursor-pointer">
                                                    <Image
                                                        src={chat.image}
                                                        alt={chat.name}
                                                        className="w-[48px] h-[48px] rounded-full object-cover bg-[#D9D9D9] shrink-0"
                                                        width={48}
                                                        height={48}
                                                    />
                                                    <div className="flex flex-row items-center gap-[7px] flex-1 min-w-0">
                                                        <div className="flex flex-col justify-center items-start gap-[1px] flex-1 min-w-0">
                                                            <span className="w-full font-medium text-[16px] leading-[24px] text-black truncate">
                                                                {chat.name}
                                                            </span>
                                                            <span className="w-full font-medium text-[12px] leading-[15px] text-[#444444] truncate">
                                                                {chat.message}
                                                            </span>
                                                        </div>
                                                        {chat.badge && (
                                                            <div className="w-[20px] h-[20px] bg-[#31A7AC] border-2 border-white rounded-full flex items-center justify-center shrink-0">
                                                                <span className="font-medium text-[10px] leading-[15px] text-white">
                                                                    {chat.badge}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                                {index < chatData.length - 1 && (
                                                    <div className="w-full h-[1px] border-t border-[#CDCDCD]" />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </TabsContent>
                                <TabsContent value="groups" className="mt-0">
                                    <div className="flex flex-col items-start gap-[5px] w-full">
                                        {Groups.map((chat, index) => (
                                            <React.Fragment key={index}>
                                                <Link href={`/inbox/g/${chat.messageId}`} className="flex flex-row items-center p-[10px] gap-[19px] w-full h-[70px] rounded-[10px] hover:bg-gray-50 transition-colors cursor-pointer">
                                                    {Array.isArray(chat.image) ? (
                                                        <div className="flex -space-x-4 shrink-0">
                                                            {chat.image.slice(0, 2).map((imgSrc, imgIdx) => (
                                                                <Image
                                                                    key={imgIdx}
                                                                    src={imgSrc}
                                                                    alt={chat.name}
                                                                    className="w-[35px] h-[35px] rounded-full object-cover bg-[#D9D9D9] border-2 border-white"
                                                                    width={35}
                                                                    height={35}
                                                                />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <Image
                                                            src={chat.image}
                                                            alt={chat.name}
                                                            className="w-[40px] h-[41px] rounded-full object-cover bg-[#D9D9D9] shrink-0"
                                                            width={40}
                                                            height={40}
                                                        />
                                                    )}
                                                    <div className="flex flex-row items-center gap-[7px] flex-1 min-w-0">
                                                        <div className="flex flex-col justify-center items-start gap-[1px] flex-1 min-w-0">
                                                            <span className="w-full font-medium text-[16px] leading-[24px] text-black truncate">
                                                                {chat.name}
                                                            </span>
                                                            <span className="w-full font-medium text-[12px] leading-[15px] text-[#444444] truncate">
                                                                {chat.message}
                                                            </span>
                                                        </div>
                                                        {chat.badge && (
                                                            <div className="w-[20px] h-[20px] bg-[#31A7AC] border-2 border-white rounded-full flex items-center justify-center shrink-0">
                                                                <span className="font-medium text-[10px] leading-[15px] text-white">
                                                                    {chat.badge}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                                {index < Groups.length - 1 && (
                                                    <div className="w-full h-[1px] border-t border-[#CDCDCD]" />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT SECTION 
              - Hidden on Mobile if NO chat is open (root /inbox)
              - Always Flex on Desktop
            */}
            <div
                className={`${!isChatOpen ? 'hidden' : 'flex'} md:flex flex-1 w-full sm:h-[calc(100vh-100px)] h-full`}
            >
                <div
                    className="w-full h-full p-[1px] overflow-hidden rounded-none md:rounded-[25px] shadow-xl flex flex-col"
                    style={{
                        background: "linear-gradient(90deg, #FA6E80 0%, #6A89BE 41.52%, #85AAB7 62.27%, #31A7AC 103.79%)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                    }}
                >
                    <div className="flex-1 w-full h-full bg-[#F8F8F8] rounded-none md:rounded-[24px] overflow-hidden flex flex-col relative">
                        {children}
                    </div>
                </div>
            </div>

        </div>
    )
}