"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { getComments, addComment } from "@/lib/api/slate";
import { supabase } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  parent_comment_id: string | null;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  replies?: Comment[];
}

interface CommentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postAuthor: {
    name: string;
    avatar: string;
  };
  postContent: string;
  commentsCount: number;
  onCommentAdded?: () => void;
}

export default function CommentsModal({
  open,
  onOpenChange,
  postId,
  postAuthor,
  postContent,
  commentsCount,
  onCommentAdded,
}: CommentsModalProps) {
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

  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getComments(postId);
      setComments(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await addComment(postId, newComment.trim(), replyTo?.id);
      
      // Refresh comments to get updated threaded structure
      await loadComments();
      
      setNewComment("");
      setReplyTo(null);
      toast.success('Comment added');
      if (onCommentAdded) onCommentAdded();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      // Call delete API when implemented
      // await deleteComment(postId, commentId);
      await loadComments();
      toast.success('Comment deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete comment');
    }
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyTo({ id: commentId, name: userName });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

// Recursive CommentTree component for threaded comments
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

// Individual comment item with depth-based indentation
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
        src={comment.author.avatar || "/default-profile.png"}
        alt={comment.author.name}
        width={45}
        height={45}
        className="h-[45px] w-[45px] rounded-full object-cover"
        unoptimized
      />
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-4 text-sm text-[#444444]">
          <span className="font-medium">{comment.author.name}</span>
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
          onClick={() => onReply(comment.id, comment.author.name)}
          className="text-sm text-start font-semibold text-[#444444] transition hover:text-black w-fit"
        >
          Reply
        </button>
      </div>
    </div>
  );
}
