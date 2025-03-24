
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { 
  Facebook, Twitter, Linkedin, Mail, Link, Copy, 
  Check, Share, MapPin
} from 'lucide-react';
import { PubCrawl } from '../utils/mapUtils';
import { toast } from 'sonner';

interface ShareDialogProps {
  pubCrawl: PubCrawl | null;
  isOpen: boolean;
  onClose: () => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({
  pubCrawl,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  
  if (!pubCrawl) return null;
  
  const title = `Check out my pub crawl with ${pubCrawl.places.length} stops!`;
  const description = `A ${pubCrawl.places.length}-stop pub crawl featuring: ${pubCrawl.places.map(p => p.name).join(', ')}`;
  const url = window.location.href;
  
  const shareText = `${title}\n\n${description}\n\n${url}`;
  
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText)}`
  };
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });
        toast.success('Shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
        // User probably canceled, no need for error toast
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyLink();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Share Pub Crawl</DialogTitle>
          <DialogDescription>
            Share this pub crawl with your friends.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-medium">Route Preview:</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-900">{title}</h4>
              <div className="flex flex-wrap gap-1 mt-1 text-sm text-gray-500">
                {pubCrawl.places.map((place, idx) => (
                  <div 
                    key={place.id} 
                    className="flex items-center"
                  >
                    {idx > 0 && <span className="mx-1 text-gray-400">→</span>}
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-0.5 text-primary" />
                      {place.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                value={url}
                className="h-9 bg-gray-50 border-gray-200"
              />
            </div>
            <Button 
              size="sm" 
              className="px-3 rounded-full" 
              variant="outline"
              onClick={handleCopyLink}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-primary" />}
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          
          <div className="flex justify-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="rounded-full h-9 w-9 border-gray-200"
              onClick={() => window.open(shareLinks.facebook, '_blank')}
              title="Share on Facebook"
            >
              <Facebook className="h-4 w-4 text-blue-600" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full h-9 w-9 border-gray-200"
              onClick={() => window.open(shareLinks.twitter, '_blank')}
              title="Share on Twitter"
            >
              <Twitter className="h-4 w-4 text-sky-500" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full h-9 w-9 border-gray-200"
              onClick={() => window.open(shareLinks.linkedin, '_blank')}
              title="Share on LinkedIn"
            >
              <Linkedin className="h-4 w-4 text-blue-700" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full h-9 w-9 border-gray-200"
              onClick={() => window.open(shareLinks.email, '_blank')}
              title="Share via Email"
            >
              <Mail className="h-4 w-4 text-gray-700" />
            </Button>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-full border-gray-200"
          >
            Close
          </Button>
          
          {navigator.share && (
            <Button 
              onClick={handleShare}
              className="gap-2 rounded-full"
            >
              <Share className="h-4 w-4" />
              Share
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
