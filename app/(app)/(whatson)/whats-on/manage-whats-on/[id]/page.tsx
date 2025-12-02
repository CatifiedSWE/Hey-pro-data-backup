'use client';

import { notFound } from "next/navigation";
import React, { useState, useEffect } from "react";
import { EventFormHandler } from "../event-form-handler";
import DataTable from "../../../components/data-table";
import { whatsOnAPI } from "@/lib/api/whatson";
import { transformEventForDetail } from "@/lib/utils/whatson-transforms";
import axios from "@/lib/axios";

type ManageWhatsOnEditPageProps = {
    params: Promise<{ id: string }>;
};

export default function ManageWhatsOnEditPage({ params }: ManageWhatsOnEditPageProps) {
    const [eventId, setEventId] = React.useState<string | null>(null);
    const [event, setEvent] = useState<any>(null);
    const [rsvpEntries, setRsvpEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        params.then(({ id }) => {
            setEventId(id);
            fetchEventData(id);
        });
    }, [params]);

    const fetchEventData = async (id: string) => {
        try {
            setLoading(true);
            
            // Fetch event details
            const eventResponse = await whatsOnAPI.getEventById(id);
            const eventData = transformEventForDetail(eventResponse.data);
            setEvent(eventData);

            // Fetch RSVP list
            try {
                const rsvpResponse = await whatsOnAPI.getRSVPList(id);
                const rsvps = rsvpResponse.data.map((rsvp: any) => ({
                    id: rsvp.id,
                    name: rsvp.user?.name || 'Unknown',
                    ticketNo: rsvp.ticket_number,
                    reference: rsvp.reference_number,
                    chatEnabled: false,
                    paid: rsvp.payment_status === 'paid'
                }));
                setRsvpEntries(rsvps);
            } catch (rsvpErr) {
                console.warn('Could not fetch RSVPs:', rsvpErr);
                setRsvpEntries([]);
            }

        } catch (err: any) {
            console.error('Failed to fetch event:', err);
            setError(err.response?.data?.error || 'Failed to load event');
            notFound();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#31A7AC] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading event...</p>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600">{error || 'Event not found'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <EventFormHandler 
                mode="edit" 
                eventId={eventId || undefined}
                initialData={event}
            />
            {rsvpEntries.length > 0 && (
                <DataTable rsvpEntries={rsvpEntries} />
            )}
        </div>
    );
}
