// Local Storage Service for SafeBridge
// Handles offline data persistence and user preferences

export interface OfflineData {
  shelters: any[];
  lastUpdate: string;
  userLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
  } | null;
  weatherCache: {
    data: any;
    timestamp: string;
  } | null;
  chatHistory: any[];
  evacuationPlans: any[];
}

export interface UserPreferences {
  name: string;
  familySize: number;
  hasDisabilities: boolean;
  hasPets: boolean;
  emergencyContact: string;
  preferredEvacuationSite: string;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  language: 'ja' | 'en';
  theme: 'light' | 'dark';
}

const STORAGE_KEYS = {
  OFFLINE_DATA: 'safebridge-offline-data',
  USER_PREFERENCES: 'safebridge-preferences',
  EVACUATION_HISTORY: 'safebridge-evacuation-history',
  CHAT_HISTORY: 'safebridge-chat-history',
} as const;

// Default values
const DEFAULT_PREFERENCES: UserPreferences = {
  name: '',
  familySize: 1,
  hasDisabilities: false,
  hasPets: false,
  emergencyContact: '',
  preferredEvacuationSite: '',
  notificationsEnabled: true,
  locationEnabled: true,
  language: 'ja',
  theme: 'light',
};

const DEFAULT_OFFLINE_DATA: OfflineData = {
  shelters: [],
  lastUpdate: '',
  userLocation: null,
  weatherCache: null,
  chatHistory: [],
  evacuationPlans: [],
};

export class StorageService {
  // Check if localStorage is available
  private static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Generic storage methods
  private static setItem(key: string, value: any): void {
    if (!this.isStorageAvailable()) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private static getItem<T>(key: string, defaultValue: T): T {
    if (!this.isStorageAvailable()) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  }

  // User Preferences
  static getUserPreferences(): UserPreferences {
    return this.getItem(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES);
  }

  static setUserPreferences(preferences: Partial<UserPreferences>): void {
    const current = this.getUserPreferences();
    const updated = { ...current, ...preferences };
    this.setItem(STORAGE_KEYS.USER_PREFERENCES, updated);
  }

  // Offline Data
  static getOfflineData(): OfflineData {
    return this.getItem(STORAGE_KEYS.OFFLINE_DATA, DEFAULT_OFFLINE_DATA);
  }

  static setOfflineData(data: Partial<OfflineData>): void {
    const current = this.getOfflineData();
    const updated = { ...current, ...data };
    this.setItem(STORAGE_KEYS.OFFLINE_DATA, updated);
  }

  // Shelter Data
  static saveShelters(shelters: any[]): void {
    this.setOfflineData({
      shelters,
      lastUpdate: new Date().toISOString(),
    });
  }

  static getShelters(): any[] {
    return this.getOfflineData().shelters;
  }

  // Location Data
  static saveUserLocation(latitude: number, longitude: number): void {
    this.setOfflineData({
      userLocation: {
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      },
    });
  }

  static getUserLocation(): { latitude: number; longitude: number; timestamp: string } | null {
    return this.getOfflineData().userLocation;
  }

  // Weather Cache
  static cacheWeatherData(data: any): void {
    this.setOfflineData({
      weatherCache: {
        data,
        timestamp: new Date().toISOString(),
      },
    });
  }

  static getCachedWeatherData(): any | null {
    const cache = this.getOfflineData().weatherCache;
    if (!cache) return null;
    
    // Check if cache is still valid (6 hours)
    const cacheTime = new Date(cache.timestamp).getTime();
    const now = new Date().getTime();
    const sixHours = 6 * 60 * 60 * 1000;
    
    if (now - cacheTime > sixHours) {
      return null; // Cache expired
    }
    
    return cache.data;
  }

  // Chat History
  static saveChatHistory(messages: any[]): void {
    this.setItem(STORAGE_KEYS.CHAT_HISTORY, messages);
  }

  static getChatHistory(): any[] {
    return this.getItem(STORAGE_KEYS.CHAT_HISTORY, []);
  }

  static addChatMessage(message: any): void {
    const history = this.getChatHistory();
    history.push(message);
    
    // Keep only last 100 messages
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
    
    this.saveChatHistory(history);
  }

  // Evacuation Plans
  static saveEvacuationPlan(plan: any): void {
    const plans = this.getItem(STORAGE_KEYS.EVACUATION_HISTORY, []);
    plans.unshift({ ...plan, timestamp: new Date().toISOString() });
    
    // Keep only last 10 plans
    if (plans.length > 10) {
      plans.splice(10);
    }
    
    this.setItem(STORAGE_KEYS.EVACUATION_HISTORY, plans);
  }

  static getEvacuationPlans(): any[] {
    return this.getItem(STORAGE_KEYS.EVACUATION_HISTORY, []);
  }

  // Emergency Contacts
  static saveEmergencyContact(contact: { name: string; phone: string; relationship: string }): void {
    const preferences = this.getUserPreferences();
    // For now, we'll just save one emergency contact in preferences
    // In a real app, you might want to support multiple contacts
    this.setUserPreferences({
      emergencyContact: `${contact.name} (${contact.relationship}): ${contact.phone}`,
    });
  }

  // Data Export/Import for backup
  static exportData(): string {
    const data = {
      preferences: this.getUserPreferences(),
      offlineData: this.getOfflineData(),
      chatHistory: this.getChatHistory(),
      evacuationHistory: this.getEvacuationPlans(),
      exportDate: new Date().toISOString(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.preferences) {
        this.setUserPreferences(data.preferences);
      }
      
      if (data.offlineData) {
        this.setOfflineData(data.offlineData);
      }
      
      if (data.chatHistory) {
        this.saveChatHistory(data.chatHistory);
      }
      
      if (data.evacuationHistory) {
        this.setItem(STORAGE_KEYS.EVACUATION_HISTORY, data.evacuationHistory);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Clear all data
  static clearAllData(): void {
    if (!this.isStorageAvailable()) return;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Get storage usage info
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!this.isStorageAvailable()) {
      return { used: 0, available: 0, percentage: 0 };
    }
    
    let used = 0;
    
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        used += item.length;
      }
    });
    
    // Rough estimate of localStorage limit (usually 5-10MB)
    const available = 5 * 1024 * 1024; // 5MB
    const percentage = (used / available) * 100;
    
    return { used, available, percentage };
  }
}