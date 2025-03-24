
import { toast } from "sonner";

// The token provided by the user
const DEFAULT_TOKEN = 'AIzaSyA1I9dNXno-OQUM4fYc-0Fogsr4QQgJ0_E';

const STORAGE_KEY = 'google_maps_api_key';

export class GoogleMapsApiKeyManager {
  /**
   * Gets the Google Maps API key from localStorage or uses the default one
   */
  static getApiKey(): string {
    // Try to get the key from localStorage first
    const savedKey = localStorage.getItem(STORAGE_KEY);
    
    if (savedKey && savedKey.trim() !== '') {
      console.log("Using saved Google Maps API key");
      return savedKey;
    }
    
    // If no key is saved, use the default token and save it
    if (DEFAULT_TOKEN && DEFAULT_TOKEN.trim() !== '') {
      console.log("Using default Google Maps API key");
      localStorage.setItem(STORAGE_KEY, DEFAULT_TOKEN);
      return DEFAULT_TOKEN;
    }
    
    // If no key is available, return empty string
    console.warn("No Google Maps API key available");
    return '';
  }
  
  /**
   * Sets a new Google Maps API key
   */
  static setApiKey(apiKey: string): void {
    if (!apiKey || apiKey.trim() === '') {
      toast.error('Please provide a valid Google Maps API key');
      return;
    }
    
    // Save the key
    localStorage.setItem(STORAGE_KEY, apiKey);
    console.log("Google Maps API key updated");
    toast.success('Google Maps API key saved successfully');
    
    // Reload the page to apply the new key
    window.location.reload();
  }
  
  /**
   * Resets to the default API key
   */
  static resetToDefault(): void {
    if (DEFAULT_TOKEN && DEFAULT_TOKEN.trim() !== '') {
      localStorage.setItem(STORAGE_KEY, DEFAULT_TOKEN);
      console.log("Reset to default Google Maps API key");
      toast.success('Reset to default Google Maps API key');
      
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
    return Boolean(key && key.trim() !== '' && key.length > 20);
  }
}
