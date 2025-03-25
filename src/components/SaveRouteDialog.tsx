
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { PubCrawl } from '../utils/mapUtils';
import { SavedRoutesManager } from '../utils/savedRoutesManager';
import { toast } from 'sonner';

interface SaveRouteDialogProps {
  pubCrawl: PubCrawl | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  userLocation?: { lat: number; lng: number; name?: string };
}

const SaveRouteDialog: React.FC<SaveRouteDialogProps> = ({
  pubCrawl,
  isOpen,
  onClose,
  onSaved,
  userLocation
}) => {
  const [routeName, setRouteName] = useState('');
  const [description, setDescription] = useState('');
  const [shareWithCommunity, setShareWithCommunity] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!pubCrawl) return;
    
    try {
      setIsSaving(true);
      
      // Create a unique ID
      const id = `route_${Date.now()}`;
      
      // Current timestamp for createdAt
      const now = new Date().toISOString();
      
      // Save the route
      SavedRoutesManager.saveRoute({
        id,
        name: routeName || `Pub Crawl - ${new Date().toLocaleDateString()}`,
        description,
        date: now,
        createdAt: now,
        pubCrawl,
        isShared: shareWithCommunity,
        author: 'Anonymous', // In a real app, you'd use the user's name
        location: userLocation
      });
      
      toast.success(shareWithCommunity 
        ? 'Route saved and shared with the community!' 
        : 'Route saved successfully!'
      );
      setRouteName('');
      setDescription('');
      setShareWithCommunity(false);
      onSaved?.();
      onClose();
    } catch (error) {
      console.error('Error saving route:', error);
      toast.error('Failed to save route');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] rounded-xl">
        <DialogHeader>
          <DialogTitle>Save Route</DialogTitle>
          <DialogDescription>
            Save this pub crawl route to access it later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="route-name">Route Name</Label>
            <Input
              id="route-name"
              placeholder="Weekend Pub Crawl"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Notes about this route..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none rounded-lg"
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="share-community" 
              checked={shareWithCommunity}
              onCheckedChange={(checked) => setShareWithCommunity(checked as boolean)}
            />
            <Label 
              htmlFor="share-community" 
              className="text-sm font-medium leading-none cursor-pointer"
            >
              Share with community
            </Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-full border-gray-200">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !pubCrawl}
            className="rounded-full"
          >
            {isSaving ? 'Saving...' : 'Save Route'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveRouteDialog;
