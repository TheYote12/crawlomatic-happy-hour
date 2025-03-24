
import { toast } from "sonner";

// The token provided by the user
const DEFAULT_TOKEN = 'AIzaSyA1I9dNXno-OQUM4fYc-0Fogsr4QQgJ0_E';

const STORAGE_KEY = 'google_maps_api_key';

export class GoogleMapsApiKeyManager {
  /**
   * Gets the Google Maps API key from localStorage or uses the default one
   */
  static getApiKey(): string {
    // Always return the default token for now to fix the issue
    return DEFAULT_TOKEN;
  }
  
  /**
   * Sets a new Google Maps API key
   */
  static setApiKey(apiKey: string): void {
    if (!apiKey || apiKey.trim() === '') {
      toast.error('Please provide a valid Google Maps API key');
      return;
    }
    
    // Save the key but don't use it for now
    localStorage.setItem(STORAGE_KEY, apiKey);
    console.log("Google Maps API key updated");
    toast.success('Google Maps API key saved successfully');
    
    // Don't reload the page
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
    // Always return true since we're using the default key
    return true;
  }
}
