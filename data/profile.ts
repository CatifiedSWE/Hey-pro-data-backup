
export const profileData = {
    id: "1",
    avtar: "/image (2).png",
    backgroundAvtar: "/bg.jpg",
    persionalDetails: {
        name: "John Doe",
        aliasName: "JD",
        location: "Tamil Nadu, Chennai ",
        availability: "Available",
        shortAbout:
            "Award-winning cinematographer with 10+ years in narrative film and commercial work. Visual storytelling and collaborative filmmaking.",
        links: [
            {
                label: "LinkedIn",
                url: "https://www.linkedin.com/in/johndoe",
            },
            {
                label: "Portfolio",
                url: "https://johndoe.com/portfolio",
            },
            {
                label: "GitHub",
                url: "https://github.com/johndoe",
            },
            {
                label: "Twitter",
                url: "https://twitter.com/johndoe",
            },
        ],
    },
    language: ["English", "Spanish", "French"],
    countryCode: "IN",
    email: "johndoe@email.com",
    phoneNumber: "9876543230",
    AvailableCountriesForTravel: [
        { name: "Bolivia", dial_code: "+591", code: "BO", flag: "🇧🇴" },
        { name: "Bosnia and Herzegovina", dial_code: "+387", code: "BA", flag: "🇧🇦" },
        { name: "Botswana", dial_code: "+267", code: "BW", flag: "🇧🇼" },
        { name: "Brazil", dial_code: "+55", code: "BR", flag: "🇧🇷" },
    ],
    profileCompletion: 100,
    about: `I'm a passionate cinematographer who believes in the power of visual storytelling. With over a decade of experience in the film industry, I've had the privilege of working on everything from intimate indie films to large-scale commercial productions.
  My approach combines technical expertise with creative vision, always in service of the story. I specialize in natural lighting and handheld camera work, bringing an authentic, human quality to every frame.`,
    skills: [
        {
            id: "1",
            department: "Cinematography",
            role: "Director of Photography",
            description:
                "the art and science of capturing moving images for films and television, serving as visual storytelling",
            experience: {
                value: "intern",
                title: "Intern",
                description: "helped on set, shadowed role",
            },
            rate: "$500 per day",
            isPublic: true,

        },
        {
            id: "2",
            department: "Editing",
            role: "Color Grading",
            description:
                "a post-production process that involves the artistic manipulation of an image's or video's color to cre...",
            experience: {
                value: "learning",
                title: "Learning | Assisted",
                description: "assisted the role under supervision",
            },
            rate: "$500 per day",
            isPublic: true,
        },
        {
            id: "3",
            department: "Editing",
            role: "Editor",
            description: "",
            experience: {
                value: "competent",
                title: "Competent | Independent",
                description: "can handle role solo",
            },
            rate: "$500 per day",
            isPublic: true,
        },

    ],
    roles: ["Director", "Cinematographer", "Editor", "Producer", "Screenwriter"],
    positions: ["Freelance Cinematographer", "Founder • HeyProData • Film Tech SaaS",],
    credits: [
        {
            id: "cred-01",
            creditTitle: "City of Echoes",
            productionType: "Feature Film",
            role: "Director of Photography",
            projectTitle: "City of Echoes",
            brandClient: "Independent",
            localCompany: "Aurora Pictures",
            internationalCompany: "Parallax Studios",
            country: "India",
            releaseYear: "2023",
            isUnreleased: false,
            headlineStats: "13 Awards • 23 Nominations • 4 Official Selections",
            awardsSummary: "Winner: Golden Sparrow Grand Jury | 2 Audience Choice Awards",
            awards: [
                { title: "Best Director", detail: "Cannes Film Festival 2025" },
                { title: "Best Cinematography", detail: "Raindance 2024" },
                { title: "Audience Choice", detail: "Mumbai International 2024" },
                { title: "Best Sound Design", detail: "TIFF 2023" },
                { title: "Best Sound Design", detail: "TIFF 2023" },
                { title: "Best Sound Design", detail: "TIFF 2023" },
                { title: "Best Sound Design", detail: "TIFF 2023" },
                { title: "Best Sound Design", detail: "TIFF 2023" },
            ],
            startDate: new Date("2021-04-12"),
            endDate: new Date("2022-02-18"),
            imgUrl: "/credit.png",
            image: "/image (1).png",
            description:
                "Neo-noir feature following a sound designer who uncovers political coverups through archived street recordings. Shot on Alexa Mini with Atlas Orion glass and practical neon setups.",
        },
        {
            id: "cred-02",
            creditTitle: "Aurora District",
            productionType: "Commercial",
            role: "Creative Director",
            projectTitle: "Aurora District",
            brandClient: "Northwind Airlines",
            localCompany: "FrameForge",
            internationalCompany: "Beacon & Co",
            country: "United Arab Emirates",
            releaseYear: "2022",
            isUnreleased: false,
            headlineStats: "4 National Awards • 1 Oscar Shortlist",
            awardsSummary: "1 Award for Production Management",
            awards: [
                { title: "Best Production Design", detail: "Clios Travel 2022" },
                { title: "Gold Winner", detail: "AdWeek Motion Awards" },
                { title: "Best Use of LED Volume", detail: "Shots Awards 2022" },
            ],
            startDate: new Date("2020-11-03"),
            endDate: new Date("2021-06-21"),
            imgUrl: "/credit.png",
            image: "/image (2).png",
            description:
                "Premium travel spot showcasing long-form steadicam moves across an LED volume tunnel to highlight the airline's new Arctic route experience.",
        },
        {
            id: "cred-03",
            creditTitle: "Fragments of Light",
            productionType: "Music Video",
            role: "Director",
            projectTitle: "Fragments of Light",
            brandClient: "Riverline Records",
            localCompany: "Silvergrain Studio",
            internationalCompany: "Chromatic Riot",
            country: "United Kingdom",
            releaseYear: "2021",
            isUnreleased: false,
            headlineStats: "6 Festival Selections • 3 Wins",
            awardsSummary: "Won: Best Conceptual Video at UKMVAs",
            awards: [
                { title: "Best Music Video", detail: "UKMVAs 2021" },
                { title: "Best Concept", detail: "Berlin Music Awards" },
                { title: "Audience Pick", detail: "SXSW 2022" },
            ],
            startDate: new Date("2020-02-10"),
            endDate: new Date("2020-05-28"),
            imgUrl: "/credit.png",
            image: "/image (3).png",
            description:
                "Conceptual narrative built around volumetric capture and motion-controlled macro passes to visualize synesthesia triggered by sound.",
        },
        {
            id: "cred-04",
            creditTitle: "Midnight Cartography",
            productionType: "Documentary",
            role: "Executive Producer",
            projectTitle: "Midnight Cartography",
            brandClient: "Slate Originals",
            localCompany: "Tactile Stories",
            internationalCompany: "Northlight Media",
            country: "Canada",
            releaseYear: "2025",
            isUnreleased: true,
            headlineStats: "In Post • Premiering Sundance 2025",
            awardsSummary: "Shortlisted for Impact Doc Fund",
            awards: [
                { title: "In Post", detail: "Episodes locked; finishing in Dolby Vision" },
                { title: "Grant Recipient", detail: "Polar Conservation Alliance" },
            ],
            startDate: new Date("2023-08-01"),
            endDate: new Date("2024-12-15"),
            imgUrl: "",
            image: "/image (4).png",
            description:
                "Limited series chronicling polar navigation crews mapping melting ice lanes with lidar-equipped drones. Currently in post with hybrid animation overlays.",
        },
    ],
    rate: [
        { id: "rate-1", label: "$200 per day", value: "200" },
        { id: "rate-2", label: "$300 per day", value: "300" },
        { id: "rate-3", label: "$400 per day", value: "400" },
        { id: "rate-4", label: "$500 per day", value: "500" },
        { id: "rate-5", label: "$600 per day", value: "600" },
        { id: "rate-6", label: "$700 per day", value: "700" },
        { id: "rate-7", label: "$800 per day", value: "800" },
        { id: "rate-8", label: "$900 per day", value: "900" },
        { id: "rate-9", label: "$1000 per day", value: "1000" },
    ],
    recomendPeoples: [
        {
            imgUrl: "/image (2).png",
        },
        {
            imgUrl: "/image (1).png",
        },
        {
            imgUrl: "/image (1).png",
        },
    ],
}

export const highlightsData = [
    {
        id: "1",
        title: "Highlights",
        description:
            `Cinematography is the art and technology of capturing motion pictures to tell a story visually. It involves using techniques like camera angles, lighting, composition, color, and camera movement to evoke emotions, create a mood, and direct the audience's focus to enhance the narrative. A director of photography (DP) or cinematographer is responsible for making these creative and technical choices, working with their crews to achieve the director's vision.`,
        images: "/image (3).png",
    },
    {
        id: "2",
        title: "Cinematography",
        description:
            `Cinematography is the art and technology of capturing motion pictures to tell a story visually. It involves using techniques like camera angles, lighting, composition, color, and camera movement to evoke emotions, create a mood, and direct the audience's focus to enhance the narrative. A director of photography (DP) or cinematographer is responsible for making these creative and technical choices, working with their crews to achieve the director's vision.`,
        images: "/image (4).png",
    },
    {
        id: "3",
        title: "Editing",
        description:
            `Cinematography is the art and technology of capturing motion pictures to tell a story visually. It involves using techniques like camera angles, lighting, composition, color, and camera movement to evoke emotions, create a mood, and direct the audience's focus to enhance the narrative. A director of photography (DP) or cinematographer is responsible for making these creative and technical choices, working with their crews to achieve the director's vision.`,
        images: "/image (5).png",
    },
]
