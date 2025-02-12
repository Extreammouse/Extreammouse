import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import Button from './Button';
import toast from 'react-hot-toast';

const ShareButton: React.FC = () => {
  const [showCopied, setShowCopied] = useState(false);
  const siteUrl = 'https://quick-send.co.in';
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setShowCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
      console.error('Copy failed:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QuickSend AI',
          text: 'Check out this amazing AI-powered job application tool!',
          url: siteUrl
        });
        toast.success('Thanks for sharing!');
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          await copyToClipboard();
        }
      }
    } else {
      await copyToClipboard();
    }
  };

  return (
    <Button
      onClick={handleShare}
      className="flex items-center gap-2"
      variant="outline"
      size="lg"
    >
      <Share2 className="w-5 h-5" />
      {showCopied ? 'Copied!' : 'Share with friends'}
    </Button>
  );
};

export default ShareButton;