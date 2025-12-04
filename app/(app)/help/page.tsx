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
    MessageSquare, 
    HelpCircle, 
    FileText, 
    Settings, 
    Briefcase,
    Users,
    Calendar,
    ChevronRight,
    Search
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
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        setActiveTopic(null); // Reset active topic selection visual if any

        try {
            // Generate unique section ID for this chat session
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

            // Extract response from n8n
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

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleTopicClick = (topic: Topic) => {
        setActiveTopic(topic.label);
        handleSendMessage(topic.query);
        if (window.innerWidth < 1024) {
            // On mobile, focus input after selection
            inputRef.current?.focus();
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl h-[calc(100vh-80px)] flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent w-fit">
                    Help Center
                </h1>
                <p className="text-gray-500">
                    Find answers, manage your account, and get support.
                </p>
            </div>

            <div className="flex-1 flex gap-6 h-full overflow-hidden">
                {/* Sidebar - Hidden on mobile, visible on lg */}
                <Card className="hidden lg:flex w-80 flex-col overflow-hidden border-gray-200 bg-white shadow-sm h-full">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-[#FA6E80]" />
                            Common Topics
                        </h2>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-3 space-y-1">
                            {TOPICS.map((topic) => (
                                <button
                                    key={topic.label}
                                    onClick={() => handleTopicClick(topic)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm transition-all duration-200 group",
                                        activeTopic === topic.label 
                                            ? "bg-gray-100 text-gray-900 font-medium" 
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-md transition-colors",
                                            activeTopic === topic.label ? "bg-white shadow-sm text-[#31A7AC]" : "bg-gray-100 text-gray-500 group-hover:text-[#31A7AC] group-hover:bg-white"
                                        )}>
                                            <topic.icon className="h-4 w-4" />
                                        </div>
                                        <span>{topic.label}</span>
                                    </div>
                                    <ChevronRight className={cn(
                                        "h-4 w-4 text-gray-400 transition-transform",
                                        activeTopic === topic.label ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                                    )} />
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <div className="rounded-xl bg-gradient-to-r from-[#FA6E80]/10 to-[#31A7AC]/10 p-4 border border-[#FA6E80]/20">
                            <h3 className="text-sm font-semibold text-gray-800 mb-1">Still need help?</h3>
                            <p className="text-xs text-gray-600 mb-3">
                                Our support team is available 24/7 to assist you.
                            </p>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full bg-white hover:bg-gray-50 border-gray-200 text-gray-700 text-xs h-8"
                            >
                                Contact Support
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Main Chat Area */}
                <Card className="flex-1 flex flex-col overflow-hidden border-gray-200 bg-white shadow-sm h-full" data-testid="help-chat-container">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-[#FA6E80]/20">
                                <AvatarFallback className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
                                    <Bot className="h-5 w-5 text-white" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-semibold text-gray-800">HeyProData Assistant</h2>
                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Online • AI Powered
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4 bg-gray-50/30" ref={scrollAreaRef}>
                        <div className="flex flex-col gap-6 max-w-3xl mx-auto py-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-4 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                                    data-testid={`message-${message.sender}`}
                                >
                                    <Avatar className={cn("h-8 w-8 flex-shrink-0 mt-1", message.sender === "user" ? "hidden" : "block")}>
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
                                                "px-5 py-3.5 shadow-sm",
                                                message.sender === "user"
                                                    ? "rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] text-white"
                                                    : "rounded-2xl rounded-tl-sm bg-white border border-gray-100 text-gray-800"
                                            )}
                                        >
                                            {message.sender === "bot" ? (
                                                <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-[#31A7AC] prose-strong:text-gray-900">
                                                    <ReactMarkdown
                                                        components={{
                                                            h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                                                            h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                                                            ul: ({node, ...props}) => <ul className="list-disc list-inside my-1 pl-1" {...props} />,
                                                            ol: ({node, ...props}) => <ol className="list-decimal list-inside my-1 pl-1" {...props} />,
                                                            li: ({node, ...props}) => <li className="my-0.5" {...props} />,
                                                            p: ({node, ...props}) => <p className="my-1 leading-relaxed" {...props} />,
                                                            a: ({node, ...props}) => <a className="text-[#31A7AC] hover:underline font-medium" {...props} />
                                                        }}
                                                    >
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1.5 px-1">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Quick Actions / Topics Suggestions - Only show when conversation hasn't started much (1 msg) */}
                            {messages.length <= 1 && (
                                <div className="ml-12 mr-auto max-w-[75%] animate-fade-in">
                                    <p className="text-xs text-gray-500 mb-3 ml-1">Suggested topics:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {TOPICS.map((topic) => (
                                            <button
                                                key={topic.label}
                                                onClick={() => handleTopicClick(topic)}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:border-[#6A89BE] hover:text-[#6A89BE] transition-colors text-sm text-gray-600"
                                            >
                                                <topic.icon className="h-3.5 w-3.5" />
                                                {topic.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isTyping && (
                                <div className="flex gap-4" data-testid="typing-indicator">
                                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                                        <AvatarFallback className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
                                            <Bot className="h-4 w-4 text-white" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="rounded-2xl rounded-tl-sm bg-white border border-gray-100 px-5 py-4 shadow-sm">
                                        <div className="flex gap-1.5">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100" data-testid="chat-input-area">
                        <div className="max-w-3xl mx-auto relative">
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
                                    className="pr-14 py-6 rounded-full border-gray-200 bg-gray-50 hover:bg-white focus:bg-white focus:border-[#6A89BE] focus:ring-[#6A89BE]/20 shadow-sm transition-all text-base"
                                    data-testid="message-input"
                                />
                                <Button
                                    type="submit"
                                    disabled={!inputMessage.trim() || isTyping}
                                    size="icon"
                                    className={cn(
                                        "absolute right-2 h-9 w-9 rounded-full transition-all duration-200",
                                        inputMessage.trim() 
                                            ? "bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] hover:opacity-90 hover:scale-105 shadow-md" 
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    )}
                                    data-testid="send-message-button"
                                >
                                    <Send className="h-4 w-4 text-white" />
                                </Button>
                            </form>
                            <p className="text-center text-[10px] text-gray-400 mt-2">
                                AI can make mistakes. Please verify important information.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
