/**
 * Database Service using AsyncStorage (web-compatible)
 * Handles local storage of scan history
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScanRecord {
  id?: number;
  imageData?: string;
  riskScore: number;
  riskLevel: string;
  aiConfidence: number;
  bloodSugar: number;
  tempDifference: number;
  advice: string;
  timestamp: string;
}

const STORAGE_KEY = '@dfu_scans';

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database (no-op for AsyncStorage)
   */
  async initialize(): Promise<void> {
    console.log('Database initialized successfully');
  }

  /**
   * Save a scan record
   */
  async saveScan(scan: ScanRecord): Promise<number> {
    try {
      const scans = await this.getAllScans();
      const newId = scans.length > 0 ? Math.max(...scans.map(s => s.id || 0)) + 1 : 1;
      const newScan = { ...scan, id: newId };
      
      scans.unshift(newScan);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
      
      return newId;
    } catch (error) {
      console.error('Error saving scan:', error);
      throw error;
    }
  }

  /**
   * Get all scan records
   */
  async getAllScans(): Promise<ScanRecord[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error getting scans:', error);
      return [];
    }
  }

  /**
   * Delete a scan record
   */
  async deleteScan(id: number): Promise<void> {
    try {
      const scans = await this.getAllScans();
      const filtered = scans.filter(s => s.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting scan:', error);
      throw error;
    }
  }

  /**
   * Clear all scan records
   */
  async clearAllScans(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing scans:', error);
      throw error;
    }
  }
}
