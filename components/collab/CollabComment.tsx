"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { MessageCircle, Loader2, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getComments, addComment, deleteComment, type Comment } from "@/lib/api/collab";
import { supabase } from "@/lib/supabase/client";

type CollabCommentProps = {
  collabId: string;
  onCommentCountChange?: (count: number) => void;
};

export default function CollabComment({ collabId, onCommentCountChange }: CollabCommentProps) {
    const [open, setOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Get current user ID
    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setCurrentUserId(session.user.id);
            }
        };
        getCurrentUser();
    }, []);

    // Fetch comments when dialog opens
    useEffect(() => {
        if (open && collabId) {
            fetchComments();
        }
    }, [open, collabId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const data = await getComments(collabId);
            setComments(data.comments);
            onCommentCountChange?.(data.totalComments);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const comment = await addComment(
                collabId,
                newComment.trim(),
                replyTo?.id
            );

            // Refresh comments
            await fetchComments();
            
            setNewComment("");
            setReplyTo(null);
        } catch (error) {
            console.error('Failed to add comment:', error);
            alert(error instanceof Error ? error.message : 'Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            await deleteComment(collabId, commentId);
            await fetchComments();
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete comment');
        }
    };

    const handleReply = (commentId: string, userName: string) => {
        setReplyTo({ id: commentId, name: userName });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size={"icon"} className="inline-flex items-center gap-2 border-none">
                    <MessageCircle className="h-4 w-4 text-[#31A7AC]" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[586px] max-w-full border-0 bg-[#FAFAFA] p-0 sm:rounded-[20px]">
                <div className="flex flex-col gap-6 p-5">
                    <div className="flex items-center justify-between border-b border-[#BABABA] pb-3">
                        <DialogTitle className="text-[20px] font-semibold text-black">
                            Comments ({comments.length})
                        </DialogTitle>
                    </div>

                    {/* Comment Input */}
                    <div className="space-y-2">
                        {replyTo && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>Replying to <strong>@{replyTo.name}</strong></span>
                                <button
                                    onClick={() => setReplyTo(null)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        <div className="flex gap-2">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={replyTo ? `Reply to ${replyTo.name}...` : "Add a comment..."}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2FD3D8] min-h-[80px] resize-none"
                                disabled={submitting}
                            />
                            <Button
                                onClick={handleSubmitComment}
                                disabled={!newComment.trim() || submitting}
                                className="bg-[#2FD3D8] hover:bg-[#2FD3D8]/90 text-white self-end"
                            >
                                {submitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="flex flex-col gap-6 overflow-y-auto max-h-[500px]">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-[#2FD3D8]" />
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No comments yet. Be the first to comment!
                            </div>
                        ) : (
                            <CommentTree 
                                comments={comments} 
                                onReply={handleReply}
                                onDelete={handleDeleteComment}
                                currentUserId={currentUserId}
                            />
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function CommentTree({ 
    comments, 
    depth = 0, 
    onReply, 
    onDelete,
    currentUserId 
}: { 
    comments: Comment[]; 
    depth?: number; 
    onReply: (id: string, name: string) => void;
    onDelete: (id: string) => void;
    currentUserId: string | null;
}) {
    return (
        <div className="flex flex-col gap-6">
            {comments.map((comment) => (
                <div key={comment.id} className="flex flex-col gap-6">
                    <CommentItem 
                        comment={comment} 
                        depth={depth} 
                        onReply={onReply}
                        onDelete={onDelete}
                        currentUserId={currentUserId}
                    />
                    {comment.replies && comment.replies.length > 0 && (
                        <CommentTree 
                            comments={comment.replies} 
                            depth={depth + 1} 
                            onReply={onReply}
                            onDelete={onDelete}
                            currentUserId={currentUserId}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

function CommentItem({ 
    comment, 
    depth = 0, 
    onReply,
    onDelete,
    currentUserId
}: { 
    comment: Comment; 
    depth?: number; 
    onReply: (id: string, name: string) => void;
    onDelete: (id: string) => void;
    currentUserId: string | null;
}) {
    const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
    const indent = depth ? depth * 32 : 0;
    const isOwner = currentUserId === comment.user_id;

    return (
        <div className="flex gap-3" style={{ paddingLeft: indent }}>
            <Image
                src={comment.user.avatar || "/default-profile.png"}
                alt={comment.user.name}
                width={45}
                height={45}
                className="h-[45px] w-[45px] rounded-full object-cover"
                unoptimized
            />
            <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-4 text-sm text-[#444444]">
                    <span className="font-medium">{comment.user.name}</span>
                    <span>{timeAgo}</span>
                    {isOwner && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="ml-auto text-red-500 hover:text-red-700"
                            title="Delete comment"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <p className="text-sm leading-[21px] text-black whitespace-pre-wrap">
                    {comment.content}
                </p>
                <button
                    type="button"
                    onClick={() => onReply(comment.id, comment.user.name)}
                    className="text-sm text-start font-semibold text-[#444444] transition hover:text-black w-fit"
                >
                    Reply
                </button>
            </div>
        </div>
    );
}
