"use client";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    Send, 
    Bot, 
    User, 
    Settings, 
    Briefcase,
    Users,
    Calendar,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    content: string;
    sender: "user" | "bot";
    timestamp: Date;
}

interface Topic {
    icon: React.ElementType;
    label: string;
    query: string;
}

const TOPICS: Topic[] = [
    { icon: User, label: "Account & Profile", query: "How do I update my profile?" },
    { icon: Briefcase, label: "Gigs & Jobs", query: "How to post a gig?" },
    { icon: Users, label: "Collabs", query: "What are collabs and how do they work?" },
    { icon: Calendar, label: "Events", query: "How do I create an event?" },
    { icon: Settings, label: "Settings", query: "How do I change my password?" },
];

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
            content: "Hello! I'm the HeyProData AI Support. How can I assist you today?",
            sender: "bot",
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [activeTopic, setActiveTopic] = useState<string | null>(null);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    const handleSendMessage = async (text: string = inputMessage) => {
        if (!text.trim()) return;

        const userQuestion = text;
        
        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: userQuestion,
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage("");
        setIsTyping(true);
        setActiveTopic(null); 

        try {
            const sectionId = generateSectionId();
            
            // Call n8n webhook
            const response = await axios.get(
                'https://n8n.srv882974.hstgr.cloud/webhook/3e37b379-3432-43ea-b3e3-abe9d5c2d18f',
                {
                    params: {
                        question: userQuestion,
                        section_id: sectionId
                    }
                }
            );

            let botResponseText = "I apologize, but I couldn't process your request. Please try again.";
            
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                botResponseText = response.data[0].output || botResponseText;
            } else if (response.data && response.data.output) {
                botResponseText = response.data.output;
            }

            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                content: botResponseText,
                sender: "bot",
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error('Error calling n8n webhook:', error);
            
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "I'm sorry, I'm having trouble connecting to the help system right now. Please try again in a moment.",
                sender: "bot",
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleTopicClick = (topic: Topic) => {
        setActiveTopic(topic.label);
        handleSendMessage(topic.query);
        if (window.innerWidth < 1024) {
            inputRef.current?.focus();
        }
    };

    return (
        <div className="flex flex-col w-full -mt-10 h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] md:mt-0 md:h-[calc(100vh-7rem)] md:max-h-[calc(100vh-7rem)] pb-1 md:pb-2 px-0 md:px-2">
            {/* Main Chat Area */}
            <Card className="flex-1 flex flex-col overflow-hidden border-0 md:border md:border-gray-200 bg-white shadow-none md:shadow-sm rounded-none md:rounded-xl min-h-0 max-h-full" data-testid="help-chat-container">
                    {/* Chat Header - Minimal */}
                    <div className="p-3 md:p-3 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
                        <div className="flex items-center gap-3 md:gap-3">
                            <Avatar className="h-8 w-8 md:h-8 md:w-8 ring-2 ring-offset-1 ring-[#FA6E80]/20">
                                <AvatarFallback className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
                                    <Bot className="h-4 w-4 md:h-4 md:w-4 text-white" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-semibold text-gray-800 text-sm md:text-sm">AI Support</h2>
                                <p className="text-[10px] md:text-[10px] text-gray-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area - Native Scroll for reliability */}
                    <div className="flex-1 overflow-y-auto bg-gray-50/30 p-0 relative min-h-0">
                        <div className="flex flex-col gap-4 md:gap-4 p-3 md:p-4 max-w-4xl mx-auto w-full">
                            {/* Welcome State */}
                            {messages.length === 1 && (
                                <div className="flex flex-col items-center justify-center py-4 md:py-8 text-center text-gray-500 animate-fade-in">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#FA6E80]/10 to-[#31A7AC]/10 flex items-center justify-center mb-3 md:mb-4">
                                        <Bot className="h-6 w-6 md:h-8 md:w-8 text-[#6A89BE]" />
                                    </div>
                                    
                                    {/* Added Titles to Welcome Screen */}
                                    <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent inline-block mb-1 md:mb-1">
                                        Help Center
                                    </h1>
                                    <p className="text-sm md:text-sm text-gray-500 font-medium mb-3 md:mb-4">
                                        Support & Assistant
                                    </p>

                                    <h3 className="font-semibold text-gray-700 mb-1 md:mb-1 text-sm md:text-base">How can we help?</h3>
                                    <p className="text-xs md:text-sm text-gray-400 max-w-xs px-4">
                                        Ask about features, your account, or troubleshooting.
                                    </p>
                                </div>
                            )}

                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                                    data-testid={`message-${message.sender}`}
                                >
                                    <Avatar className={cn("h-8 w-8 flex-shrink-0 mt-0.5", message.sender === "user" ? "hidden" : "block")}>
                                        {message.sender === "bot" ? (
                                            <AvatarFallback className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
                                                <Bot className="h-4 w-4 text-white" />
                                            </AvatarFallback>
                                        ) : (
                                            <AvatarImage src="/default-profile.png" />
                                        )}
                                    </Avatar>
                                    
                                    <div className={`flex flex-col max-w-[85%] lg:max-w-[75%] ${message.sender === "user" ? "items-end" : "items-start"}`}>
                                        <div
                                            className={cn(
                                                "px-4 py-2.5 shadow-sm text-sm",
                                                message.sender === "user"
                                                    ? "rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] text-white"
                                                    : "rounded-2xl rounded-tl-sm bg-white border border-gray-100 text-gray-800"
                                            )}
                                        >
                                            {message.sender === "bot" ? (
                                                <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-[#31A7AC] prose-strong:text-gray-900">
                                                    <ReactMarkdown
                                                        components={{
                                                            h1: ({node, ...props}) => <h1 className="text-base font-bold mt-1 mb-1" {...props} />,
                                                            h2: ({node, ...props}) => <h2 className="text-sm font-bold mt-1 mb-1" {...props} />,
                                                            ul: ({node, ...props}) => <ul className="list-disc list-inside my-1 pl-1" {...props} />,
                                                            ol: ({node, ...props}) => <ol className="list-decimal list-inside my-1 pl-1" {...props} />,
                                                            li: ({node, ...props}) => <li className="my-0.5" {...props} />,
                                                            p: ({node, ...props}) => <p className="my-0.5 leading-relaxed" {...props} />,
                                                            a: ({node, ...props}) => <a className="text-[#31A7AC] hover:underline font-medium" {...props} />
                                                        }}
                                                    >
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex gap-3" data-testid="typing-indicator">
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarFallback className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
                                            <Bot className="h-4 w-4 text-white" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-4 py-3 shadow-sm">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-1" />
                        </div>
                    </div>

                    {/* Input Area - Fixed at bottom */}
                    <div className="p-3 md:p-3 bg-white border-t border-gray-100 flex-shrink-0" data-testid="chat-input-area">
                        <div className="max-w-3xl mx-auto relative">
                             {/* Suggested Topics - Chips above input */}
                             {/* Improved Layout: Mobile scrolling, Desktop wrap & centered */}
                            <div className="flex gap-2 md:gap-2 overflow-x-auto pb-3 md:pb-2.5 px-1 md:px-0 md:flex-wrap md:justify-center md:overflow-visible no-scrollbar">
                                {TOPICS.map((topic) => (
                                    <button
                                        key={topic.label}
                                        onClick={() => handleTopicClick(topic)}
                                        className={cn(
                                            "flex items-center gap-2 md:gap-1.5 px-4 py-2 md:px-3 md:py-1.5 rounded-full text-xs md:text-xs font-medium transition-all border flex-shrink-0",
                                            activeTopic === topic.label
                                                ? "bg-[#6A89BE]/10 border-[#6A89BE] text-[#6A89BE]"
                                                : "bg-white hover:bg-gray-50 border-gray-200 text-gray-600 hover:border-[#6A89BE] hover:text-[#6A89BE]",
                                            "whitespace-nowrap shadow-sm"
                                        )}
                                    >
                                        <topic.icon className="h-4 w-4 md:h-3.5 md:w-3.5" />
                                        <span className="inline">{topic.label}</span>
                                    </button>
                                ))}
                            </div>

                            <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="relative flex items-center"
                            >
                                <Input
                                    ref={inputRef}
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="flex-1 py-5 md:py-5 rounded-full border-gray-200 bg-gray-50 hover:bg-white focus:bg-white focus:border-[#6A89BE] focus:ring-[#6A89BE]/20 shadow-sm transition-all text-sm md:text-sm"
                                    data-testid="message-input"
                                />
                                <Button
                                    type="submit"
                                    disabled={!inputMessage.trim() || isTyping}
                                    size="icon"
                                    className={cn(
                                        "h-10 w-10 md:h-10 md:w-10 rounded-full transition-all duration-200 shrink-0 ml-2 md:ml-2",
                                        inputMessage.trim() 
                                            ? "bg-[#FA6E80]/10 hover:bg-[#FA6E80]/20 shadow-sm" 
                                            : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    )}
                                    data-testid="send-message-button"
                                >
                                    <Send className={cn("h-4 w-4 md:h-4 md:w-4", inputMessage.trim() ? "text-[#FA6E80]" : "text-gray-300")} />
                                </Button>
                            </form>
                        </div>
                    </div>
                </Card>
        </div>
    );
}
