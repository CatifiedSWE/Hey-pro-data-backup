"use client";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    Send, 
    Bot, 
    User, 
    Sparkles, 
    Settings, 
    Briefcase,
    Users,
    Calendar,
    ChevronRight,
    Maximize2,
    Minimize2
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
            content: "Hello! I'm the HeyProData Help Bot. How can I assist you today?",
            sender: "bot",
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [activeTopic, setActiveTopic] = useState<string | null>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    
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

    // Full screen toggle handler
    const toggleFullScreen = () => {
        setIsFullScreen(!isFullScreen);
    };

    return (
        <div 
            className={cn(
                "flex flex-col gap-4 transition-all duration-300 ease-in-out",
                isFullScreen 
                    ? "fixed inset-0 z-[100] bg-white p-4 pt-16 md:p-6" 
                    : "w-full h-[calc(100vh-8rem)] pb-2"
            )}
        >
            {/* Header Area - Compact */}
            <div className="flex items-center justify-between shrink-0 px-1">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent inline-block">
                        Help Center
                    </h1>
                    {!isFullScreen && (
                        <p className="text-sm text-gray-500 hidden sm:inline-block ml-3">
                            Support & Assistant
                        </p>
                    )}
                </div>
                
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleFullScreen}
                    className="text-gray-500 hover:text-[#31A7AC] hover:bg-[#31A7AC]/10"
                    title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                    {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-4 h-full min-h-0 overflow-hidden">
                {/* Sidebar - Hidden on mobile, visible on lg */}
                <Card className="hidden lg:flex w-72 flex-col overflow-hidden border-gray-200 bg-white shadow-sm h-full">
                    <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-semibold text-gray-700 flex items-center gap-2 text-sm">
                            <Sparkles className="h-4 w-4 text-[#FA6E80]" />
                            Quick Topics
                        </h2>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {TOPICS.map((topic) => (
                                <button
                                    key={topic.label}
                                    onClick={() => handleTopicClick(topic)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                                        activeTopic === topic.label 
                                            ? "bg-gray-100 text-gray-900 font-medium" 
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-1.5 rounded-md transition-colors",
                                            activeTopic === topic.label ? "bg-white shadow-sm text-[#31A7AC]" : "bg-gray-100 text-gray-500 group-hover:text-[#31A7AC] group-hover:bg-white"
                                        )}>
                                            <topic.icon className="h-3.5 w-3.5" />
                                        </div>
                                        <span>{topic.label}</span>
                                    </div>
                                    <ChevronRight className={cn(
                                        "h-3.5 w-3.5 text-gray-400 transition-transform",
                                        activeTopic === topic.label ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                                    )} />
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Main Chat Area */}
                <Card className="flex-1 flex flex-col overflow-hidden border-gray-200 bg-white shadow-sm h-full" data-testid="help-chat-container">
                    {/* Chat Header - Minimal */}
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-white z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 ring-2 ring-offset-1 ring-[#FA6E80]/20">
                                <AvatarFallback className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
                                    <Bot className="h-4 w-4 text-white" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-semibold text-gray-800 text-sm">AI Assistant</h2>
                                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area - Native Scroll for reliability */}
                    <div className="flex-1 overflow-y-auto bg-gray-50/30 p-0">
                        <div className="flex flex-col gap-4 p-4 min-h-full">
                            {/* Welcome State */}
                            {messages.length === 1 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 animate-fade-in mt-10">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FA6E80]/10 to-[#31A7AC]/10 flex items-center justify-center mb-4">
                                        <Bot className="h-8 w-8 text-[#6A89BE]" />
                                    </div>
                                    <h3 className="font-semibold text-gray-700 mb-1">How can we help?</h3>
                                    <p className="text-sm text-gray-400 max-w-xs">
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

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100 shrink-0" data-testid="chat-input-area">
                        <div className="max-w-3xl mx-auto relative">
                             <form 
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="relative flex items-center gap-2"
                            >
                                <Input
                                    ref={inputRef}
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="flex-1 py-5 rounded-full border-gray-200 bg-gray-50 hover:bg-white focus:bg-white focus:border-[#6A89BE] focus:ring-[#6A89BE]/20 shadow-sm transition-all text-sm"
                                    data-testid="message-input"
                                />
                                <Button
                                    type="submit"
                                    disabled={!inputMessage.trim() || isTyping}
                                    size="icon"
                                    className={cn(
                                        "h-10 w-10 rounded-full transition-all duration-200 shrink-0",
                                        inputMessage.trim() 
                                            ? "bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] hover:opacity-90 shadow-md" 
                                            : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    )}
                                    data-testid="send-message-button"
                                >
                                    <Send className="h-4 w-4 text-white" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
