"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Calendar, CheckCircle } from "lucide-react";
import { useState } from "react";
import { whatsOnAPI } from "@/lib/api/whatson";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface RSVPProps {
    eventId: string;
    eventSchedule: Array<{
        id: string;
        dateLabel: string;
        timeRange: string;
        timezone: string;
    }>;
    maxSpotsPerPerson: number;
    isFullyBooked: boolean;
    isPaid: boolean;
    priceAmount: string;
}

export function RSVP({ eventId, eventSchedule, maxSpotsPerPerson, isFullyBooked, isPaid, priceAmount }: RSVPProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [numberOfSpots, setNumberOfSpots] = useState(1);
    const [attendeeNames, setAttendeeNames] = useState<string[]>(['']);
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [ticketInfo, setTicketInfo] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleOpenChange = (open: boolean) => {
        if (!user && open) {
            // Redirect to login if not authenticated
            router.push('/login');
            return;
        }
        setIsOpen(open);
        if (!open) {
            // Reset form when closing
            resetForm();
        }
    };

    const resetForm = () => {
        setNumberOfSpots(1);
        setAttendeeNames(['']);
        setContactEmail('');
        setContactPhone('');
        setSelectedDates([]);
        setTicketInfo(null);
        setError(null);
    };

    const handleSpotsChange = (value: number) => {
        const spots = Math.max(1, Math.min(value, maxSpotsPerPerson));
        setNumberOfSpots(spots);
        
        // Adjust attendee names array
        const newNames = [...attendeeNames];
        while (newNames.length < spots) {
            newNames.push('');
        }
        while (newNames.length > spots) {
            newNames.pop();
        }
        setAttendeeNames(newNames);
    };

    const handleAttendeeNameChange = (index: number, value: string) => {
        const newNames = [...attendeeNames];
        newNames[index] = value;
        setAttendeeNames(newNames);
    };

    const handleDateToggle = (scheduleId: string) => {
        setSelectedDates(prev => {
            if (prev.includes(scheduleId)) {
                return prev.filter(id => id !== scheduleId);
            } else {
                return [...prev, scheduleId];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (selectedDates.length === 0) {
            setError('Please select at least one date to attend');
            return;
        }

        if (!contactEmail) {
            setError('Contact email is required');
            return;
        }

        if (!contactPhone) {
            setError('Contact phone is required');
            return;
        }

        const filledNames = attendeeNames.filter(name => name.trim());
        if (filledNames.length === 0) {
            setError('Please provide at least one attendee name');
            return;
        }

        setLoading(true);
        try {
            const response = await whatsOnAPI.createRSVP(eventId, {
                number_of_spots: numberOfSpots,
                attendee_names: filledNames,
                contact_email: contactEmail,
                contact_phone: contactPhone,
                schedule_ids: selectedDates
            } as any);

            setTicketInfo(response.data);
        } catch (err: any) {
            console.error('RSVP failed:', err);
            setError(err.response?.data?.error || 'Failed to create RSVP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isFullyBooked) {
        return (
            <button 
                disabled
                className="flex-1 h-full sm:max-w-[208px] w-[363px] sm:w-full rounded-full bg-gray-300 px-6 py-3 text-base font-semibold text-gray-500 cursor-not-allowed"
            >
                Fully Booked
            </button>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button className="flex-1 h-full sm:max-w-[208px] w-[363px] sm:w-full rounded-full bg-[#FA6E80] px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-[#f4566d] transition-colors">
                    Count me in!
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-[824px] max-h-[90vh] overflow-y-auto">
                {ticketInfo ? (
                    <TicketDisplay ticket={ticketInfo} onClose={() => setIsOpen(false)} />
                ) : (
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle className="mb-2 text-2xl">RSVP</DialogTitle>
                            {isPaid && (
                                <div className="bg-[#FFF7EC] text-[#F5A524] px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 w-fit">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-base">$</span>
                                    {priceAmount}
                                </div>
                            )}
                        </DialogHeader>
                        
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-6 my-6">
                            {/* Event Schedule with Date Selection */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                                    <Calendar className="h-5 w-5 text-[#017A7C]" />
                                    <span>Select Date(s) to Attend *</span>
                                </div>
                                <div className="space-y-3 pl-8">
                                    {eventSchedule?.map((slot) => (
                                        <div 
                                            key={slot.id} 
                                            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                                                selectedDates.includes(slot.id) 
                                                    ? 'border-[#31A7AC] bg-[#31A7AC]/5' 
                                                    : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            <Checkbox
                                                id={`date-${slot.id}`}
                                                checked={selectedDates.includes(slot.id)}
                                                onCheckedChange={() => handleDateToggle(slot.id)}
                                                className="mt-0.5"
                                            />
                                            <label 
                                                htmlFor={`date-${slot.id}`}
                                                className="flex-1 cursor-pointer"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                                                    <span className="font-medium text-gray-900">{slot.dateLabel}</span>
                                                    <span className="text-gray-600">
                                                        {slot.timeRange} · {slot.timezone}
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {selectedDates.length > 0 && (
                                    <div className="pl-8 text-sm text-[#31A7AC] font-medium">
                                        {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Number of Spots */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Number of spots</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleSpotsChange(numberOfSpots - 1)}
                                        disabled={numberOfSpots <= 1}
                                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        -
                                    </button>
                                    <Input
                                        type="number"
                                        value={numberOfSpots}
                                        onChange={(e) => handleSpotsChange(parseInt(e.target.value) || 1)}
                                        min={1}
                                        max={maxSpotsPerPerson}
                                        className="w-[83px] rounded-[15px] text-center text-xl font-semibold"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleSpotsChange(numberOfSpots + 1)}
                                        disabled={numberOfSpots >= maxSpotsPerPerson}
                                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        +
                                    </button>
                                    <span className="text-sm text-gray-600">Max: {maxSpotsPerPerson}</span>
                                </div>
                            </div>

                            {/* Attendee Names */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Attendee Names</label>
                                {attendeeNames.map((name, index) => (
                                    <Input
                                        key={index}
                                        placeholder={`Attendee ${index + 1} Name`}
                                        value={name}
                                        onChange={(e) => handleAttendeeNameChange(index, e.target.value)}
                                        className="rounded-[15px]"
                                    />
                                ))}
                            </div>

                            <Separator />

                            {/* Contact Information */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Contact Information</label>
                                <Input
                                    placeholder="Email Address *"
                                    type="email"
                                    value={contactEmail}
                                    onChange={(e) => setContactEmail(e.target.value)}
                                    className="rounded-[15px]"
                                    required
                                />
                                <Input
                                    placeholder="Phone Number *"
                                    type="tel"
                                    value={contactPhone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                    className="rounded-[15px]"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-[#31A7AC] px-6 py-2 rounded-[10px] text-white hover:bg-[#279497] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Processing...' : isPaid ? 'Proceed to Payment' : 'Confirm RSVP'}
                            </button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

// Ticket Display Component
function TicketDisplay({ ticket, onClose }: { ticket: any; onClose: () => void }) {
    return (
        <div className="text-center space-y-6 py-6">
            <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">RSVP Confirmed!</h3>
            <div className="bg-gradient-to-br from-[#31A7AC] to-[#279497] p-8 rounded-2xl shadow-lg text-white">
                <div className="space-y-4">
                    <div>
                        <p className="text-sm opacity-90">Ticket Number</p>
                        <p className="text-3xl font-bold">{ticket.ticket_number}</p>
                    </div>
                    <div className="h-px bg-white/30" />
                    <div>
                        <p className="text-sm opacity-90">Reference Number</p>
                        <p className="text-xl font-semibold">{ticket.reference_number}</p>
                    </div>
                </div>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
                <p>A confirmation email has been sent to your registered email address.</p>
                <p>Please save your ticket number for check-in at the event.</p>
            </div>
            <button
                onClick={onClose}
                className="bg-[#31A7AC] text-white px-8 py-3 rounded-full hover:bg-[#279497] transition-colors font-semibold"
            >
                Done
            </button>
        </div>
    );
}
