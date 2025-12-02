"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Ticket, DollarSign, Trash2, Users, Eye } from "lucide-react";
import { Poppins } from "next/font/google";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { whatsOnAPI } from "@/lib/api/whatson";
import DataTable from "../../components/data-table";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-poppins",
});

const ManageCard = ({ 
    event, 
    onDelete, 
    onViewRSVPs 
}: { 
    event: any; 
    onDelete: (id: string) => void;
    onViewRSVPs: (id: string) => void;
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = () => {
        onDelete(event.id);
        setShowDeleteConfirm(false);
    };

    return (
        <div className="flex flex-col md:flex-row items-start bg-[#F8F8F8] rounded-[15px] p-[15px] gap-[30px] w-full md:w-[960px] md:h-[303px] transition-shadow hover:shadow-md relative">
            <div className="relative shrink-0 w-full md:w-auto">
                <div className="relative w-full h-[423px] md:w-[234px] md:h-[273px] rounded-[15.45px] overflow-hidden">
                    <Image
                        src={event.thumbnail_url || '/whats-on.png'}
                        alt={event.title}
                        fill
                        className="object-cover"
                    />
                </div>
            </div>
            <div className="flex flex-col flex-1 w-full gap-[8px] md:h-[255px] relative">
                {event.is_paid && (
                    <div className="absolute right-0 top-0 z-10 flex h-[25px] w-[25px] items-center justify-center rounded-full bg-[#FCAF45] shadow-[0.9px_0.9px_8.2px_rgba(0,0,0,0.04)]">
                        <DollarSign className="h-[14px] w-[14px] text-white" strokeWidth={3} />
                    </div>
                )}
                <div className="flex items-center gap-[9.4px] h-[27px]">
                    <div className="w-[27px] h-[27px] flex items-center justify-center">
                        <Ticket className="h-[20px] w-[20px] text-black" strokeWidth={1.5} />
                    </div>
                    <span className="text-[18px] leading-[27px] font-normal text-black font-poppins">
                        {event.spots_booked || 0}/{event.is_unlimited_spots ? '∞' : event.total_spots} Spots
                    </span>
                </div>

                <h3 className="text-[20px] leading-[30px] font-[600] text-[#444444] font-poppins line-clamp-2 md:line-clamp-1 w-full md:pr-[40px]">
                    {event.title}
                </h3>

                <p className="text-[16px] leading-[24px] font-normal text-[#444444] font-poppins line-clamp-3 md:line-clamp-2">
                    {event.description || 'No description available'}
                </p>
                <div className="flex flex-col justify-center gap-[10px] py-1">
                    {event.schedule?.slice(0, 2).map((slot: any, index: number) => (
                        <div key={`${slot.event_date}-${index}`} className="flex items-center gap-[10px]">
                            <Calendar className="h-[26px] w-[26px] text-black" strokeWidth={2.2} />
                            <span className="text-[14px] leading-[21px] font-normal text-black font-poppins">
                                {new Date(slot.event_date).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                })} • {slot.start_time} - {slot.end_time} {slot.timezone}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto flex flex-col md:flex-row md:items-center justify-between w-full gap-4 md:gap-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onViewRSVPs(event.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#31A7AC] text-white rounded-lg hover:bg-[#288a8e] transition-colors text-sm font-medium"
                        >
                            <Users className="h-4 w-4" />
                            View RSVPs ({event.rsvp_count || 0})
                        </button>
                        <Link
                            href={`/whats-on/manage-whats-on/${event.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                        >
                            <Eye className="h-4 w-4" />
                            Edit
                        </Link>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-2">Delete Event</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{event.title}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ManageWhatsOnPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [rsvpData, setRsvpData] = useState<any[]>([]);
    const [loadingRSVPs, setLoadingRSVPs] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }
        fetchMyEvents();
    }, [user]);

    const fetchMyEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await whatsOnAPI.getMyEvents();
            setEvents(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch events:', err);
            setError(err.response?.data?.error || 'Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId: string) => {
        try {
            await whatsOnAPI.deleteEvent(eventId);
            setEvents(events.filter(e => e.id !== eventId));
        } catch (err: any) {
            console.error('Failed to delete event:', err);
            alert(err.response?.data?.error || 'Failed to delete event');
        }
    };

    const handleViewRSVPs = async (eventId: string) => {
        try {
            setLoadingRSVPs(true);
            setSelectedEventId(eventId);
            const response = await whatsOnAPI.getRSVPList(eventId);
            setRsvpData(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch RSVPs:', err);
            alert(err.response?.data?.error || 'Failed to load RSVPs');
            setSelectedEventId(null);
        } finally {
            setLoadingRSVPs(false);
        }
    };

    const handleExportCSV = async (eventId: string) => {
        try {
            const blob = await whatsOnAPI.exportRSVPs(eventId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const event = events.find(e => e.id === eventId);
            link.setAttribute('download', `${event?.slug || eventId}-rsvps.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Failed to export CSV:', err);
            alert('Failed to export CSV');
        }
    };

    if (loading) {
        return (
            <div className={`space-y-10 p-4 md:p-8 ${poppins.variable} font-poppins bg-white min-h-screen`}>
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-gray-200 rounded w-1/3" />
                    <div className="h-64 bg-gray-200 rounded" />
                    <div className="h-64 bg-gray-200 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-10 p-4 md:p-8 ${poppins.variable} font-poppins bg-white min-h-screen`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-semibold">
                    Manage What&apos;s On
                </span>
                <Link
                    href="/whats-on/manage-whats-on/add-new"
                    className="rounded-[10px] bg-[#31A7AC] px-6 py-2 text-white font-[600] h-[44px] items-center justify-center flex w-[180px] hover:bg-[#288a8e] transition-colors"
                >
                    Create What&apos;s on
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {events.length === 0 && !loading && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">You haven't created any events yet</p>
                    <Link
                        href="/whats-on/manage-whats-on/add-new"
                        className="inline-block bg-[#31A7AC] text-white px-6 py-3 rounded-full hover:bg-[#288a8e] transition-colors"
                    >
                        Create Your First Event
                    </Link>
                </div>
            )}

            <section className="flex flex-col gap-[10px] items-center md:items-start">
                {events.map((event) => (
                    <ManageCard 
                        key={event.id} 
                        event={event} 
                        onDelete={handleDelete}
                        onViewRSVPs={handleViewRSVPs}
                    />
                ))}
            </section>

            {/* RSVP Modal */}
            {selectedEventId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">Event RSVPs</h2>
                            <button
                                onClick={() => setSelectedEventId(null)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6">
                            {loadingRSVPs ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Loading RSVPs...</p>
                                </div>
                            ) : (
                                <DataTable 
                                    rsvpEntries={rsvpData}
                                    eventId={selectedEventId}
                                    onExport={() => handleExportCSV(selectedEventId)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
