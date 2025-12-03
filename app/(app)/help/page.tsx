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

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userQuestion = inputMessage;
        
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

            // Extract response from n8n - expected format: [{ "output": "text" }]
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
            
            // Fallback error message
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
                                        {message.sender === "bot" ? (
                                            <div className="text-sm prose prose-sm max-w-none prose-headings:my-2 prose-p:my-1 prose-strong:font-bold">
                                                <ReactMarkdown
                                                    components={{
                                                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                                                        h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                                                        h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                                                        h4: ({node, ...props}) => <h4 className="text-sm font-semibold mt-1 mb-1" {...props} />,
                                                        p: ({node, ...props}) => <p className="my-1" {...props} />,
                                                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                                        ul: ({node, ...props}) => <ul className="list-disc list-inside my-1" {...props} />,
                                                        ol: ({node, ...props}) => <ol className="list-decimal list-inside my-1" {...props} />,
                                                        li: ({node, ...props}) => <li className="my-0.5" {...props} />,
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        )}
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
