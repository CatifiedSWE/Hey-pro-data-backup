
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import { EditWhatsOnForm } from "../../../components/EditWhatsOnForm";
import { getWhatsOnEventById } from "@/data/whatsOnEvents";
import { Button } from "@/components/ui/button";
import DataTable from "../../../components/data-table";
type ManageWhatsOnEditPageProps = {
    params: { id: string };
};
const rsvpEntries = Array.from({ length: 6 }).map((_, index) => ({
    id: `rsvp-${index + 1}`,
    name: "Aarav Mehta",
    ticketNo: `00${(index % 3) + 1}`,
    reference: "#1234567890ABC",
    chatEnabled: index % 2 === 0,
    paid: index % 3 !== 1,
}));

export default async function ManageWhatsOnEditPage({ params }: ManageWhatsOnEditPageProps) {

    const { id } = await params;
    const event = getWhatsOnEventById(id);

    if (!event) {
        notFound();
    }


    return (
        <div className="space-y-8">
            <div className=" flex flex-col sm:flex-row gap-y-2 sm:gap-0 sm:items-center sm:justify-between p-4 bg-white rounded-lg">
                <span className="bg-gradient-to-r from-[#FA6E80] via-[#6A89BE] to-[#31A7AC] bg-clip-text text-transparent text-3xl font-semibold">Manage What&apos;s On</span>
                <div className="flex gap-4">
                    <Link href={'/whats-on/manage-whats-on'} className="rounded-lg border border-[#31A7AC] h-[44px] px-4 py-2 text-[#31A7AC] hover:bg-[#f0f0f0]"> Discard</Link>
                    <Button className="rounded-lg border h-[44px] hover:bg-[#31A7AC] bg-[#31A7AC] px-4 py-2 text-sm font-semibold text-white">
                        Save Event
                    </Button>
                </div>
            </div>
            <EditWhatsOnForm event={event} />
            <DataTable rsvpEntries={rsvpEntries} />
        </div>
    );
}
