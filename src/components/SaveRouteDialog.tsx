
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
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
}

const SaveRouteDialog: React.FC<SaveRouteDialogProps> = ({
  pubCrawl,
  isOpen,
  onClose,
  onSaved
}) => {
  const [routeName, setRouteName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!pubCrawl) return;
    
    try {
      setIsSaving(true);
      
      // Create a unique ID
      const id = `route_${Date.now()}`;
      
      // Save the route
      SavedRoutesManager.saveRoute({
        id,
        name: routeName || `Pub Crawl - ${new Date().toLocaleDateString()}`,
        description,
        date: new Date().toISOString(),
        pubCrawl
      });
      
      toast.success('Route saved successfully!');
      setRouteName('');
      setDescription('');
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
      <DialogContent className="sm:max-w-[425px]">
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
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !pubCrawl}
          >
            {isSaving ? 'Saving...' : 'Save Route'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveRouteDialog;
