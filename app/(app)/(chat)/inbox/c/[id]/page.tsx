"use client";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, EllipsisVertical, Paperclip, Send } from "lucide-react";
import { getChatUser, getMessagesBetweenUsers } from "@/data/chatMessage";
import Image from "next/image";
import Link from "next/link";

type paramsType = { id: string };

export default function MessageInbox({ params }: { params: paramsType }) {
    const { id } = params;

    // Refs for auto-scrolling
    const scrollRef = useRef<HTMLDivElement>(null);

    // Simulate current user
    const currentUser = {
        messageId: "msg-1",
        name: "You",
        image: "/image (2).png",
        state: "online",
    };

    // Get chat user and messages
    const chatUser = getChatUser(id);

    const initialMessages = chatUser
        ? getMessagesBetweenUsers(currentUser.messageId, chatUser.messageId)
        : [];

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState(initialMessages);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const handleSend = () => {
        if (message.trim().length === 0 || !chatUser) return;
        const newMsg = {
            id: `messageId-${messages.length + 1}`,
            senderId: currentUser.messageId,
            receiverId: chatUser.messageId,
            timestamp: new Date().toISOString(),
            content: message,
            status: "sending",
        };
        setMessages([...messages, newMsg]);
        setMessage("");

        setTimeout(() => {
            setMessages((msgs) =>
                msgs.map((msg) =>
                    msg.id === newMsg.id ? { ...msg, status: "sent" } : msg
                )
            );
        }, 800);
    };

    return (
        <div className="w-full  flex flex-col bg-white overflow-hidden relative sm:h-[calc(100vh-80px)] h-[calc(100vh-80px)]">

            {/* Header - Fixed Height */}
            <div className="shrink-0 w-full flex flex-row justify-between items-center px-4 sm:px-6 bg-[#F8F8F8] border-b border-gray-100 h-[80px] z-10 relative">
                <div className="flex items-center gap-3 relative">
                    {/* Back Button only visible on Mobile */}
                    <Link href={"/inbox"} className="md:hidden flex p-2 -ml-2 rounded-full hover:bg-gray-200">
                        <ArrowLeft className="h-6 w-6 text-[#444444]" />
                    </Link>

                    <div className="relative">
                        <Image
                            src={chatUser?.image || "/default-profile.png"}
                            alt={chatUser?.name || "User Profile"}
                            width={45}
                            height={45}
                            className="rounded-full object-cover w-[45px] h-[45px]"
                        />
                        {chatUser?.state === 'online' && (
                            <span className="absolute right-0 bottom-0 block h-3 w-3 ring-2 ring-white rounded-full bg-[#34A353]" />
                        )}
                    </div>

                    <div className="flex flex-col">
                        <div className="text-black font-semibold text-[16px] sm:text-[18px] leading-tight">
                            {chatUser?.name || "User Name"}
                        </div>
                        <div className={`text-[12px] sm:text-[14px] font-medium ${chatUser?.state === 'online' ? 'text-[#34A353]' : 'text-gray-500'}`}>
                            {chatUser?.state || "Online"}
                        </div>
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-gray-200">
                    <EllipsisVertical className="text-[#444444]" />
                </button>
            </div>

            {/* Messages Area - Grow to fill space */}
            {/* Added min-h-0 to allow flex child to scroll properly */}
            <div
                ref={scrollRef}
                className="flex-1 min-h-0 w-full overflow-y-auto px-2 sm:px-4 py-6 bg-white no-scrollbar"
            >
                <div className="mx-auto w-full max-w-3xl flex flex-col">
                    {messages.map((msg, index) => {
                        const isSender = msg.senderId === currentUser.messageId;
                        const prevMsg = messages[index - 1];
                        const nextMsg = messages[index + 1];

                        const isPrevSameSender = prevMsg && prevMsg.senderId === msg.senderId;
                        const isNextSameSender = nextMsg && nextMsg.senderId === msg.senderId;

                        // Spacing logic
                        const marginBottom = isNextSameSender ? "mb-[2px]" : "mb-6";

                        // Border Radius Logic
                        let borderRadiusClass = "rounded-[18px]";
                        if (isSender) {
                            if (isNextSameSender && !isPrevSameSender) borderRadiusClass = "rounded-[18px] rounded-br-none";
                            else if (isPrevSameSender && isNextSameSender) borderRadiusClass = "rounded-[18px] rounded-tr-none rounded-br-none";
                            else if (isPrevSameSender && !isNextSameSender) borderRadiusClass = "rounded-[18px] rounded-tr-none";
                        } else {
                            if (isNextSameSender && !isPrevSameSender) borderRadiusClass = "rounded-[18px] rounded-bl-none";
                            else if (isPrevSameSender && isNextSameSender) borderRadiusClass = "rounded-[18px] rounded-tl-none rounded-bl-none";
                            else if (isPrevSameSender && !isNextSameSender) borderRadiusClass = "rounded-[18px] rounded-tl-none";
                        }

                        const showTime = !nextMsg || nextMsg.timestamp !== msg.timestamp || !isNextSameSender;
                        const formattedTime = format(new Date(msg.timestamp), "h:mm a");

                        return (
                            <div key={msg.id || index} className={`flex w-full flex-col ${isSender ? 'items-end' : 'items-start'} ${marginBottom}`}>
                                <div
                                    className={`
                                        max-w-[85%] sm:max-w-[65%] px-5 py-3 text-[14px] leading-relaxed break-words
                                        ${borderRadiusClass} 
                                        ${isSender
                                            ? 'bg-[#F2F2F2] text-[#181818]'
                                            : 'bg-[#31A7AC] text-white'
                                        }
                                    `}
                                >
                                    {msg.content}
                                </div>
                                {showTime && (
                                    <span className={`text-[11px] text-gray-400 mt-1 px-1 ${isSender ? 'text-right' : 'text-left'}`}>
                                        {formattedTime}
                                        {isSender && msg.status === "sending" && " • Sending..."}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Input Bar - Fixed at Bottom */}
            <div className="shrink-0 w-full bg-white px-4 pb-4 pt-2 z-10 relative">
                <div className="mx-auto w-full max-w-3xl bg-[#F0F0F0] border border-[#FA596E] rounded-full flex items-center gap-2 p-1 pl-4 h-[56px] shadow-sm">
                    <Input
                        placeholder="Message ..."
                        className="border-none shadow-none text-[15px] font-normal flex-1 focus-visible:ring-0 px-0 bg-transparent placeholder:text-gray-500"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                    />
                    <div className="flex items-center gap-1 pr-1 shrink-0">
                        <Button
                            className="h-10 w-10 rounded-full flex items-center justify-center bg-[#FA596E] hover:bg-[#fa4059] transition-colors p-0"
                            type="button"
                        >
                            <Paperclip className="text-white h-5 w-5" />
                        </Button>
                        <Button
                            className="h-10 w-10 rounded-full flex items-center justify-center bg-[#FA596E] hover:bg-[#fa4059] transition-colors p-0"
                            type="button"
                            onClick={handleSend}
                        >
                            <Send className="text-white h-5 w-5 ml-0.5" />
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    );
}