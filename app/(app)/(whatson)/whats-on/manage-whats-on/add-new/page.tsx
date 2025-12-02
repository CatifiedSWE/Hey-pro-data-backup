import { EventFormHandler } from "../event-form-handler";

const emptyEvent = {
    id: "new",
    title: "",
    slug: "",
    location: "",
    isOnline: false,
    isPaid: false,
    priceLabel: "Free",
    priceAmount: 0,
    priceCurrency: "AED",
    totalSpots: 20,
    isUnlimitedSpots: false,
    maxSpotsPerPerson: 1,
    dateRangeLabel: "",
    rsvpBy: "",
    host: {
        name: "",
        organization: "",
        avatar: "/assets/whatson/host-avatar.svg",
    },
    schedule: [],
    description: [""],
    terms: [""],
    tags: [],
    thumbnail: "",
    heroImage: "",
    status: "draft" as const
};

export default function AddNewWhatsOnPage() {
    return (
        <EventFormHandler 
            mode="create" 
            initialData={emptyEvent}
        />
    );
}