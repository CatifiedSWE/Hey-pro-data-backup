"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EllipsisVertical, Paperclip, Send } from "lucide-react";
import { getChatUser, getMessagesBetweenUsers } from "@/data/chatMessage";
import Image from "next/image";
type paramsType = { id: string };
export default function MessageInbox({ params }: { params: paramsType }) {
    const { id } = params;
    // Simulate current user
    const currentUser = {
        messageId: "msg-1", // This should match your chatData for the current user
        name: "You",
        image: "/image (2).png",
        state: "online",
    };
    // Get chat user and messages
    const chatUser = getChatUser(id);
    // Get all messages between current user and chat user
    const initialMessages = chatUser
        ? getMessagesBetweenUsers(currentUser.messageId, chatUser.messageId)
        : [];
    // Message input state
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState(initialMessages);

    // Send message handler
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
        // Simulate sending delay
        setTimeout(() => {
            setMessages((msgs) =>
                msgs.map((msg) =>
                    msg.id === newMsg.id ? { ...msg, status: "sent" } : msg
                )
            );
        }, 800);
    };

    return (
        <div className="">
            <div className="min-h-[calc(485px)]">
                <div className="flex flex-row justify-between items-center mx-auto px-5 bg-[#F4F4F4] rounded-t-[25px] h-[80px]">
                    <div className=" flex items-center justify-start gap-3 relative">
                        <Image
                            src={chatUser?.image || "/default-profile.png"}
                            alt={chatUser?.name || "User Profile"}
                            width={45}
                            height={45}
                            className="rounded-full"
                        />
                        {chatUser?.state == 'online' && (
                            <span className="absolute left-9 bottom-1 block h-2 w-2 ring ring-white rounded-full bg-[#34A353]" />
                        )}
                        <div>
                            <div className="text-black font-medium text-lg ">
                                {chatUser?.name || "User Name"}
                            </div>
                            <div className={`${chatUser?.state === 'online' ? 'text-[#34A353]' : 'text-gray-500'} text-sm font-normal`}>
                                {chatUser?.state || "Online"}
                            </div>
                        </div>
                    </div>
                    <div>
                        <EllipsisVertical className=" text-black" />
                    </div>
                </div>
                {/* Chat messages */}
                <div className="">
                    <div className="mx-auto max-w-[675px] h-[calc(484px-90px)] overflow-y-auto flex flex-col px-4 py-6 bg-white no-scrollbar">
                        {messages.map((msg, index) => {
                            const isSender = msg.senderId === currentUser.messageId;
                            const prevMsg = messages[index - 1];
                            const nextMsg = messages[index + 1];

                            const isPrevSameSender = prevMsg && prevMsg.senderId === msg.senderId;
                            const isNextSameSender = nextMsg && nextMsg.senderId === msg.senderId;
                            const marginBottom = isNextSameSender ? "mb-1" : "mb-6";

                            let borderRadiusClass = "rounded-2xl";

                            if (isSender) {
                                if (isNextSameSender && !isPrevSameSender) {
                                    borderRadiusClass = "rounded-2xl rounded-br-none";
                                } else if (isPrevSameSender && isNextSameSender) {
                                    borderRadiusClass = "rounded-2xl rounded-tr-none rounded-br-none";
                                } else if (isPrevSameSender && !isNextSameSender) {
                                    borderRadiusClass = "rounded-2xl rounded-tr-none";
                                }
                            } else {
                                if (isNextSameSender && !isPrevSameSender) {
                                    borderRadiusClass = "rounded-2xl rounded-bl-none";
                                } else if (isPrevSameSender && isNextSameSender) {
                                    borderRadiusClass = "rounded-2xl rounded-tl-none rounded-bl-none";
                                } else if (isPrevSameSender && !isNextSameSender) {
                                    borderRadiusClass = "rounded-2xl rounded-tl-none";
                                }
                            }

                            // Show time only for last message in a group with same timestamp
                            const showTime = !nextMsg || nextMsg.timestamp !== msg.timestamp;
                            const formattedTime = format(new Date(msg.timestamp), "h:mm a");

                            return (
                                <div key={msg.id || index} className={`flex w-full flex-col ${isSender ? 'items-end' : 'items-start'} ${marginBottom}`}>
                                    <div
                                        className={`max-w-[50%] px-5 py-3 text-[14px] leading-relaxed ${borderRadiusClass} ${isSender ? 'bg-[#F2F2F2] text-[#181818] font-[500] text-[12px]' : 'bg-[#31A7AC] text-white font-[500] text-[12px]'}`}
                                    >
                                        {msg.content}
                                        {isSender && msg.status === "sending" && (
                                            <span className="ml-2 text-xs text-gray-400">Sending...</span>
                                        )}
                                    </div>
                                    {showTime && (
                                        <span className={`text-xs text-gray-400 mt-1 ${isSender ? 'text-right' : 'text-left'}`}>{formattedTime}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-[675px] w-full border border-[#FA596E] rounded-[52px] flex items-center gap-3 h-[53px] px-2.5 bg-white z-50">
                <Input
                    placeholder="Message ..."
                    className="border-none shadow-none text-[14px] font-[400] flex-1"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                />
                <Button className="size-11 rounded-full flex items-center justify-center bg-[#FA596E]" type="button">
                    <Paperclip className="text-[#ffffff] size-6" />
                </Button>
                <Button className="size-11 rounded-full flex items-center justify-center bg-[#FA596E]" type="button" onClick={handleSend}>
                    <Send className="text-[#ffffff] size-6" />
                </Button>
            </div>
        </div>
    );
}