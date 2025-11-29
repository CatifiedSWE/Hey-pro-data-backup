"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { set } from "date-fns";
import { DollarSign, Download, MessageCircle, MessageCircleMore } from "lucide-react";
import Image from "next/image";
import React from "react";
export default function DataTable({ rsvpEntries }: {
    rsvpEntries: Array<{
        id: string;
        name: string;
        ticketNo: string;
        reference: string;
        chatEnabled: boolean;
        paid: boolean;
    }>

}) {
    // Allow toggling paid status per user row
    const [entries, setEntries] = React.useState(rsvpEntries);

    const handleTogglePaid = (id: string) => {
        setEntries((prev) =>
            prev.map((entry) =>
                entry.id === id ? { ...entry, paid: !entry.paid } : entry
            )
        );
    }
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-5">
                <h3 className="text-lg font-semibold text-gray-800">RSVP ({rsvpEntries.length}/20)</h3>
                <button type="button" className="inline-flex items-center gap-2 rounded-[18px] bg-[#31A7AC] px-4 py-2 text-sm font-semibold text-white">
                    <Download className="h-4 w-4" />
                    Export Data
                </button>
            </div>
            <div className=" border-black/10 bg-white p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Ticket No</TableHead>
                            <TableHead>Reference No</TableHead>
                            <TableHead>Chat</TableHead>
                            <TableHead>Payment</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.map((entry) => (
                            <TableRow key={entry.id}>
                                <TableCell className="flex items-center gap-3">
                                    <Image src="/assets/whatson/host-avatar.svg" alt={entry.name} width={32} height={32} className="rounded-full" />
                                    {entry.name}
                                </TableCell>
                                <TableCell>{entry.ticketNo}</TableCell>
                                <TableCell>{entry.reference}</TableCell>
                                <TableCell className="text-center justify-center">
                                    <span className="inline-flex justify-center mx-auto text-center items-center gap-1 text-gray-600">
                                        <MessageCircleMore className="h-5 w-5" />
                                    </span>
                                </TableCell>
                                <TableCell className="cursor-pointer text-center justify-center" onClick={() => handleTogglePaid(entry.id)}>
                                    {entry.paid ? (
                                        <span className="inline-flex items-center gap-1">
                                            <span className="text-xs flex justify-center items-center text-[12px] font-normal gap-x-2">
                                                <span className="bg-[#FCAF45] rounded-full p-1">
                                                    <DollarSign className="h-[11px] w-[11px] text-white" />
                                                </span>
                                                Paid
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1">
                                            <span className="text-xs flex justify-center items-center text-[12px] font-normal gap-x-2">
                                                <span className="bg-grey rounded-full p-1">
                                                    <DollarSign className="h-[11px] w-[11px] text-white" />
                                                </span>
                                                Unpaid
                                            </span>
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}