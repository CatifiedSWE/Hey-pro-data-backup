import React from 'react';
import Image from 'next/image';
import { Calendar, MapPin, DollarSign } from 'lucide-react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-poppins',
});
import { whatsOnEvents } from "@/data/whatsOnEvents";

export default function EventListingPage({ isFilterOpen }: { isFilterOpen?: boolean }) {
    return (
        <div className={`flex justify-center items-center py-1 ${poppins.variable} font-poppins`}>
            <div className="w-full mx-autopx-2 md:px-0">
                <div className={`grid ${isFilterOpen ? "sm:grid-cols-3 grid-cols-2 -mt-15" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"} auto-rows-fr gap-[7.46px] md:gap-[10px]`}>
                    {whatsOnEvents.map((event, index) => (
                        <EventCard key={index} event={event} />
                    ))}
                </div>
            </div>
        </div>
    );
}

const EventCard = ({ event }: { event: typeof whatsOnEvents[number] }) => {
    const dateLabel = event.dateRangeLabel;
    return (
        <Link href={`/whats-on/${event.slug}`}>
            <div className="flex flex-col items-start bg-[#FAFAFA] rounded-[18px] md:rounded-[24px] p-[6.4px] md:p-[8.6px] gap-[7.46px] md:gap-[10px] w-full transition-shadow duration-300">
                <div className="relative w-full aspect-[160/105] md:aspect-[214/140]">
                    <Image
                        src={event.heroImage}
                        alt="Event"
                        fill
                        className="object-cover rounded-[11.5px] md:rounded-[15.5px]"
                    />

                    {/* Date Badge - Frame 158 */}
                    <div className="absolute bottom-[4px] left-[4px] md:bottom-[10px] md:left-[5px] bg-white rounded-[21px] md:rounded-[28px] px-[6.4px] py-[3.2px] md:px-[8.6px] md:py-[4.3px] flex items-center gap-[3px] md:gap-[4px] shadow-[0_0.6px_5.6px_rgba(0,0,0,0.04)]">
                        <Calendar className="w-[9.6px] h-[9.6px] md:w-[13px] md:h-[13px] text-[#444444]" strokeWidth={1.5} />
                        <span className="text-[#444444] text-[7.7px] md:text-[10.3px] leading-[12px] md:leading-[15px] whitespace-nowrap">
                            {dateLabel}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col w-full relative">

                    {/* Title - Frame 37333 */}
                    <h3 className="text-black text-[11.5px] md:text-[15.5px] leading-[17px] md:leading-[23px] font-normal mb-[4.5px] md:mb-[6px] truncate w-full">
                        {event.title}
                    </h3>

                    {/* Location - Frame 37325 */}
                    <div className="flex items-center gap-[3.26px] md:gap-[4.38px] mb-[4.5px] md:mb-[6px]">
                        <MapPin className="w-[9.6px] h-[9.6px] md:w-[13px] md:h-[13px] text-[#444444]" strokeWidth={1.5} />
                        <span className="text-[#444444] text-[7.7px] md:text-[10.3px] leading-[12px] md:leading-[15px]">
                            {event.location}
                        </span>
                    </div>

                    {/* Footer: Author + Price Button */}
                    <div className="flex items-center justify-between w-full mt-auto">
                        {/* Author */}
                        <span className="text-[#444444] text-[7.5px] md:text-[10px] leading-[11px] md:leading-[15px]">
                            {event.host.name}
                        </span>
                        <div className="bg-[#FCAF45] rounded-full w-[17px] h-[17px] md:w-[23px] md:h-[23px] flex items-center justify-center shadow-sm">
                            <DollarSign className="w-[9.6px] h-[9.6px] md:w-[13px] md:h-[13px] text-white" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};