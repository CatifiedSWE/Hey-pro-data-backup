import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
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
            name: "John Doe",
            image: "/image (1).png",
            role: "Cinematographer",
            totlerole: "15 Roles",
            proifleurl: "/profile/johndoe"
        },
        {
            id: 2,
            name: "Jane Smith",
            image: "/image (2).png",
            role: "Cinematographer",
            totlerole: "15 Roles",
            proifleurl: "/profile/janesmith"
        },
        {
            id: 3,
            name: "Alice Johnson",
            image: "/image (3).png",
            role: "Cinematographer",
            totlerole: "15 Roles",
            proifleurl: "/profile/alicejohnson"
        },
        {
            id: 4,
            name: "Bob Brown",
            image: "/image (4).png",
            role: "Cinematographer",
            totlerole: "15 Roles",
            proifleurl: "/profile/bobbrown"
        },
        {
            id: 5,
            name: "Eva Wilson",
            image: "/image (5).png",
            role: "Cinematographer",
            totlerole: "15 Roles",
            proifleurl: "/profile/evawilson"
        },
        {
            id: 6,
            name: "Michael Lee",
            image: "/image (6).png",
            role: "Cinematographer",
            totlerole: "15 Roles",
            proifleurl: "/profile/michaellee"
        }
    ];
    const profile: Profile = {
        name: "John Doe",
        bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        backgroundImage: "/bg.jpg",
        avatarImage: "/image (1).png",
        referencesavatar: ["/image (1).png", "/image (2).png", "/image (3).png"],
        totalref: 3000,
        profileurl: "/profile/johndoe",
        urls: [
            {
                id: '1',
                name: "Profile",
                icon: <UserRound />,
                link: "/profile/johndoe"
            },
            {
                id: '2',
                name: "Saved",
                icon: <BookmarkIcon />,
                link: "/profile/johndoe/saved"
            },
            {
                id: '3',
                name: "Help",
                icon: <HelpCircle />,
                link: "/profile/johndoe/help"
            },
            {
                id: '4',
                name: "setting",
                icon: <SettingsIcon />,
                link: "/profile/johndoe/settings"
            }
        ],
    };

    return (
        <div className="mt-22 px-2 sm:px-4">
            <div className="max-w-[962px] mx-auto flex flex-row justify-between items-center mt-[50px] gap-2 w-full">
                <span className="font-bold bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent">SLATE</span>
                <span className="h-[1px] w-full bg-gradient-to-r from-[#31A7AC] via-[#6A89BE] to-[#FA6E80]" />
            </div>
            <div className="flex flex-col md:flex-row justify-center mx-auto max-w-7xl w-full gap-3.5">
                {/* Sidebar Profile */}
                <div className="w-full md:w-80 md:h-screen mt-3 md:block flex-shrink-0 order-2 md:order-1 mb-4 md:mb-0 hidden ">
                    <div>
                        <div>
                            <Image src={profile.backgroundImage} alt={profile.name} width={284} height={72} className="w-full h-[72px] object-cover rounded-t-[13px]" />
                        </div>
                        <div>
                            <Image src={profile.avatarImage} alt={profile.name} width={96} height={96} className="w-17 h-17 rounded-full border-4 border-white -mt-12 object-cover" />
                        </div>
                        <div>
                            <h2 className="text-lg">{profile.name}</h2>
                            <p className="text-[12px] text-gray-600 mt-1">{profile.bio}</p>
                            <div className="flex items-center mt-3 w-full max-w-[160px]">
                                {profile.referencesavatar.map((avatar, index) => (
                                    <Image
                                        key={index}
                                        src={avatar}
                                        alt={`Reference ${index + 1}`}
                                        width={10}
                                        height={10}
                                        className={`w-[24px] h-[24px] rounded-full border-2 border-white ${index !== 0 ? '-ml-3' : ''} object-cover`}
                                    />
                                ))}
                                <span className="text-sm text-[#FA6E80] ml-2">+{profile.totalref} Referrals</span>
                            </div>
                            <div>
                                <div className="flex flex-col space-y-2 mt-2">
                                    {profile.urls.map((url) => (
                                        <div key={url.id} className="h-10 w-full rounded-[12.5px] bg-[#F8F8F8] px-2 py-2 mx-auto text-black">
                                            <Link href={url.link} className="text-sm flex flex-row items-center gap-2">
                                                {url.icon} {url.name}
                                            </Link>
                                        </div>
                                    ))}
                                    <div>
                                        <div className="p-[2px] rounded-[12.5px] bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
                                            <Button
                                                className="w-full bg-white hover:bg-white rounded-[10px] text-black"
                                                style={{
                                                    borderRadius: "10px",
                                                }}
                                            >
                                                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC]">
                                                    Send Invite
                                                </span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Main Content */}
                <div
                    className="w-full md:flex-1 md:h-screen order-1 md:order-2 mb-4 md:mb-0 overflow-y-auto overflow-x-hidden no-scrollbar"
                >
                    {children}
                </div>
                {/* Similar Accounts Sidebar */}
                <div className="w-full max-w-72 flex-col md:block flex-shrink-0 order-3 hidden">
                    <div>
                        <h1 className="mt-3 font-bold bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent">
                            View Profiles
                        </h1>
                        {similarAccounts.map((account) => (
                            <div key={account.id} className="mb-1 p-1 flex flex-col gap-[9px]">
                                <Link href={account.proifleurl} className="flex items-center space-x-2">
                                    <Image
                                        src={account.image}
                                        alt={account.name}
                                        width={80}
                                        height={80}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold">{account.name}</p>
                                        <div className="flex flex-row gap-1 justify-center items-center">
                                            <span className="text-sm text-gray-600">{account.role}</span>
                                            <span>+</span>
                                            <span className="text-sm text-gray-500">{account.totlerole}</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                        <Link href="#" className="text-[10px] text-black">View crew directory</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
