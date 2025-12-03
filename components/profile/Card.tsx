import React from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";

export interface ProfileCardProps {
    name: string;
    location?: string;
    description?: string;
    skills?: string[];
    coverSrc?: string;
    avatarSrc?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
    name,
    location,
    description,
    skills = [],
    coverSrc = "/default-banner.png",
    avatarSrc = "/default-profile.png",
}) => {
    return (
        <article className="bg-white shadow-lg rounded-2xl overflow-hidden w-full">
            {/* responsive cover: height scales with viewport on small screens (no cropping), md+ keeps fixed max and uses object-cover */}
            <div
                className="relative w-full bg-gray-100"
                style={{
                    // min 112px, preferred 22vw, max 224px (adjust as needed)
                    height: "clamp(112px, 22vw, 224px)",
                }}
            >
                <Image
                    src={coverSrc}
                    alt={`${name} cover`}
                    fill
                    sizes="100vw"
                    className="object-contain md:object-cover"
                    style={{ objectPosition: "center" }}
                />
            </div>

            <div className="px-4 pt-4 pb-6">
                <div className="-mt-10 flex items-center justify-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white">
                        <Image src={avatarSrc} alt={`${name} avatar`} width={96} height={96} className="object-cover" />
                    </div>
                </div>

                <div className="mt-4 text-center">
                    {location && (
                        <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
                            <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
                            <span>{location}</span>
                        </div>
                    )}


                    {description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-3 text-left">{description}</p>
                    )}

                    {skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap justify-center gap-2">
                            {skills.map((s) => (
                                <span key={s} className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-100">
                                    {s}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};

export default ProfileCard;
