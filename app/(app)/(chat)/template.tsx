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

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {


    return (
        <>
            <div className="max-w-7xl mx-auto overflow-hidden flex flex-col gap-6 ">
                <span className="hidden p-2 md:inline-block bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-semibold">Message</span>

                <div className="flex flex-row justify-center items-center mx-auto">
                    <div className={`flex flex-col gap-4 overflow-hidden bg-white/50 p-4`}>
                        {/*  */}
                        <div
                            className="flex flex-col gap-6 border w-[265px] h-[546px] rounded-[25px] p-[1px] "
                            style={{
                                background: "linear-gradient(90deg, #FA6E80 0%, #6A89BE 41.52%, #85AAB7 62.27%, #31A7AC 103.79%)",
                                borderRadius: "px",
                                paddingTop: "0px",
                                paddingBottom: "0px",
                                WebkitMaskComposite: "xor",
                                maskComposite: "exclude",
                            }}
                        >
                            <div className="flex flex-col h-full w-full bg-white rounded-[24px]">
                                <Tabs defaultValue="chat" className=" ">
                                    <TabsList className="flex flex-row sm:w-[245px] gap-2 mx-auto mt-4">
                                        <TabsTrigger
                                            value="chat"
                                            className="flex-1 flex justify-center items-center px-[25px] py-[10px] h-[47px] rounded-[20px] border-none cursor-pointer bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]"
                                        >
                                            <span className="font-medium text-[18px] leading-[27px] text-white">
                                                Chats
                                            </span>
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="groups"
                                            className="flex-1 flex justify-center items-center px-[25px] py-[10px] h-[47px] rounded-[20px] cursor-pointer border-none relative bg-white"
                                        >
                                            <span className="font-medium text-[18px] leading-[27px] text-black z-10">
                                                Groups
                                            </span>
                                            <span
                                                className="absolute inset-0 rounded-[20px] pointer-events-none"
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
                                    <TabsContent value="chat">
                                        <div className="flex flex-col items-start gap-[5px] w-full overflow-y-auto h-[460px] rounded-[20px] no-scrollbar">
                                            {chatData.map((chat, index) => (
                                                <React.Fragment key={index}>
                                                    <Link href={`/inbox/c/${chat.messageId}`} className="flex flex-row items-center p-[10px] gap-[19px] w-full h-[61px] rounded-[10px] hover:bg-white transition-colors cursor-pointer">
                                                        <Image
                                                            src={chat.image}
                                                            alt={chat.name}
                                                            className="w-[40px] h-[41px] rounded-full object-cover bg-[#D9D9D9]"
                                                            width={40}
                                                            height={40}
                                                        />
                                                        <div className="flex flex-row items-center gap-[7px] flex-1">
                                                            <div className="flex flex-col justify-center items-start gap-[1px] w-[145px]">
                                                                <span className="w-full font-medium text-[16px] leading-[24px] text-black truncate">
                                                                    {chat.name}
                                                                </span>
                                                                <span className="w-full font-medium text-[10px] leading-[15px] text-[#444444] truncate">
                                                                    {chat.message}
                                                                </span>
                                                            </div>
                                                            {chat.badge && (
                                                                <div className="w-[20px] h-[20px] bg-[#31A7AC] border-2 border-white rounded-full flex items-center justify-center">
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
                                    <TabsContent value="groups">
                                        <div className="flex flex-col items-start gap-[5px] w-full h-[460px] rounded-[20px] overflow-y-auto no-scrollbar">
                                            {Groups.map((chat, index) => (
                                                <React.Fragment key={index}>
                                                    <Link href={`/inbox/g/${chat.messageId}`} className="flex flex-row items-center p-[10px] gap-[19px] w-full h-[66px] rounded-[10px] hover:bg-white transition-colors cursor-pointer">
                                                        {Array.isArray(chat.image) ? (
                                                            <div className="flex -space-x-4">
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
                                                                className="w-[40px] h-[41px] rounded-full object-cover bg-[#D9D9D9]"
                                                                width={40}
                                                                height={40}
                                                            />
                                                        )}
                                                        <div className="flex flex-row items-center gap-[7px] flex-1">
                                                            <div className="flex flex-col justify-center items-start gap-[1px] w-[145px]">
                                                                <span className="w-full font-medium text-[16px] leading-[24px] text-black truncate">
                                                                    {chat.name}
                                                                </span>
                                                                <span className="w-full font-medium text-[10px] leading-[15px] text-[#444444] truncate">
                                                                    {chat.message}
                                                                </span>
                                                            </div>
                                                            {chat.badge && (
                                                                <div className="w-[20px] h-[20px] bg-[#31A7AC] border-2 border-white rounded-full flex items-center justify-center">
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
                                </Tabs>
                            </div>
                        </div>
                    </div>
                    <div
                        className="h-[546px] w-[689px] p-[2px] overflow-hidden rounded-[25px]"
                        style={{
                            background: "linear-gradient(90deg, #FA6E80 0%, #6A89BE 41.52%, #85AAB7 62.27%, #31A7AC 103.79%)",
                            paddingTop: "0px",
                            paddingBottom: "0px",
                            WebkitMaskComposite: "xor",
                            maskComposite: "exclude",
                            paddingLeft: "1px",
                            paddingRight: "1px",
                        }}
                    >
                        <div className="h-full w-full bg-[#F8F8F8] rounded-[25px]  overflow-hidden">
                            {children}
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}