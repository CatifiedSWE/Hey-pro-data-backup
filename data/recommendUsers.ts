export type RecommendationUser = {
    id: string
    avatar: string
    name: string
    role: string
    handle: string
    location: string
    category: string
    mutualCount: number
    mutualAvatars: string[]
}

export const recommendationUsers: RecommendationUser[] = [
    {
        id: "1",
        name: "Aarav Mehta",
        avatar: "/image (1).png",
        role: "Lighting Operator",
        handle: "@aaravm",
        location: "UAE, Dubai",
        category: "Lighting Operator",
        mutualCount: 15,
        mutualAvatars: ["/image (2).png", "/image (3).png"],
    },
    {
        id: "2",
        name: "Arjun Verma",
        avatar: "/image (2).png",
        role: "Lighting Operator",
        handle: "@arjunv",
        location: "UAE, Dubai",
        category: "Lighting Operator",
        mutualCount: 15,
        mutualAvatars: ["/image (3).png", "/image (4).png"],
    },
    {
        id: "3",
        name: "Dev Malhotra",
        avatar: "/image (3).png",
        role: "Lighting Operator",
        handle: "@devm",
        location: "UAE, Dubai",
        category: "Lighting Operator",
        mutualCount: 15,
        mutualAvatars: ["/image (1).png", "/image (2).png"],
    },
    {
        id: "4",
        name: "Mira Joshi",
        avatar: "/image (4).png",
        role: "Lighting Operator",
        handle: "@miraj",
        location: "UAE, Dubai",
        category: "Lighting Operator",
        mutualCount: 15,
        mutualAvatars: ["/image (3).png", "/image (1).png"],
    },
    {
        id: "5",
        name: "Rohan Das",
        avatar: "/image (3).png",
        role: "Lighting Operator",
        handle: "@rohandas",
        location: "UAE, Dubai",
        category: "Lighting Operator",
        mutualCount: 15,
        mutualAvatars: ["/image (2).png", "/image (4).png"],
    },
    {
        id: "6",
        name: "Sanya Kapoor",
        avatar: "/image (1).png",
        role: "Lighting Operator",
        handle: "@sanyak",
        location: "UAE, Dubai",
        category: "Lighting Operator",
        mutualCount: 15,
        mutualAvatars: ["/image (4).png", "/image (2).png"],
    },
]
