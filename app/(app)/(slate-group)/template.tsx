import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { BookmarkIcon, HelpCircle, SettingsIcon, UserRound } from "lucide-react";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    interface SimilarAccount {
        id: number;
        name: string;
        image: string;
        role: string;
        totlerole: string;
        proifleurl: string;
    }
    interface Profile {
        name: string;
        bio: string;
        backgroundImage: string;
        avatarImage: string;
        referencesavatar: string[];
        totalref: number;
        profileurl: string;
        urls: {
            id: string;
            name: string;
            icon: React.ReactNode;
            link: string;
        }[]
    }

    const similarAccounts: SimilarAccount[] = [
        {
            id: 1,
            name: "David Garcia",
            image: "/image (1).png",
            role: "Producer",
            totlerole: "2 roles",
            proifleurl: "/profile/david"
        },
        {
            id: 2,
            name: "Ava Jackson",
            image: "/image (2).png",
            role: "Producer",
            totlerole: "2 roles",
            proifleurl: "/profile/ava"
        },
        {
            id: 3,
            name: "Olivia Martin",
            image: "/image (3).png",
            role: "Producer",
            totlerole: "2 roles",
            proifleurl: "/profile/olivia"
        },
        {
            id: 4,
            name: "Ella Lewis",
            image: "/image (4).png",
            role: "Producer",
            totlerole: "2 roles",
            proifleurl: "/profile/ella"
        },
        {
            id: 5,
            name: "Michael Jones",
            image: "/image (5).png",
            role: "Producer",
            totlerole: "2 roles",
            proifleurl: "/profile/michael"
        }
    ];

    const profile: Profile = {
        name: "John Doe",
        bio: "Award-winning cinematographer with 10+ years in narrative film and commercial work. Visual storytelling and collaborative filmmaking.",
        backgroundImage: "/bg.jpg",
        avatarImage: "/image (1).png",
        referencesavatar: ["/image (1).png", "/image (2).png", "/image (3).png"],
        totalref: 240,
        profileurl: "/profile/johndoe",
        urls: [
            {
                id: '1',
                name: "Profile",
                icon: <UserRound className="w-5 h-5" />,
                link: "/profile/johndoe"
            },
            {
                id: '2',
                name: "Saved",
                icon: <BookmarkIcon className="w-5 h-5" />,
                link: "/profile/johndoe/saved"
            },
            {
                id: '3',
                name: "Help",
                icon: <HelpCircle className="w-5 h-5" />,
                link: "/profile/johndoe/help"
            },
            {
                id: '4',
                name: "Settings",
                icon: <SettingsIcon className="w-5 h-5" />,
                link: "/profile/johndoe/settings"
            }
        ],
    };

    const gradientStyle = {
        background: "linear-gradient(90deg, #FA6E80 0%, #6A89BE 41.52%, #85AAB7 62.27%, #31A7AC 103.79%)"
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>

            {/* Header Section */}
            <div className="max-w-[959px] mx-auto px-4 sm:px-0 mt-[104px] mb-6">
                <div className="flex items-center gap-[20px]">
                    <span 
                        className="text-xl font-bold bg-clip-text text-transparent uppercase tracking-widest shrink-0"
                        style={{ ...gradientStyle, WebkitBackgroundClip: "text" }}
                    >
                        SLATE
                    </span>
                    <div 
                        className="h-[1px] w-full"
                        style={gradientStyle}
                    />
                </div>
            </div>

            <div className="max-w-[959px] mx-auto px-4 sm:px-0 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Sidebar - Profile - STICKY */}
                    <div className="hidden md:block md:col-span-4 lg:col-span-3 sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar">
                        <div className="space-y-4">
                            {/* Profile Card */}
                            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
                                {/* Cover Image */}
                                <div className="h-20 w-full relative bg-gray-100">
                                    <Image 
                                        src={profile.backgroundImage} 
                                        alt="Cover" 
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                
                                {/* Profile Info */}
                                <div className="px-4 pb-5">
                                    <div className="relative -mt-10 mb-3 flex justify-start">
                                        <div className="h-[72px] w-[72px] rounded-full border-4 border-white overflow-hidden relative bg-white shadow-sm">
                                            <Image 
                                                src={profile.avatarImage} 
                                                alt={profile.name} 
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                    
                                    <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
                                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                                        {profile.bio}
                                    </p>

                                    {/* Referrals */}
                                    <div className="flex items-center mt-3 bg-[#F2F2F2] p-1.5 rounded-full w-fit pr-4">
                                        <div className="flex -space-x-2 mr-2">
                                            {profile.referencesavatar.map((avatar, index) => (
                                                <div key={index} className="relative h-5 w-5 rounded-full border border-white overflow-hidden">
                                                    <Image
                                                        src={avatar}
                                                        alt={`Ref ${index}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-semibold text-[#FA6E80]">
                                            +{profile.totalref} Referrals
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden p-2 space-y-1">
                                {profile.urls.map((url) => (
                                    <Link 
                                        key={url.id} 
                                        href={url.link}
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                                    >
                                        {url.icon}
                                        {url.name}
                                    </Link>
                                ))}
                            </div>

                            {/* Invite Button */}
                            <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden p-2">
                                <Button className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm rounded-xl h-10 font-medium transition-all hover:shadow-md group">
                                    <span 
                                        className="bg-clip-text text-transparent group-hover:opacity-80 font-bold"
                                        style={{ ...gradientStyle, WebkitBackgroundClip: "text" }}
                                    >
                                        Send Invite
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Feed - SCROLLABLE */}
                    <div className="col-span-1 md:col-span-8 lg:col-span-6 min-h-screen">
                        <div className="max-w-xl mx-auto">
                            {children}
                        </div>
                    </div>

                    {/* Right Sidebar - Suggestions - STICKY */}
                    <div className="hidden lg:block lg:col-span-3 sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto no-scrollbar">
                        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-5">
                            <div className="flex items-center justify-between mb-6">
                                <h3 
                                    className="text-lg font-normal bg-clip-text text-transparent"
                                    style={{ ...gradientStyle, WebkitBackgroundClip: "text" }}
                                >
                                    View Profiles
                                </h3>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <span className="sr-only">Options</span>
                                    <svg width="16" height="4" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="2" cy="2" r="2" fill="currentColor"/>
                                        <circle cx="8" cy="2" r="2" fill="currentColor"/>
                                        <circle cx="14" cy="2" r="2" fill="currentColor"/>
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="space-y-5">
                                {similarAccounts.map((account) => (
                                    <Link 
                                        key={account.id} 
                                        href={account.proifleurl}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className="relative h-10 w-10 flex-shrink-0">
                                            <Image
                                                src={account.image}
                                                alt={account.name}
                                                fill
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {account.name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {account.role} + {account.totlerole}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            
                            <div className="mt-6">
                                <Link href="/explore" className="text-[10px] text-gray-400 hover:text-gray-600 block">
                                    View crew directory
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
