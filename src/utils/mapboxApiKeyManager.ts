import { toast } from "sonner";

// The token from the project, this should ideally be stored in environment variables
// but we'll keep it here for demonstration purposes
const DEFAULT_TOKEN = 'pk.eyJ1IjoiY2FybG9iZXJyeSIsImEiOiJjbThuY2djbXkxMTJoMm1xMDh2Nmc5NnY1In0.wreOu8QmXIRVUOTLgAZe4A';

const STORAGE_KEY = 'mapbox_api_key';

export class MapboxApiKeyManager {
  /**
   * Gets the Mapbox API key from localStorage or uses the default one
   */
  static getApiKey(): string {
    // Try to get the key from localStorage first
    const savedKey = localStorage.getItem(STORAGE_KEY);
    
    if (savedKey && savedKey.trim() !== '') {
      return savedKey;
    }
    
    // If no key is saved, use the default token and save it
    if (DEFAULT_TOKEN && DEFAULT_TOKEN.trim() !== '') {
      localStorage.setItem(STORAGE_KEY, DEFAULT_TOKEN);
      return DEFAULT_TOKEN;
    }
    
    // If no key is available, return empty string
    return '';
  }
  
  /**
   * Sets a new Mapbox API key
   */
  static setApiKey(apiKey: string): void {
    if (!apiKey || apiKey.trim() === '') {
      toast.error('Please provide a valid Mapbox API key');
      return;
    }
    
    localStorage.setItem(STORAGE_KEY, apiKey);
    toast.success('Mapbox API key saved successfully');
    
    // Reload the page to apply the new key
    window.location.reload();
  }
  
  /**
   * Resets to the default API key
   */
  static resetToDefault(): void {
    if (DEFAULT_TOKEN && DEFAULT_TOKEN.trim() !== '') {
      localStorage.setItem(STORAGE_KEY, DEFAULT_TOKEN);
      toast.success('Reset to default Mapbox API key');
      
      // Reload the page to apply the new key
      window.location.reload();
    } else {
      toast.error('No default API key available');
    }
  }
  
  /**
   * Checks if the API key is valid
   */
  static isKeyValid(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.startsWith('pk.') && key.length > 20);
  }
}
