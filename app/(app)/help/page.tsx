"use client";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import axios from "axios";

interface Message {
    id: string;
    content: string;
    sender: "user" | "bot";
    timestamp: Date;
}

// Utility function to generate random 10-character alphanumeric section ID
const generateSectionId = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let sectionId = '';
    for (let i = 0; i < 10; i++) {
        sectionId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return sectionId;
};

export default function HelpPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            content: "Hello! I'm the HeyProData Help Bot. How can I assist you today?",
            sender: "bot",
            timestamp: new Date()
        },
        {
            id: "2",
            content: "I can help you with:\n• Account settings\n• Profile management\n• Using features (Gigs, Collabs, What's On)\n• Technical support\n• General questions",
            sender: "bot",
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputMessage,
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage("");
        setIsTyping(true);

        // Simulate bot response
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                content: getBotResponse(inputMessage),
                sender: "bot",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1000);
    };

    const getBotResponse = (userInput: string): string => {
        const input = userInput.toLowerCase();
        
        if (input.includes("profile") || input.includes("account")) {
            return "To manage your profile, go to Settings from the header menu. You can update your personal information, change your password, or delete your account there.";
        }
        
        if (input.includes("gig") || input.includes("job")) {
            return "To post a gig, navigate to the Gigs section and click 'Post Gig'. To apply for gigs, browse available listings and click 'Apply'. You can track your applications in the Jobs section.";
        }
        
        if (input.includes("collab") || input.includes("collaboration")) {
            return "Collabs are collaborative opportunities. You can browse collabs, express interest, or create your own collaboration post. Click 'I'm interested' to show your interest in a project.";
        }
        
        if (input.includes("event") || input.includes("what's on")) {
            return "What's On is our events section. You can RSVP to industry events, create your own events, and manage attendees. Check out upcoming networking events and workshops!";
        }
        
        if (input.includes("save") || input.includes("bookmark")) {
            return "You can save slates, collabs, and events by clicking the bookmark icon. Access all your saved items from the Saved page in the menu.";
        }
        
        if (input.includes("password") || input.includes("reset")) {
            return "To reset your password, go to Settings > Password Reset. Enter your current password and your new password. Make sure it's at least 8 characters long.";
        }
        
        if (input.includes("delete") || input.includes("remove account")) {
            return "To delete your account, go to Settings > Account Deletion. This action is permanent and cannot be undone. All your data will be removed from our system.";
        }

        if (input.includes("slate")) {
            return "Slate is our social feed where you can share updates, photos, and connect with the creative community. Like, comment, and share posts from fellow professionals!";
        }
        
        return "I'm here to help! Could you please provide more details about what you need assistance with? You can ask about account settings, features, or any specific issue you're facing.";
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const quickActions = [
        "How do I update my profile?",
        "How to post a gig?",
        "What are collabs?",
        "How do I reset my password?"
    ];

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl h-[calc(100vh-120px)]">
            <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent">
                    Help & Support
                </h1>
                <p className="text-gray-600 mt-2">Chat with our help bot for instant assistance</p>
            </div>

            <Card className="h-[calc(100%-100px)] flex flex-col border-gray-200 bg-white" data-testid="help-chat-container">
                {/* Chat Messages */}
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex items-start gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                                data-testid={`message-${message.sender}`}
                            >
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    {message.sender === "bot" ? (
                                        <>
                                            <AvatarFallback className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
                                                <Bot className="h-5 w-5 text-white" />
                                            </AvatarFallback>
                                        </>
                                    ) : (
                                        <>
                                            <AvatarImage src="/default-profile.png" />
                                            <AvatarFallback className="bg-gray-200">
                                                <User className="h-5 w-5 text-gray-600" />
                                            </AvatarFallback>
                                        </>
                                    )}
                                </Avatar>
                                <div
                                    className={`flex flex-col max-w-[70%] ${
                                        message.sender === "user" ? "items-end" : "items-start"
                                    }`}
                                >
                                    <div
                                        className={`rounded-2xl px-4 py-3 ${
                                            message.sender === "user"
                                                ? "bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] text-white"
                                                : "bg-[#F8F8F8] text-gray-800"
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex items-start gap-3" data-testid="typing-indicator">
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarFallback className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
                                        <Bot className="h-5 w-5 text-white" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="rounded-2xl px-4 py-3 bg-[#F8F8F8]">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Quick Actions */}
                {messages.length <= 2 && (
                    <div className="px-4 pb-2">
                        <p className="text-sm text-gray-600 mb-2">Quick questions:</p>
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setInputMessage(action)}
                                    className="text-xs px-3 py-2 rounded-full border border-[#6A89BE] text-[#6A89BE] hover:bg-[#6A89BE] hover:text-white transition-colors"
                                    data-testid="quick-action-button"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t border-gray-200 p-4" data-testid="chat-input-area">
                    <div className="flex gap-2">
                        <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 rounded-full border-gray-300 focus:border-[#6A89BE] focus:ring-[#6A89BE]"
                            data-testid="message-input"
                        />
                        <Button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim()}
                            className="rounded-full h-11 w-11 p-0 bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] hover:opacity-90 disabled:opacity-50"
                            data-testid="send-message-button"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
