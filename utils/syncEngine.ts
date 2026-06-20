import { createClient } from '@/lib/supabase-browser';

const supabase = createClient();
import { getOfflineQueue, removeFromOfflineQueue } from './indexedDB';

/**
 * ⚠️ LOTENGINE CORE INFRASTRUCTURE ⚠️
 * OFFLINE-FIRST SYNC ENGINE
 * 
 * Do NOT modify this file to use standard `fetch` or direct Supabase inserts
 * from the client UI. This platform is designed to be used deep on an asphalt lot
 * with spotty 5G coverage.
 * 
 * Workflow:
 * 1. UI captures heavy data (images) and saves to IndexedDB instantly.
 * 2. This engine runs sequentially in the background when connectivity is detected.
 * 3. Only upon successful Storage upload AND Database insert is the local copy purged.
 * 
 * Processes the offline photo queue for a specific VIN, uploading assets to Supabase Storage
 * and creating database records.
 * 
 * @param vin The VIN of the vehicle to sync.
 * @param onProgress Optional callback to report progress back to the UI (e.g., for a progress bar).
 */
export async function processPayload(
  vin: string, 
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  // 1. Retrieve the pending payload for this specific vehicle
  const pendingPhotos = await getOfflineQueue(vin);
  
  const totalFiles = pendingPhotos.length;
  if (totalFiles === 0) return; // Nothing to process

  // 2. Look up the vehicle ID once before the loop — not on every photo
  const { data: vehicle, error: vehicleError } = await supabase
    .from('vehicles')
    .select('id')
    .eq('vin', vin)
    .single();

  if (vehicleError || !vehicle) {
    throw new Error(`Vehicle lookup failed for VIN ${vin}: ${vehicleError?.message || 'Not found'}`);
  }

  let currentIndex = 0;

  // 3. Process sequentially to avoid overwhelming network/memory
  for (const record of pendingPhotos) {
    currentIndex++;
    
    try {
      // Define the standardized storage path
      // Example: inventory/1N4AL3APXFC123456/retail/left_front_three_quarter.webp
      const storagePath = `${record.vin}/${record.mode}/${record.angle_id}.webp`;

      // 4. Upload binary data to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('inventory')
        .upload(storagePath, record.blob, { 
          upsert: true, 
          contentType: 'image/webp',
          cacheControl: '3600'
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // 5. Retrieve the public URL
      const { data: publicUrlData } = supabase.storage
        .from('inventory')
        .getPublicUrl(storagePath);

      // 6. Create the database record linking the asset to the vehicle
      const { error: dbError } = await supabase
        .from('vehicle_images')
        .insert({
          vehicle_id: vehicle.id,
          storage_url: publicUrlData.publicUrl,
          is_primary: record.angle_id === 'left_front_three_quarter' || record.angle_id === 'front_straight_on',
        });

      if (dbError) {
        throw new Error(`Database insert failed: ${dbError.message}`);
      }

      // 7. Success: Remove from local queue
      if (record.id) {
        await removeFromOfflineQueue(record.id);
      }

      // Report progress
      if (onProgress) {
        onProgress(currentIndex, totalFiles);
      }

    } catch (error) {
      // If a single photo fails (e.g., network drop), we log it but do NOT crash the loop.
      // The record remains in IndexedDB and will be re-attempted on the next sync.
      console.error(`Failed to process photo ${record.angle_id} for VIN ${record.vin}:`, error);
      // We continue to the next photo in case the error was isolated to this specific file
    }
  }
}
