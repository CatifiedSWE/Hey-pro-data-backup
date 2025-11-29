import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { BookmarkIcon, HelpCircle, SettingsIcon, UserRound, Search } from "lucide-react";

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

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header Section */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <span className="text-xl font-bold bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent">
                                SLATE
                            </span>
                            <div className="hidden md:block h-6 w-[1px] bg-gray-200"></div>
                            <span className="hidden md:block text-sm text-gray-500">Your professional feed</span>
                        </div>
                        <div className="flex-1 max-w-md mx-4 hidden md:block">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Search posts..." 
                                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-[#FA6E80]/20 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-[1px] w-full bg-gradient-to-r from-[#31A7AC] via-[#6A89BE] to-[#FA6E80] opacity-30" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
                    
                    {/* Left Sidebar - Profile */}
                    <div className="hidden md:block md:col-span-4 lg:col-span-3">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Cover Image */}
                                <div className="h-24 w-full relative bg-gray-100">
                                    <Image 
                                        src={profile.backgroundImage} 
                                        alt="Cover" 
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                
                                {/* Profile Info */}
                                <div className="px-5 pb-5">
                                    <div className="relative -mt-10 mb-3">
                                        <div className="h-20 w-20 rounded-full border-4 border-white overflow-hidden relative bg-white shadow-sm">
                                            <Image 
                                                src={profile.avatarImage} 
                                                alt={profile.name} 
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                    
                                    <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-3">
                                        {profile.bio}
                                    </p>

                                    {/* Referrals */}
                                    <div className="flex items-center mt-4 bg-gray-50 p-2 rounded-lg">
                                        <div className="flex -space-x-2 mr-3">
                                            {profile.referencesavatar.map((avatar, index) => (
                                                <div key={index} className="relative h-6 w-6 rounded-full border-2 border-white overflow-hidden">
                                                    <Image
                                                        src={avatar}
                                                        alt={`Ref ${index}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs font-semibold text-[#FA6E80]">
                                            +{profile.totalref} Referrals
                                        </span>
                                    </div>

                                    {/* Navigation Links */}
                                    <div className="mt-6 space-y-1">
                                        {profile.urls.map((url) => (
                                            <Link 
                                                key={url.id} 
                                                href={url.link}
                                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                                            >
                                                {url.icon}
                                                {url.name}
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Invite Button */}
                                    <div className="mt-6">
                                        <Button className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm rounded-xl h-10 font-medium transition-all hover:shadow-md group">
                                            <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent group-hover:opacity-80">
                                                Send Invite
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Feed */}
                    <div className="col-span-1 md:col-span-8 lg:col-span-6">
                        <div className="max-w-xl mx-auto">
                            {children}
                        </div>
                    </div>

                    {/* Right Sidebar - Suggestions */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900">View Profiles</h3>
                                    <Link href="/explore" className="text-xs font-medium text-[#FA6E80] hover:underline">
                                        View all
                                    </Link>
                                </div>
                                
                                <div className="space-y-4">
                                    {similarAccounts.map((account) => (
                                        <Link 
                                            key={account.id} 
                                            href={account.proifleurl}
                                            className="flex items-center gap-3 group hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
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
                                                <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#6A89BE] transition-colors">
                                                    {account.name}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {account.role} • {account.totlerole}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <Link href="/explore" className="text-xs text-gray-400 hover:text-gray-600 block text-center">
                                        View crew directory
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
