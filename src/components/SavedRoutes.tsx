
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { SavedRoutesManager, SavedRoute } from '../utils/savedRoutesManager';
import { formatDistance } from '../utils/locationUtils';
import { Calendar, Clock, Route, Trash2, ArrowRight } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';
import { EmptyState } from './EmptyState';

interface SavedRoutesProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadRoute: (route: SavedRoute) => void;
}

const SavedRoutes: React.FC<SavedRoutesProps> = ({
  isOpen,
  onClose,
  onLoadRoute
}) => {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Load saved routes
      const savedRoutes = SavedRoutesManager.getRoutes();
      setRoutes(savedRoutes);
    }
  }, [isOpen]);
  
  const handleDeleteRoute = () => {
    if (!routeToDelete) return;
    
    SavedRoutesManager.deleteRoute(routeToDelete);
    setRoutes(routes.filter(route => route.id !== routeToDelete));
    setRouteToDelete(null);
    toast.success('Route deleted');
  };
  
  const handleLoadRoute = (route: SavedRoute) => {
    onLoadRoute(route);
    onClose();
    toast.success(`Loaded route: ${route.name}`);
  };
  
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };
  
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Saved Routes</DialogTitle>
            <DialogDescription>
              View and manage your saved pub crawl routes.
            </DialogDescription>
          </DialogHeader>
          
          {routes.length === 0 ? (
            <EmptyState 
              icon={<Route className="h-10 w-10 text-muted-foreground" />}
              title="No saved routes"
              description="Save a route to see it here"
            />
          ) : (
            <div className="relative overflow-x-auto max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Pubs</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">
                        {route.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(route.date)}
                        </div>
                      </TableCell>
                      <TableCell>{route.pubCrawl.places.length}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Route className="h-3 w-3 text-muted-foreground" />
                          {formatDistance(route.pubCrawl.totalDistance)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDuration(route.pubCrawl.totalDuration)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setRouteToDelete(route.id)}
                            title="Delete route"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleLoadRoute(route)}
                            title="Load route"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!routeToDelete} onOpenChange={(open) => !open && setRouteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this saved route.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoute}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SavedRoutes;
