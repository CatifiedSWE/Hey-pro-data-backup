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

interface TransformedEvent {
    id: string;
    slug: string;
    title: string;
    location: string;
    dateRangeLabel: string;
    isPaid: boolean;
    priceLabel: string;
    heroImage: string;
    host: {
        name: string;
        avatar: string;
        organization: string;
    };
}

interface EventListingPageProps {
    isFilterOpen?: boolean;
    events: TransformedEvent[];
    loading?: boolean;
}

export default function EventListingPage({ isFilterOpen, events, loading }: EventListingPageProps) {
    if (loading) {
        return <EventListingSkeleton isFilterOpen={isFilterOpen} />;
    }

    if (events.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className={`flex justify-center items-center py-1 ${poppins.variable} font-poppins`}>
            <div className="w-full mx-autopx-2 md:px-0">
                <div className={`grid ${isFilterOpen ? "sm:grid-cols-3 grid-cols-2 -mt-15" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"} auto-rows-fr gap-[7.46px] md:gap-[10px]`}>
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </div>
        </div>
    );
}

const EventCard = ({ event }: { event: TransformedEvent }) => {
    const dateLabel = event.dateRangeLabel;
    return (
        <Link href={`/whats-on/${event.slug}`}>
            <div className="flex flex-col items-start bg-[#FAFAFA] rounded-[18px] md:rounded-[24px] p-[6.4px] md:p-[8.6px] gap-[7.46px] md:gap-[10px] w-full transition-shadow duration-300 hover:shadow-md">
                <div className="relative w-full aspect-[160/105] md:aspect-[214/140]">
                    <Image
                        src={event.heroImage}
                        alt={event.title}
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
                        <div className={`${event.isPaid ? 'bg-[#FCAF45]' : 'bg-[#31A7AC]'} rounded-full w-[17px] h-[17px] md:w-[23px] md:h-[23px] flex items-center justify-center shadow-sm`}>
                            {event.isPaid ? (
                                <DollarSign className="w-[9.6px] h-[9.6px] md:w-[13px] md:h-[13px] text-white" strokeWidth={2.5} />
                            ) : (
                                <span className="text-white text-[8px] md:text-[10px] font-semibold">F</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

// Loading skeleton component
function EventListingSkeleton({ isFilterOpen }: { isFilterOpen?: boolean }) {
    return (
        <div className={`flex justify-center items-center py-1 ${poppins.variable} font-poppins`}>
            <div className="w-full mx-autopx-2 md:px-0">
                <div className={`grid ${isFilterOpen ? "sm:grid-cols-3 grid-cols-2 -mt-15" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"} auto-rows-fr gap-[7.46px] md:gap-[10px]`}>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex flex-col items-start bg-[#FAFAFA] rounded-[18px] md:rounded-[24px] p-[6.4px] md:p-[8.6px] gap-[7.46px] md:gap-[10px] w-full animate-pulse">
                            <div className="relative w-full aspect-[160/105] md:aspect-[214/140] bg-gray-200 rounded-[11.5px] md:rounded-[15.5px]" />
                            <div className="flex flex-col w-full space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                <div className="flex items-center justify-between w-full mt-2">
                                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                                    <div className="w-[17px] h-[17px] md:w-[23px] md:h-[23px] bg-gray-200 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Empty state component
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No events found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or check back later</p>
        </div>
    );
}
