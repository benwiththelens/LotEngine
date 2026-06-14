import { supabase } from '@/lib/supabase';
import { getOfflineQueue, removeFromOfflineQueue } from './indexedDB';

/**
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

  let currentIndex = 0;

  // 2. Process sequentially to avoid overwhelming network/memory
  for (const record of pendingPhotos) {
    currentIndex++;
    
    try {
      // Define the standardized storage path
      // Example: inventory/1N4AL3APXFC123456/retail/left_front_three_quarter.webp
      const storagePath = `${record.vin}/${record.mode}/${record.angle_id}.webp`;

      // 3. Upload binary data to Supabase Storage
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

      // 4. Retrieve the public URL
      const { data: publicUrlData } = supabase.storage
        .from('inventory')
        .getPublicUrl(storagePath);

      // 5. Create the database record linking the asset to the vehicle
      // Assuming a generic vehicle_images or vehicle_assets table structure based on standard setups
      const { error: dbError } = await supabase
        .from('vehicle_images')
        .insert({
          vin: record.vin,
          angle_id: record.angle_id,
          mode: record.mode,
          image_url: publicUrlData.publicUrl,
          // If vehicle_id is strictly required, it would need to be fetched prior or included in the payload
        });

      if (dbError) {
        throw new Error(`Database insert failed: ${dbError.message}`);
      }

      // 6. Success: Remove from local queue
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
