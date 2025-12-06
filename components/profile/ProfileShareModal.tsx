"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

type ProfileShareModalProps = {
  profileUserId: string;
  profileName: string;
  className?: string;
};

export function ProfileShareModal({ profileUserId, profileName, className }: ProfileShareModalProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/profile/${profileUserId}` 
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link to clipboard');
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(`Check out ${profileName}'s profile on HeyProData`);

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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className={className} data-testid="share-profile-button">
          <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="sm:hidden">Share</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-xl font-semibold">Share Profile</DialogTitle>
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
                className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
              >
                Twitter
              </Button>
              <Button
                onClick={() => handleSocialShare('linkedin')}
                className="flex-1 bg-[#0A66C2] hover:bg-[#004182] text-white"
              >
                LinkedIn
              </Button>
              <Button
                onClick={() => handleSocialShare('facebook')}
                className="flex-1 bg-[#1877F2] hover:bg-[#166FE5] text-white"
              >
                Facebook
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
