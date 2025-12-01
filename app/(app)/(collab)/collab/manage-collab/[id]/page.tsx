"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ManageCollabHeader } from "../../../components/Header";
import { EditCollabForm } from "./EditCollabForm";
import { getCollabById, type CollabDetail } from "@/lib/api/collab";

export default function ManageCollabPage() {
    const params = useParams();
    const id = params.id as string;
    
    const [collab, setCollab] = useState<CollabDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchCollab = async () => {
            try {
                const data = await getCollabById(id);
                setCollab(data);
            } catch (err) {
                console.error('Failed to fetch collab:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCollab();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="space-y-10">
                <ManageCollabHeader />
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2FD3D8]" />
                </div>
            </div>
        );
    }

    if (error || !collab) {
        return notFound();
    }

    return (
        <div className="space-y-10">
            <ManageCollabHeader />
            <EditCollabForm collab={collab} />
        </div>
    );
}