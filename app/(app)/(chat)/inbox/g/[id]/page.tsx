"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EllipsisVertical, Paperclip, Send } from "lucide-react";
import { getChatUser, Groups, getGroupChatMessages, chatData, getGroupChat } from "@/data/chatMessage";
import Image from "next/image";
type paramsType = { id: string };
type GroupMessage = {
    id: string;
    groupId: string;
    senderId: string;
    content: string;
    timestamp: string;
    status: string;
};
export default function MessageInbox({ params }: { params: paramsType }) {
    const { id } = params;
    // Simulate current user
    const currentUser = {
        id: 1,
        groupid: ["grp-1", "grp-2", "grp-3", "grp-4", "grp-5", "grp-6", "grp-7", "grp-8"],
        messageId: "msg-1",
        name: 'Victor George',
        message: 'Who can I get started worki...',
        image: '/image (1).png',
        badge: null,
        state: 'online'
    };
    // console.log(currentUser)
    // Get chat user and messages
    const group = Groups.find((group) => group.messageId === id);
    const chatUser = getChatUser(id);
    const groups = getGroupChat(id)
    // console.log(groups)
    // Get all group messages for this group
    const initialMessages: GroupMessage[] = group
        ? getGroupChatMessages(group.messageId)
        : [];
    // Message input state
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<GroupMessage[]>(initialMessages)
    // console.log(messages);

    // Simulate sending a group message
    const handleSend = () => {
        if (message.trim().length === 0 || !group) return;
        const newMsg: GroupMessage = {
            id: `groupMsg-${messages.length + 1}`,
            groupId: group.messageId,
            senderId: currentUser.messageId,
            content: message,
            timestamp: new Date().toISOString(),
            status: "sending",
        };
        setMessages([...messages, newMsg]);
        setMessage("");
        setTimeout(() => {
            setMessages((msgs: GroupMessage[]) =>
                msgs.map((msg: GroupMessage) =>
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
                        <div className="flex -space-x-4">
                            {groups?.image.slice(0, 2).map((imgSrc, imgIdx) => (
                                <div className="" key={imgIdx} >
                                    <Image
                                        key={imgIdx}
                                        src={imgSrc}
                                        alt={groups.name}
                                        className="w-[35px] h-[35px] rounded-full object-cover bg-[#D9D9D9] border-2 border-white"
                                        width={35}
                                        height={35}
                                    />
                                </div>

                            ))}
                        </div>


                        <div>
                            <div className="text-black font-medium text-lg ">
                                {groups?.name || "User Name"}
                            </div>
                            {
                                groups && groups.noofOnlinePeople > 0 && (
                                    <div className="text-[#34A353] text-sm font-normal">
                                        {groups.noofOnlinePeople} Online
                                    </div>
                                )
                            }

                        </div>
                    </div>
                    <div>
                        <EllipsisVertical className=" text-black" />
                    </div>
                </div>
                {/* Chat messages */}
                <div className="">
                    <div className="mx-auto max-w-[675px] h-[calc(484px-90px)] overflow-y-auto flex flex-col px-4 py-6 bg-white no-scrollbar">
                        {messages.map((msg: GroupMessage, index: number) => {
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

                            // Find sender info
                            const sender = chatData.find((user) => user.messageId === msg.senderId);
                            // Show time only for last message in a group with same timestamp
                            const showTime = !nextMsg || nextMsg.timestamp !== msg.timestamp;
                            const formattedTime = format(new Date(msg.timestamp), "h:mm a");

                            return (
                                <div key={msg.id || index} className={`flex w-full flex-col ${isSender ? 'items-end' : 'items-start'} ${marginBottom}`}>
                                    <div className={`flex items-center gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
                                        {!isSender && sender && (
                                            <Image
                                                src={sender.image || "/default-profile.png"}
                                                alt={sender.name || "Sender"}
                                                width={28}
                                                height={28}
                                                className="rounded-full"
                                            />
                                        )}
                                        <div
                                            className={`max-w-[70%] px-5 py-3 text-[14px] leading-relaxed ${borderRadiusClass} ${isSender ? 'bg-[#F2F2F2] text-[#181818] font-[500] text-[12px]' : 'bg-[#31A7AC] text-white font-[500] text-[12px]'}`}
                                        >
                                            {msg.content}
                                            {isSender && msg.status === "sending" && (
                                                <span className="ml-2 text-xs text-gray-400">Sending...</span>
                                            )}
                                        </div>
                                        {isSender && sender && (
                                            <Image
                                                src={sender.image || "/default-profile.png"}
                                                alt={sender.name || "Sender"}
                                                width={28}
                                                height={28}
                                                className="rounded-full"
                                            />
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