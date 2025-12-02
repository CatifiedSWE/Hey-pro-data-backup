"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Download, MessageCircleMore } from "lucide-react";
import Image from "next/image";
import React from "react";

interface RSVPEntry {
    id: string;
    user_id: string;
    ticket_number: string;
    reference_number: string;
    number_of_spots: number;
    payment_status: string;
    status: string;
    created_at: string;
    attendee_names?: string[];
    contact_email?: string;
    contact_phone?: string;
    user_profile?: {
        name: string;
        profile_photo_url: string;
    };
}

export default function DataTable({ 
    rsvpEntries, 
    eventId,
    onExport 
}: {
    rsvpEntries: RSVPEntry[];
    eventId: string;
    onExport: () => void;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-5">
                <h3 className="text-lg font-semibold text-gray-800">
                    RSVP ({rsvpEntries.length})
                </h3>
                <button 
                    type="button" 
                    onClick={onExport}
                    className="inline-flex items-center gap-2 rounded-[18px] bg-[#31A7AC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#288a8e] transition-colors"
                >
                    <Download className="h-4 w-4" />
                    Export Data
                </button>
            </div>
            
            {rsvpEntries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>No RSVPs yet</p>
                </div>
            ) : (
                <div className="border border-black/10 bg-white p-4 rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Ticket No</TableHead>
                                <TableHead>Reference No</TableHead>
                                <TableHead>Spots</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rsvpEntries.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Image 
                                            src={entry.user_profile?.profile_photo_url || "/assets/whatson/host-avatar.svg"} 
                                            alt={entry.user_profile?.name || 'User'} 
                                            width={32} 
                                            height={32} 
                                            className="rounded-full"
                                        />
                                        <div>
                                            <p className="font-medium">{entry.user_profile?.name || 'Unknown User'}</p>
                                            {entry.attendee_names && entry.attendee_names.length > 0 && (
                                                <p className="text-xs text-gray-500">
                                                    {entry.attendee_names.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{entry.ticket_number}</TableCell>
                                    <TableCell className="font-mono text-sm">{entry.reference_number}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center justify-center bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                                            {entry.number_of_spots}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs">
                                            <p className="text-gray-700">{entry.contact_email}</p>
                                            <p className="text-gray-500">{entry.contact_phone}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {entry.payment_status === 'paid' ? (
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="bg-[#FCAF45] rounded-full p-1.5">
                                                    <DollarSign className="h-3 w-3 text-white" />
                                                </span>
                                                <span className="text-xs font-medium text-gray-700">Paid</span>
                                            </span>
                                        ) : entry.payment_status === 'n/a' ? (
                                            <span className="text-xs font-medium text-gray-500">Free</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5">
                                                <span className="bg-gray-400 rounded-full p-1.5">
                                                    <DollarSign className="h-3 w-3 text-white" />
                                                </span>
                                                <span className="text-xs font-medium text-gray-700">Unpaid</span>
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                            entry.status === 'confirmed' 
                                                ? 'bg-green-100 text-green-700' 
                                                : entry.status === 'cancelled'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
