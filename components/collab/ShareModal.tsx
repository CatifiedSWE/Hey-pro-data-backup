"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Loader2 } from "lucide-react";
import { shareCollab } from "@/lib/api/collab";

type ShareModalProps = {
  collabId: string;
  collabTitle: string;
  className?: string;
};

export function ShareModal({ collabId, collabTitle, className }: ShareModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/collab/${collabId}` 
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      
      // Record the share
      await shareCollab(collabId, 'link');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link to clipboard');
    }
  };

  const handleSocialShare = async (platform: 'twitter' | 'linkedin' | 'facebook') => {
    setSharing(true);
    try {
      // Record the share
      await shareCollab(collabId, platform);

      const encodedUrl = encodeURIComponent(currentUrl);
      const encodedTitle = encodeURIComponent(collabTitle);

      let shareUrl = '';
      switch (platform) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
          break;
      }

      window.open(shareUrl, '_blank', 'width=600,height=400');
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={className}>
          <Share2 className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-xl font-semibold">Share Collab</DialogTitle>
        <div className="space-y-4 mt-4">
          {/* Copy Link */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={currentUrl}
              readOnly
              className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Or share via:</p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleSocialShare('twitter')}
                disabled={sharing}
                className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
              >
                {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Twitter'}
              </Button>
              <Button
                onClick={() => handleSocialShare('linkedin')}
                disabled={sharing}
                className="flex-1 bg-[#0A66C2] hover:bg-[#004182] text-white"
              >
                {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'LinkedIn'}
              </Button>
              <Button
                onClick={() => handleSocialShare('facebook')}
                disabled={sharing}
                className="flex-1 bg-[#1877F2] hover:bg-[#166FE5] text-white"
              >
                {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Facebook'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
