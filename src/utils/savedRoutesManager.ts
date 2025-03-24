
import { PubCrawl } from './mapUtils';

export interface SavedRoute {
  id: string;
  name: string;
  description?: string;
  date: string;
  pubCrawl: PubCrawl;
}

const STORAGE_KEY = 'pubcrawl_saved_routes';

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
    } catch (error) {
      console.error('Error saving route:', error);
      throw new Error('Failed to save route');
    }
  }
  
  static deleteRoute(id: string): void {
    try {
      const routes = this.getRoutes();
      const filteredRoutes = routes.filter(route => route.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRoutes));
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
}
