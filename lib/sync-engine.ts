import { supabase } from "./supabase";

export const queueOfflineAction = (action: 'insert' | 'update', payload: any, id: string | null, table: string = "vehicles") => {
  const queue = JSON.parse(localStorage.getItem('lotengine_sync_queue') || '[]');
  queue.push({ action, payload, id, table, ts: Date.now() });
  localStorage.setItem('lotengine_sync_queue', JSON.stringify(queue));
};

export const processOfflineQueue = async (onComplete?: () => void) => {
  const queue = JSON.parse(localStorage.getItem('lotengine_sync_queue') || '[]');
  if (queue.length === 0) return;
  
  for (const item of queue) {
    const table = item.table || "vehicles";
    try {
      if (item.action === 'update' && item.id) {
        await supabase.from(table).update(item.payload).eq("id", item.id);
      } else if (item.action === 'insert') {
        await supabase.from(table).insert(item.id ? { ...item.payload, id: item.id } : item.payload);
      }
    } catch (e) {
      console.error(`Offline sync failed for item:`, item, e);
      // We keep processing other items
    }
  }
  
  localStorage.removeItem('lotengine_sync_queue');
  if (onComplete) onComplete();
};
