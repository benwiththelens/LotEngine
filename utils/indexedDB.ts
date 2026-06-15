import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * ⚠️ LOTENGINE CORE INFRASTRUCTURE ⚠️
 * LOCAL PERSISTENCE LAYER
 * 
 * This file wraps the `idb` library to provide an asynchronous, offline-first queue
 * for the Capture Terminal. It allows mechanics to shoot 20+ photos in a concrete service bay
 * without dropping data.
 * 
 * Do not replace this with `localStorage` (size limits) or `sessionStorage` (volatility).
 */

// Define the payload interface for strict typing
export interface PhotoPayload {
  id?: number; // Auto-incremented by IndexedDB
  vin: string;
  angle_id: string;
  mode: 'intake' | 'retail';
  blob: File | Blob; // The raw binary data
  timestamp: number;
}

// Define the database schema extending the idb DBSchema
interface LotEngineDB extends DBSchema {
  'photo-queue': {
    key: number;
    value: PhotoPayload;
    indexes: { 'vin': string };
  };
}

// Initialize the database connection promise
export const dbPromise: Promise<IDBPDatabase<LotEngineDB>> = openDB<LotEngineDB>('lotengine-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('photo-queue')) {
      const store = db.createObjectStore('photo-queue', { keyPath: 'id', autoIncrement: true });
      store.createIndex('vin', 'vin', { unique: false });
    }
  },
});

/**
 * Saves a photo payload to the offline IndexedDB queue.
 * @param payload The structured payload containing the VIN, angle, mode, and binary Blob/File.
 */
export async function saveToOfflineQueue(payload: Omit<PhotoPayload, 'id' | 'timestamp'>): Promise<number> {
  const db = await dbPromise;
  const tx = db.transaction('photo-queue', 'readwrite');
  const store = tx.objectStore('photo-queue');
  
  const id = await store.put({
    ...payload,
    timestamp: Date.now(),
  });
  
  await tx.done;
  return id;
}

/**
 * Retrieves pending photos from the offline queue.
 * @param vin Optional. If provided, returns only the pending photos for that specific VIN.
 * @returns An array of queued PhotoPayload objects.
 */
export async function getOfflineQueue(vin?: string): Promise<PhotoPayload[]> {
  const db = await dbPromise;
  const tx = db.transaction('photo-queue', 'readonly');
  const store = tx.objectStore('photo-queue');

  if (vin) {
    const index = store.index('vin');
    return index.getAll(vin);
  } else {
    return store.getAll();
  }
}

/**
 * Removes a specific processed photo from the offline queue.
 * @param id The auto-incremented primary key of the record.
 */
export async function removeFromOfflineQueue(id: number): Promise<void> {
  const db = await dbPromise;
  const tx = db.transaction('photo-queue', 'readwrite');
  const store = tx.objectStore('photo-queue');
  
  await store.delete(id);
  await tx.done;
}
