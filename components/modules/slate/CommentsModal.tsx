"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Heart, Send, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { getComments, addComment } from "@/lib/api/slate";

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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

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
      const comment = await addComment(postId, newComment, replyingTo || undefined);
      setComments(prev => [...prev, comment]);
      setNewComment("");
      setReplyingTo(null);
      toast.success('Comment added');
      if (onCommentAdded) onCommentAdded();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        {/* Post Preview */}
        <div className="px-4 py-3 border-b bg-gray-50">
          <div className="flex items-start gap-3">
            <Image
              src={postAuthor.avatar || "/default-profile.png"}
              alt={postAuthor.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-sm">{postAuthor.name}</p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{postContent}</p>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={() => setReplyingTo(comment.id)}
              />
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t bg-white">
          {replyingTo && (
            <div className="mb-2 text-sm text-gray-600 flex items-center justify-between">
              <span>Replying to comment</span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-blue-500 hover:text-blue-600"
              >
                Cancel
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 resize-none min-h-[40px] max-h-[120px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim()}
              className="self-end"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to post, Shift + Enter for new line
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CommentItemProps {
  comment: Comment;
  onReply: () => void;
}

function CommentItem({ comment, onReply }: CommentItemProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="flex gap-3">
      <Image
        src={comment.author.avatar || "/default-profile.png"}
        alt={comment.author.name}
        width={32}
        height={32}
        className="rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1">
        <div className="bg-gray-100 rounded-2xl px-4 py-2">
          <p className="font-semibold text-sm">{comment.author.name}</p>
          <p className="text-sm mt-1">{comment.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 px-4 text-xs text-gray-500">
          <span>{new Date(comment.created_at).toLocaleDateString()}</span>
          <button
            onClick={() => setLiked(!liked)}
            className={`font-semibold ${liked ? 'text-red-500' : ''}`}
          >
            Like
          </button>
          <button onClick={onReply} className="font-semibold">
            Reply
          </button>
          <button>
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
