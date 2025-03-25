
import { PubCrawl } from './mapUtils';

export interface SavedRoute {
  id: string;
  name: string;
  description?: string;
  date: string;
  pubCrawl: PubCrawl;
  isShared?: boolean;
  author?: string;
  createdAt?: string;
  location?: {
    lat: number;
    lng: number;
    name?: string;
  };
}

const STORAGE_KEY = 'pubcrawl_saved_routes';
const COMMUNITY_STORAGE_KEY = 'pubcrawl_community_routes';

export class SavedRoutesManager {
  static getRoutes(): SavedRoute[] {
    try {
      const routesJson = localStorage.getItem(STORAGE_KEY);
      if (!routesJson) return [];
      
      return JSON.parse(routesJson) as SavedRoute[];
    } catch (error) {
      console.error('Error loading saved routes:', error);
      return [];
    }
  }
  
  static saveRoute(route: SavedRoute): void {
    try {
      const routes = this.getRoutes();
      routes.push(route);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
      
      // If the route is shared, also save to community routes
      if (route.isShared) {
        this.addToCommunityRoutes(route);
      }
    } catch (error) {
      console.error('Error saving route:', error);
      throw new Error('Failed to save route');
    }
  }
  
  static deleteRoute(id: string): void {
    try {
      const routes = this.getRoutes();
      const routeToDelete = routes.find(route => route.id === id);
      const filteredRoutes = routes.filter(route => route.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRoutes));
      
      // If the route was shared, also remove from community routes
      if (routeToDelete?.isShared) {
        this.removeFromCommunityRoutes(id);
      }
    } catch (error) {
      console.error('Error deleting route:', error);
      throw new Error('Failed to delete route');
    }
  }
  
  static getRoute(id: string): SavedRoute | null {
    try {
      const routes = this.getRoutes();
      return routes.find(route => route.id === id) || null;
    } catch (error) {
      console.error('Error getting route:', error);
      return null;
    }
  }
  
  // Community routes methods
  static getCommunityRoutes(): SavedRoute[] {
    try {
      const routesJson = localStorage.getItem(COMMUNITY_STORAGE_KEY);
      if (!routesJson) return [];
      
      return JSON.parse(routesJson) as SavedRoute[];
    } catch (error) {
      console.error('Error loading community routes:', error);
      return [];
    }
  }
  
  static addToCommunityRoutes(route: SavedRoute): void {
    try {
      const communityRoutes = this.getCommunityRoutes();
      
      // Make sure it's marked as shared
      const sharedRoute = { ...route, isShared: true };
      
      // Don't add duplicates
      if (!communityRoutes.some(r => r.id === route.id)) {
        communityRoutes.push(sharedRoute);
        localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(communityRoutes));
      }
    } catch (error) {
      console.error('Error adding to community routes:', error);
    }
  }
  
  static removeFromCommunityRoutes(id: string): void {
    try {
      const communityRoutes = this.getCommunityRoutes();
      const filteredRoutes = communityRoutes.filter(route => route.id !== id);
      localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(filteredRoutes));
    } catch (error) {
      console.error('Error removing from community routes:', error);
    }
  }
  
  static getNearbyCommunityRoutes(
    location: { lat: number; lng: number }, 
    radiusKm: number = 10
  ): SavedRoute[] {
    const communityRoutes = this.getCommunityRoutes();
    
    return communityRoutes.filter(route => {
      if (!route.location) return false;
      
      // Calculate distance using Haversine formula
      const distance = this.calculateDistance(
        location.lat, 
        location.lng, 
        route.location.lat, 
        route.location.lng
      );
      
      return distance <= radiusKm;
    });
  }
  
  static getPopularCommunityRoutes(limit: number = 5): SavedRoute[] {
    // In a real app, this would be based on ratings, views, etc.
    // For now, we'll just return the most recent ones
    const communityRoutes = this.getCommunityRoutes();
    return communityRoutes
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
      .slice(0, limit);
  }
  
  // Calculate distance between two points using Haversine formula
  private static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  }
  
  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}
