

const chatData = [
    {
        id: 1,
        groupid: ["grp-1", "grp-2", "grp-3", "grp-4", "grp-5", "grp-6", "grp-7", "grp-8"],
        messageId: "msg-1",
        name: 'Victor George',
        message: 'Who can I get started worki...',
        image: '/image (1).png',
        badge: null,
        state: 'online'
    },
    {
        id: 2,
        groupid: "grp-2",
        messageId: "msg-2",
        name: 'Mary Johns',
        message: 'Who can I get started worki...',
        image: '/image (2).png',
        badge: null,
        state: 'offline'
    },
    {
        id: 3,
        groupid: "grp-1",
        messageId: "msg-3",
        name: 'Maddy',
        message: 'Who can I get started worki...',
        image: '/image (3).png',
        badge: 2,
        state: 'online'
    },
    {
        id: 4,
        groupid: "grp-1",
        messageId: "msg-4",
        name: 'Lavin JD',
        message: 'Who can I get started worki...',
        image: '/image (4).png',
        badge: null,
        state: 'offline'
    },
    {
        id: 5,
        groupid: "grp-1",
        messageId: "msg-5",
        name: 'Victor George',
        message: 'Who can I get started worki...',
        image: '/image (1).png',
        badge: null,
        state: 'offline'
    },
    {
        id: 6,
        groupid: "grp-1",
        messageId: "msg-6",
        name: 'Mary Johns',
        message: 'Who can I get started worki...',
        image: '/image (2).png',
        badge: null,
        state: 'offline'
    },
    {
        id: 7,
        groupid: "grp-1",
        messageId: "msg-7",
        name: 'Maddy',
        message: 'Who can I get started worki...',
        image: '/image (3).png',
        badge: 2,
        state: 'online'
    },
    {
        id: 8,
        groupid: "grp-1",
        messageId: "msg-8",
        name: 'Lavin JD',
        message: 'Who can I get started worki...',
        image: '/image (4).png',
        badge: null,
        state: 'offline'
    }
];
const Groups = [
    {
        id: 1,
        messageId: "grp-1",

        name: 'Photography Lovers',
        message: 'New event coming up soon...',
        groupImage: "/image (1).png",
        image: ['/image (1).png', '/image (2).png', '/image (3).png'],
        badge: 5,
        noofOnlinePeople: 3
    },
    {
        id: 2,
        messageId: "grp-2",
        name: 'Book Club',
        message: 'Next meeting on Friday...',
        groupImage: "/image (4).png",
        image: ['/image (4).png', '/image (5).png'],
        badge: 3,
        noofOnlinePeople: 2
    }, {
        id: 3,
        messageId: "grp-3",
        name: 'Photography Lovers',
        message: 'New event coming up soon...',
        groupImage: "/image (1).png",
        image: ['/image (1).png', '/image (2).png', '/image (3).png'],
        badge: 5,
        noofOnlinePeople: 3
    },
    {
        id: 4,
        messageId: "grp-4",
        name: 'Book Club',
        message: 'Next meeting on Friday...',
        image: ['/image (4).png', '/image (5).png'],
        badge: 3,
        noofOnlinePeople: 2
    },
    {
        id: 5,
        messageId: "grp-5",
        name: 'Photography Lovers',
        message: 'New event coming up soon...',
        image: ['/image (1).png', '/image (2).png', '/image (3).png'],
        badge: 5,
        noofOnlinePeople: 3
    },
    {
        id: 6,
        messageId: "grp-6",
        name: 'Book Club',
        message: 'Next meeting on Friday...',
        image: ['/image (4).png', '/image (5).png'],
        badge: 3,
        noofOnlinePeople: 2
    },
    {
        id: 7,
        messageId: "grp-7",
        name: 'Photography Lovers',
        message: 'New event coming up soon...',
        image: ['/image (1).png', '/image (2).png', '/image (3).png'],
        badge: 5,
        noofOnlinePeople: 3
    },
    {
        id: 8,
        messageId: "grp-8",
        name: 'Book Club',
        message: 'Next meeting on Friday...',
        image: ['/image (4).png', '/image (5).png'],
        badge: 3,
        noofOnlinePeople: 2
    },
    {
        id: 9,
        messageId: "grp-9",
        name: 'Photography Lovers',
        message: 'New event coming up soon...',
        image: ['/image (1).png', '/image (2).png', '/image (3).png'],
        badge: 5,
        noofOnlinePeople: 0
    },
    {
        id: 10,
        messageId: "grp-10",
        name: 'Book Club',
        message: 'Next meeting on Friday...',
        image: ['/image (4).png', '/image (5).png'],
        badge: 3,
        noofOnlinePeople: 0
    }

];

const chatMessages = [
    // Sample messages between msg-1 and msg-1
    {
        id: "messageId-0",
        senderId: "msg-1",
        receiverId: "msg-1",
        timestamp: "2024-10-01T09:59:00Z",
        content: "This is a message to myself.",
        status: "read",
    },
    {
        id: "messageId-0",
        senderId: "msg-1",
        receiverId: "msg-1",
        timestamp: "2024-10-01T09:59:00Z",
        content: "This is a message to myself.",
        status: "read",
    },
    // Sample messages between msg-1 and msg-2
    {
        id: "messageId-1",
        senderId: "msg-1",
        receiverId: "msg-2",
        timestamp: "2024-10-01T10:00:00Z",
        content: "Hello! How can I help you today?",
        status: "read",
    },
    {
        id: "messageId-2",
        senderId: "msg-2",
        receiverId: "msg-1",
        timestamp: "2024-10-01T10:01:00Z",
        content: "I have a question about my order.",
        status: "read",
    },
    {
        id: "messageId-3",
        senderId: "msg-1",
        receiverId: "msg-2",
        timestamp: "2024-10-01T10:02:00Z",
        content: "Sure! What seems to be the issue?",
        status: "delivered",
    },
    {
        id: "messageId-4",
        senderId: "msg-2",
        receiverId: "msg-1",
        timestamp: "2024-10-01T10:03:00Z",
        content: "I received the wrong item.",
        status: "sent",
    },
    {
        id: "messageId-5",
        senderId: "msg-1",
        receiverId: "msg-2",
        timestamp: "2024-10-01T10:04:00Z",
        content: "I'm sorry to hear that. Let me check your order details.",
        status: "sent",
    },
    {
        id: "messageId-test-1",
        senderId: "msg-2",
        receiverId: "msg-1",
        timestamp: "2024-10-01T10:04:00Z",
        content: "Bonjour! Je voudrais savoir plus sur vos services. Merci! ",
        status: "sent",
    },
    {
        id: "messageId-6",
        senderId: "msg-2",
        receiverId: "msg-1",
        timestamp: "2024-10-01T10:05:00Z",
        content: "Thank you!",
        status: "sent",
    },
    {
        id: "messageId-test-2",
        senderId: "msg-2",
        receiverId: "msg-1",
        timestamp: "2024-10-01T10:05:00Z",
        content: "¡Hola! ¿En qué puedo ayudarte hoy?",
        status: "sent",
    },
    {
        id: "messageId-7",
        senderId: "msg-1",
        receiverId: "msg-2",
        timestamp: "2024-10-01T10:06:00Z",
        content: "You're welcome! I'll get back to you shortly.",
        status: "sent",
    },
    {
        id: "messageId-8",
        senderId: "msg-1",
        receiverId: "msg-2",
        timestamp: "2024-10-01T10:06:00Z",
        content: "Bonjour! Comment puis-je vous aider aujourd'hui?",
        status: "sent",
    }


]

const groupMessage = [
    // Sample messages in group grp-1
    {
        id: "groupMessageId-1",
        groupId: "grp-1",
        senderId: "msg-1",
        timestamp: "2024-10-01T11:00:00Z",
        content: "Hey everyone! Excited for the upcoming event.",
        status: "read",
        attachments: null,
    },
    {
        id: "groupMessageId-2",
        groupId: "grp-1",
        senderId: "msg-3",
        timestamp: "2024-10-01T11:05:00Z",
        content: "Me too! Can't wait to see you all there.",
        status: "read",
        attachments: null,
    },
    {
        id: "groupMessageId-3",
        groupId: "grp-1",
        senderId: "msg-2",
        timestamp: "2024-10-01T11:10:00Z",
        content: "Does anyone need a ride to the event?",
        status: "delivered",
        attachments: null,
    }
];

function getGroupChatMessages(groupId: string) {
    return groupMessage.filter((msg) => msg.groupId === groupId);
}


function getChatUser(userId: string) {
    return chatData.find((user) => user.messageId === userId) || null;
}
function getGroupChat(groupId: string) {
    return Groups.find((group) => group.messageId === groupId) || null;
}
function getMessagesBetweenUsers(userId1: string, userId2: string) {
    return chatMessages.filter(
        (message) =>
            (message.senderId === userId1 && message.receiverId === userId2) ||
            (message.senderId === userId2 && message.receiverId === userId1)
    );
}

export { chatData, Groups, chatMessages, groupMessage, getMessagesBetweenUsers, getChatUser, getGroupChat, getGroupChatMessages };