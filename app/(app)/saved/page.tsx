"use client";
import { useState } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Send, MapPin, Calendar, Users, Bookmark } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavedPage() {
    const [loading] = useState(false);

    // Mock data for saved items
    const savedSlates = [
        {
            id: "1",
            profileAvatar: "/default-profile.png",
            profileName: "Sarah Johnson",
            role: "Director",
            totalRoles: "12 Roles",
            noLike: 245,
            noComment: 38,
            slateSrc: "/slate.png",
            description: "Just wrapped up an amazing shoot in the desert. The lighting was perfect and the crew was incredible. Can't wait to share the final cut with you all!",
            savedAt: "2 days ago"
        },
        {
            id: "2",
            profileAvatar: "/default-profile.png",
            profileName: "Michael Chen",
            role: "Cinematographer",
            totalRoles: "8 Roles",
            noLike: 189,
            noComment: 24,
            slateSrc: "/whats-on.png",
            description: "New camera test with the latest cinema camera. The dynamic range is absolutely stunning!",
            savedAt: "5 days ago"
        }
    ];

    const savedCollabs = [
        {
            id: "1",
            title: "Looking for Cinematographer",
            summary: "We're creating a short documentary about urban life and need a skilled cinematographer who can capture authentic moments.",
            tags: ["Documentary", "Urban", "Cinema"],
            coverImage: "/slate.png",
            interests: 23,
            author: {
                name: "Emma Wilson",
                avatar: "/default-profile.png"
            },
            savedAt: "1 week ago"
        },
        {
            id: "2",
            title: "Indie Film Production Team",
            summary: "Building a team for an indie film project. Looking for passionate crew members who want to create something special.",
            tags: ["Indie Film", "Production", "Team"],
            coverImage: "/whats-on.png",
            interests: 45,
            author: {
                name: "David Martinez",
                avatar: "/default-profile.png"
            },
            savedAt: "2 weeks ago"
        }
    ];

    const savedWhatsOn = [
        {
            id: "1",
            title: "Film Industry Networking Night",
            description: "Join us for an evening of networking with fellow filmmakers, producers, and creatives from across the industry.",
            location: "Dubai Media City",
            date: "March 15, 2025",
            time: "7:00 PM - 10:00 PM",
            image: "/slate.png",
            attendees: 67,
            price: "Free",
            savedAt: "3 days ago"
        },
        {
            id: "2",
            title: "Camera Workshop: Mastering Lighting",
            description: "Hands-on workshop covering advanced lighting techniques for cinematographers and DOPs.",
            location: "Abu Dhabi Film Studio",
            date: "March 22, 2025",
            time: "2:00 PM - 6:00 PM",
            image: "/whats-on.png",
            attendees: 32,
            price: "AED 250",
            savedAt: "1 week ago"
        }
    ];

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent">
                    Saved Items
                </h1>
                <p className="text-gray-600 mt-2">Your bookmarked slates, collabs, and events</p>
            </div>

            <Tabs defaultValue="slates" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#F8F8F8]" data-testid="saved-tabs">
                    <TabsTrigger value="slates" data-testid="slates-tab">Slates</TabsTrigger>
                    <TabsTrigger value="collabs" data-testid="collabs-tab">Collabs</TabsTrigger>
                    <TabsTrigger value="whats-on" data-testid="whats-on-tab">What's On</TabsTrigger>
                </TabsList>

                {/* Slates Tab */}
                <TabsContent value="slates" data-testid="slates-content">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => <SlateSkeleton key={i} />)}
                        </div>
                    ) : savedSlates.length === 0 ? (
                        <EmptyState 
                            icon={<Bookmark className="h-12 w-12" />}
                            title="No saved slates yet"
                            description="Start saving slates to see them here"
                        />
                    ) : (
                        <div className="space-y-4">
                            {savedSlates.map((slate) => (
                                <Card key={slate.id} className="border-gray-200 rounded-lg p-6 bg-white" data-testid="saved-slate-card">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <Image
                                                src={slate.profileAvatar}
                                                alt={slate.profileName}
                                                width={44}
                                                height={44}
                                                className="w-11 h-11 rounded-full mr-4 object-cover"
                                            />
                                            <div>
                                                <h3 className="font-semibold text-lg">{slate.profileName}</h3>
                                                <p className="text-sm text-gray-600">{slate.role} + {slate.totalRoles}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Bookmark className="h-5 w-5 fill-[#FA6E80] text-[#FA6E80]" />
                                            <span className="text-xs text-gray-500">{slate.savedAt}</span>
                                        </div>
                                    </div>
                                    {slate.slateSrc && (
                                        <Image
                                            src={slate.slateSrc}
                                            alt="Slate image"
                                            width={520}
                                            height={520}
                                            className="w-full h-auto rounded-lg mb-4 object-cover"
                                        />
                                    )}
                                    <div className="flex gap-4 mb-3">
                                        <button className="flex items-center gap-2 text-gray-700 hover:text-[#FA6E80]">
                                            <Heart className="h-6 w-6" />
                                            <span className="text-sm">{slate.noLike}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-gray-700 hover:text-[#FA6E80]">
                                            <MessageCircle className="h-6 w-6" />
                                            <span className="text-sm">{slate.noComment}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-gray-700 hover:text-[#FA6E80]">
                                            <Send className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <p className="text-gray-700 text-sm">{slate.description}</p>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Collabs Tab */}
                <TabsContent value="collabs" data-testid="collabs-content">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map((i) => <CollabSkeleton key={i} />)}
                        </div>
                    ) : savedCollabs.length === 0 ? (
                        <EmptyState 
                            icon={<Bookmark className="h-12 w-12" />}
                            title="No saved collabs yet"
                            description="Start saving collaboration opportunities to see them here"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {savedCollabs.map((collab) => (
                                <Card key={collab.id} className="border-gray-200 rounded-lg overflow-hidden bg-white" data-testid="saved-collab-card">
                                    <div className="relative h-48">
                                        <Image
                                            src={collab.coverImage}
                                            alt={collab.title}
                                            fill
                                            className="object-cover"
                                        />
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                                            <Bookmark className="h-5 w-5 fill-[#FA6E80] text-[#FA6E80]" />
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-2">{collab.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{collab.summary}</p>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {collab.tags.map((tag, idx) => (
                                                <span key={idx} className="px-3 py-1 text-xs rounded-full border border-[#31A7AC] text-[#31A7AC]">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <Separator className="my-3" />
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    src={collab.author.avatar}
                                                    alt={collab.author.name}
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full object-cover"
                                                />
                                                <span className="text-sm text-gray-700">{collab.author.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Users className="h-4 w-4" />
                                                <span>{collab.interests}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-3">Saved {collab.savedAt}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* What's On Tab */}
                <TabsContent value="whats-on" data-testid="whats-on-content">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => <EventSkeleton key={i} />)}
                        </div>
                    ) : savedWhatsOn.length === 0 ? (
                        <EmptyState 
                            icon={<Bookmark className="h-12 w-12" />}
                            title="No saved events yet"
                            description="Start saving events to see them here"
                        />
                    ) : (
                        <div className="space-y-4">
                            {savedWhatsOn.map((event) => (
                                <Card key={event.id} className="border-gray-200 rounded-lg overflow-hidden bg-white" data-testid="saved-event-card">
                                    <div className="flex flex-col md:flex-row">
                                        <div className="relative w-full md:w-64 h-48 md:h-auto">
                                            <Image
                                                src={event.image}
                                                alt={event.title}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 p-6">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-xl">{event.title}</h3>
                                                <Bookmark className="h-5 w-5 fill-[#FA6E80] text-[#FA6E80] flex-shrink-0 ml-2" />
                                            </div>
                                            <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Calendar className="h-4 w-4 text-[#6A89BE]" />
                                                    <span>{event.date} • {event.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <MapPin className="h-4 w-4 text-[#6A89BE]" />
                                                    <span>{event.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                                    <Users className="h-4 w-4 text-[#6A89BE]" />
                                                    <span>{event.attendees} attending</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-[#FA6E80]">{event.price}</span>
                                                <span className="text-xs text-gray-500">Saved {event.savedAt}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function SlateSkeleton() {
    return (
        <Card className="border-gray-200 rounded-lg p-6 bg-white">
            <div className="flex items-center mb-4">
                <Skeleton className="h-11 w-11 rounded-full mr-4" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <Skeleton className="w-full h-96 rounded-lg mb-4" />
            <div className="flex gap-4 mb-3">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
        </Card>
    );
}

function CollabSkeleton() {
    return (
        <Card className="border-gray-200 rounded-lg overflow-hidden bg-white">
            <Skeleton className="w-full h-48" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </div>
        </Card>
    );
}

function EventSkeleton() {
    return (
        <Card className="border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="flex flex-col md:flex-row">
                <Skeleton className="w-full md:w-64 h-48" />
                <div className="flex-1 p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-40" />
                </div>
            </div>
        </Card>
    );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-gray-400 mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
            <p className="text-gray-500">{description}</p>
        </div>
    );
}
