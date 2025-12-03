import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"
import { MessageCircle, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type CommentThread = {
    id: number
    avatar: string
    name: string
    commentTime: string
    text: string
    highlight?: boolean
    replies?: CommentThread[]
}

const comments: CommentThread[] = [
    {
        id: 1,
        avatar: "/default-profile.png",
        name: "Aarav Mehta",
        commentTime: "2025-11-01T12:00:00Z",
        text: "Just watched this movie alone at midnight. Worst decision of my life.",
        highlight: false,
        replies: [
            {
                id: 11,
                avatar: "/default-profile.png",
                name: "Aarav Mehta",
                commentTime: "2023-01-01T14:00:00Z",
                text: " I did the same! Couldn't sleep for hours after that ending.",
                highlight: true,
                replies: [
                    {
                        id: 111,
                        avatar: "/default-profile.png",
                        name: "Anand Kumar",
                        commentTime: "2023-01-01T16:00:00Z",
                        text: " Just watched this movie alone at midnight. Worst decision of my life.",
                        highlight: true,
                    }
                ]
            },
            {
                id: 12,
                avatar: "/default-profile.png",
                name: "Aarav Mehta",
                commentTime: "2023-01-01T16:00:00Z",
                text: " Just watched this movie alone at midnight. Worst decision of my life.",
                highlight: true,
            },
        ],
    },
    {
        id: 2,
        avatar: "/default-profile.png",
        name: "Aarav Mehta",
        commentTime: "2023-01-02T09:00:00Z",
        text: "That scene in the basement still gives me chills. Who thought the sound design could be that terrifying?",
        highlight: false,
        replies: [
            {
                id: 21,
                avatar: "/default-profile.png",
                name: "Aarav Mehta",
                commentTime: "2023-01-02T12:00:00Z",
                text: " Exactly! The creaking floorboards felt so real, I thought someone was in my own house.",
                highlight: true,
            },
        ],
    },
]

export default function Comment() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size={"icon"} className="inline-flex items-center gap-2 border-none">
                    <MessageCircle className="h-4 w-4 text-[#31A7AC]" />

                </Button>
            </DialogTrigger>
            <DialogContent className="w-[586px] max-w-full border-0 bg-[#FAFAFA] p-0 sm:rounded-[20px]">
                <div className="flex flex-col gap-8 p-5">
                    <div className="flex items-center justify-between border-b border-[#BABABA] pb-3">
                        <DialogTitle className="text-[20px] font-semibold text-black">Comments</DialogTitle>

                    </div>

                    <div className="flex flex-col gap-6 overflow-y-auto max-h-[500px]">
                        <CommentTree comments={comments} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function CommentTree({ comments, depth = 0 }: { comments: CommentThread[]; depth?: number }) {
    return (
        <div className="flex flex-col gap-6">
            {comments.map((comment) => (
                <div key={comment.id} className="flex flex-col gap-6">
                    <CommentItem comment={comment} depth={depth} />
                    {comment.replies && comment.replies.length > 0 ? (
                        <CommentTree comments={comment.replies} depth={depth + 1} />
                    ) : null}
                </div>
            ))}
        </div>
    )
}

function CommentItem({ comment, depth = 0 }: { comment: CommentThread; depth?: number }) {
    const timeAgo = formatDistanceToNow(new Date(comment.commentTime), { addSuffix: true })
    const indent = depth ? depth * 32 : 0

    return (
        <div className="flex gap-3" style={{ paddingLeft: indent }}>
            <Image
                src={comment.avatar || "/default-profile.png"}
                alt={comment.name}
                width={45}
                height={45}
                className="h-[45px] w-[45px] rounded-full object-cover"
            />
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 text-sm text-[#444444]">
                    <span>{comment.name}</span>
                    <span>{timeAgo}</span>
                </div>
                <p className={`text-sm leading-[21px] text-black`}>
                    <span className="text-[#31A7AC]">{depth > 0 ? "@" : ""}{depth > 0 ? comment.name : ""}</span>
                    {comment.text}
                </p>
                <button
                    type="button"
                    className="text-sm text-start font-semibold text-[#444444] transition hover:text-black"
                >
                    Reply
                </button>
            </div>
        </div>
    )
}
