"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Heart, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { whatsOnAPI } from "@/lib/api/whatson";
import { transformEventForDetail } from "@/lib/utils/whatson-transforms";
import { RSVP } from "../../components/rsvp";

export default function WhatsOnPage() {
    const params = useParams();
    const slug = params?.slug as string;
    
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (slug) {
            fetchEventDetails();
        }
    }, [slug]);

    const fetchEventDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Use slug as ID (you might need to adjust based on your API)
            const response = await whatsOnAPI.getEventById(slug);
            const transformedEvent = transformEventForDetail(response.data);
            setEvent(transformedEvent);
        } catch (err: any) {
            console.error('Failed to load event:', err);
            setError(err.response?.data?.error || 'Event not found');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 bg-white px-5 py-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                    <div className="h-64 bg-gray-200 rounded" />
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                        <div className="h-4 bg-gray-200 rounded w-4/6" />
                    </div>
                </div>
            </section>
        );
    }

    if (error || !event) {
        return (
            <section className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-6 bg-white px-5 py-20">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The event you\'re looking for doesn\'t exist.'}</p>
                    <Link 
                        href="/whats-on" 
                        className="inline-flex items-center gap-2 bg-[#31A7AC] text-white px-6 py-3 rounded-full hover:bg-[#279497]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Events
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 bg-white px-5 py-6 text-[#000000] sm:px-4">
            <div className="overflow-hidden">
                <div className=" mb-5 flex flex-row items-center justify-between gap-2 text-sm text-[#000000] sm:justify-start">
                    <div className="flex flex-row items-center justify-center">

                        <Link href="/whats-on" className="font-medium text-[#31A7AC] hover:underline flex items-center"> <ArrowLeft className="h-4 w-4" />
                            back to What&apos;s on
                        </Link>
                    </div>
                    <div>
                        {event.isPaid && (
                            <span className=" inline-flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#FCAF45] text-lg font-semibold text-[#ffffff] sm:hidden">
                                $
                            </span>
                        )}
                    </div>

                </div>

                <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-4">
                                <span className=" hidden sm:inline-flex items-center rounded-full bg-[#FFF3F5] px-3 py-1 text-sm font-semibold text-[#F8909D]">
                                    Hosted by {event.host.organization}
                                </span>
                                <h1 className="text-[31px] font-[400] leading-[46px] text-[#000000]">{event.title}</h1>
                                <div className="sm:flex hidden items-center gap-3 text-sm text-[#000000]">
                                    <Image
                                        src={event.host.avatar}
                                        alt={event.host.name}
                                        width={48}
                                        height={48}
                                        className="rounded-full border border-gray-200"
                                    />
                                    <div className="leading-tight">
                                        <p className="text-base font-semibold text-[#000000]">Hosted by {event.host.organization}</p>
                                        <p className="text-sm text-[#000000]">{event.host.name}</p>
                                    </div>
                                </div>
                            </div>
                            {event.isPaid && (
                                <span className=" h-10 w-10 items-center justify-center rounded-full bg-white text-lg font-semibold text-[#F5A524] shadow-lg hidden sm:inline-flex">
                                    $
                                </span>
                            )}
                        </div>

                        <div className="sm:hidden">
                            <div className="relative mt-2 aspect-[3/4] w-full overflow-hidden rounded-[15px] bg-[#111111]">
                                <Image
                                    src={event.heroImage}
                                    alt={event.title}
                                    fill
                                    sizes="100vw"
                                    className="object-cover"
                                />
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-4">
                                <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-[#FA596E]">
                                    <Heart className="h-5 w-5" />
                                </button>
                                <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-[#31A7AC]">
                                    <Share2 className="h-5 w-5" />
                                </button>
                            </div>
                            <div className=" flex flex-row items-center gap-3 text-sm text-[#000000]">
                                <Image
                                    src={event.host.avatar}
                                    alt={event.host.name}
                                    width={48}
                                    height={48}
                                    className="rounded-full border border-gray-200"
                                />
                                <div className="leading-tight">
                                    <p className="text-[18px] font-[400] text-[#000000]">Hosted by <span className="font-[600] text-[#000000]">{event.host.organization}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 flex flex-row w-[353px] sm:w-[554px] justify-center items-start sm:gap-6 gap-2 bg-white px-0 py-0">

                            <Calendar className="h-[30px] w-[30px] text-[#000000]" />
                            <div className="">
                                {event.schedule.map((slot: any, index: number) => (
                                    <div key={`${slot.dateLabel}-${index}`} className="flex flex-col gap-1 text-sm text-[#000000] sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-2 font-[400] sm:text-[18px] text-[14px] text-[#000000]">
                                            <span>{slot.dateLabel}</span><p className="text-[#000000]">
                                                {slot.timeRange} · {slot.timezone}
                                            </p>
                                        </div>

                                    </div>
                                ))}

                            </div>

                        </div>

                        <section className="space-y-4">
                            <h2 className="text-[24px] font-semibold text-[#000000]">Details</h2>
                            {event.isPaid && (
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF7EC] px-4 py-2 text-sm font-semibold text-[#F5A524]">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base">$</span>
                                    {event.priceLabel}
                                </div>
                            )}
                            <div className="space-y-3 text-sm leading-relaxed text-[#000000]">
                                {event.description.map((paragraph: string, index: number) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                            <div className="mt-6 sm:hidden block">
                                <p className="text-[18px] font-[400] text-gray-900 w-full text-center">Discover with Tags</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {event.tags.map((tag: string) => (
                                        <span key={tag} className="rounded-[50px] h-[32px] justify-center items-center flex bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="space-y-3 mb-5">
                            <h3 className="text-lg font-semibold text-[#000000]">T&amp;Cs</h3>
                            <ol className="list-decimal space-y-2 pl-6 text-sm text-[#000000]">
                                {event.terms.map((term: string, index: number) => (
                                    <li key={index}>{term}</li>
                                ))}
                            </ol>
                        </section>
                    </div>

                    <div className="hidden w-full max-w-sm flex-col gap-6 sm:flex">
                        <div className="bg-white p-5 ">
                            <div className="relative aspect-[3/4] overflow-hidden">
                                <Image
                                    src={event.heroImage}
                                    alt={event.title}
                                    fill
                                    sizes="(min-width: 1024px) 384px, 100vw"
                                    className="object-cover grayscale rounded-3xl"
                                />
                            </div>
                            <div className="mt-4 flex items-center justify-center gap-3">
                                <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-[#F56B7B]">
                                    <Heart className="h-5 w-5" />
                                </button>
                                <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:text-[#017A7C]">
                                    <Share2 className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="mt-6">
                                <p className="text-sm font-semibold text-gray-900">Discover with Tags</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {event.tags.map((tag: string) => (
                                        <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="bg-white shadow-none sm:shadow rounded-full justify-between items-center max-h-[90px] px-6 py-2 flex flex-col sm:flex-row sm:mb-5 mb-30">
                <div className="flex flex-col  gap-1 sm:mb-0 mb-3">
                    <div className="flex flex-row items-center gap-3.5">
                        <p className="text-sm text-gray-500">
                            RSVP by <span className="font-semibold text-gray-900">{event.rsvpBy}</span>
                        </p>
                        {event.isPaid && (
                            <div className="flex flex-row items-center gap-2 text-sm text-gray-500">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FCAF45] text-lg font-semibold text-white">$</span>
                                <span className="font-semibold text-gray-900">{event.priceLabel}</span>
                            </div>
                        )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                </div>
                <RSVP 
                    eventId={event.id} 
                    eventSchedule={event.schedule}
                    maxSpotsPerPerson={event.maxSpotsPerPerson}
                    isFullyBooked={event.isFullyBooked}
                    isPaid={event.isPaid}
                    priceAmount={event.priceLabel}
                />
            </footer>
        </section>
    );
}
