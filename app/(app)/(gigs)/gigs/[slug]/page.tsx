'use client'

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import GigDetails from "@/app/(app)/(gigs)/components/gig-details";
import apiCalling from "@/lib/apiCalling";
import { toast } from "sonner";

export default function GigDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const response = await apiCalling({
          method: 'get',
          route: `/gigs/slug/${slug}`,
        });

        if (response.status && response.data?.data) {
          setGig(response.data.data);
        } else {
          setNotFoundError(true);
        }
      } catch (error) {
        console.error('Error fetching gig:', error);
        toast.error('Failed to load gig details');
        setNotFoundError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [slug]);

  if (notFoundError) {
    return notFound();
  }

  if (loading) {
    return (
      <main className="bg-white px-4">
        <div className="mx-auto flex max-w-6xl justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FA6E80]"></div>
        </div>
      </main>
    );
  }

  if (!gig) {
    return notFound();
  }

  return (
    <main className="bg-white px-4">
      <div className="mx-auto flex max-w-6xl justify-center">
        <GigDetails {...gig} />
      </div>
    </main>
  );
}
