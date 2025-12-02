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
        <div className={`flex justify-center items-center py-4 w-full ${poppins.variable} font-poppins`}>
            <div className="w-full mx-auto px-4 md:px-6">
                <div className={`grid ${isFilterOpen ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 -mt-15" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"} auto-rows-fr gap-6 md:gap-8`}>
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
        <Link href={`/whats-on/${event.slug}`} className="block h-full">
            <div className="flex flex-col items-start bg-[#FAFAFA] rounded-3xl p-4 gap-4 w-full transition-all duration-300 hover:shadow-lg h-full border border-transparent hover:border-gray-100">
                <div className="relative w-full aspect-[16/10] overflow-hidden rounded-2xl shadow-sm">
                    <Image
                        src={event.heroImage}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                    />

                    {/* Date Badge */}
                    <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm border border-gray-100">
                        <Calendar className="w-3.5 h-3.5 text-gray-600" strokeWidth={2} />
                        <span className="text-gray-700 text-xs font-medium whitespace-nowrap">
                            {dateLabel}
                        </span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col w-full relative flex-grow gap-3">

                    {/* Title */}
                    <h3 className="text-gray-900 text-lg md:text-xl font-medium leading-tight truncate w-full" title={event.title}>
                        {event.title}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-500 shrink-0" strokeWidth={2} />
                        <span className="text-gray-600 text-sm truncate">
                            {event.location}
                        </span>
                    </div>

                    {/* Footer: Author + Price Button */}
                    <div className="flex items-center justify-between w-full mt-auto pt-2">
                        {/* Author */}
                        <span className="text-gray-500 text-xs md:text-sm font-medium truncate pr-2">
                            Posted by <span className="text-gray-700">{event.host.name}</span>
                        </span>
                        <div className={`${event.isPaid ? 'bg-[#FCAF45]' : 'bg-[#31A7AC]'} rounded-full w-8 h-8 flex items-center justify-center shadow-sm shrink-0`}>
                            {event.isPaid ? (
                                <DollarSign className="w-4 h-4 text-white" strokeWidth={2.5} />
                            ) : (
                                <span className="text-white text-xs font-bold">Free</span>
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
        <div className={`flex justify-center items-center py-4 w-full ${poppins.variable} font-poppins`}>
            <div className="w-full mx-auto px-4 md:px-6">
                <div className={`grid ${isFilterOpen ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 -mt-15" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"} auto-rows-fr gap-6 md:gap-8`}>
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex flex-col items-start bg-[#FAFAFA] rounded-3xl p-4 gap-4 w-full animate-pulse">
                            <div className="relative w-full aspect-[16/10] bg-gray-200 rounded-2xl" />
                            <div className="flex flex-col w-full space-y-3 mt-2">
                                <div className="h-6 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                                <div className="flex items-center justify-between w-full mt-4 pt-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
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
