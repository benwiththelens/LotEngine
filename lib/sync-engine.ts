import { createClient } from "./supabase-browser";

const supabase = createClient();

export const queueOfflineAction = (action: 'insert' | 'update', payload: Record<string, unknown>, id: string | null, table: string = "vehicles") => {
  const queue = JSON.parse(localStorage.getItem('lotengine_sync_queue') || '[]');
  queue.push({ action, payload, id, table, ts: Date.now() });
  localStorage.setItem('lotengine_sync_queue', JSON.stringify(queue));
};

export const processOfflineQueue = async (onComplete?: () => void) => {
  const queue = JSON.parse(localStorage.getItem('lotengine_sync_queue') || '[]');
  if (queue.length === 0) return;

  const failedItems: typeof queue = [];

  for (const item of queue) {
    const table = item.table || "vehicles";
    try {
      if (item.action === 'update' && item.id) {
        const { error } = await supabase.from(table).update(item.payload).eq("id", item.id);
        if (error) throw error;
      } else if (item.action === 'insert') {
        const { error } = await supabase.from(table).insert(item.id ? { ...item.payload, id: item.id } : item.payload);
        if (error) throw error;
      }
    } catch (e) {
      console.error(`Offline sync failed for item — will retry on next sync:`, item, e);
      failedItems.push(item); // Preserve failed items for retry
    }
  }

  // Only persist failed items; successful ones are implicitly dropped
  if (failedItems.length > 0) {
    localStorage.setItem('lotengine_sync_queue', JSON.stringify(failedItems));
  } else {
    localStorage.removeItem('lotengine_sync_queue');
  }

  // Only call onComplete when queue is fully drained
  if (failedItems.length === 0 && onComplete) onComplete();
};
