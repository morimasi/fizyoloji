
import { Exercise, PatientProfile, User } from './types.ts';
import { SEED_EXERCISES } from './seed-data.ts';

/**
 * PHYSIOCORE DATA ENGINE v2.0 (IndexedDB & Background Sync)
 */
export class PhysioDB {
  private static DB_NAME = 'PhysioCore_Genesis_DB';
  private static DB_VERSION = 1;
  private static STORES = {
    EXERCISES: 'exercises',
    PROFILES: 'profiles',
    USERS: 'users',
    SYNC_QUEUE: 'sync_queue'
  };

  private static db: IDBDatabase | null = null;

  static async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORES.EXERCISES)) {
          db.createObjectStore(this.STORES.EXERCISES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(this.STORES.PROFILES)) {
          db.createObjectStore(this.STORES.PROFILES, { keyPath: 'user_id' });
        }
        if (!db.objectStoreNames.contains(this.STORES.USERS)) {
          db.createObjectStore(this.STORES.USERS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(this.STORES.SYNC_QUEUE)) {
          db.createObjectStore(this.STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = async (event: any) => {
        this.db = event.target.result;
        console.log("[PhysioDB] IndexedDB Başlatıldı.");
        
        // Boşsa seed verilerini yükle
        const exercises = await this.getExercises();
        if (exercises.length === 0) {
          console.log("[PhysioDB] Klinik kütüphane asenkron olarak yükleniyor...");
          for (const ex of SEED_EXERCISES) {
            await this.addExercise(ex);
          }
        }
        resolve();
      };

      request.onerror = (event) => reject(event);
    });
  }

  private static async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) await this.initializeDB();
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // --- EXERCISES ---
  static async getExercises(): Promise<Exercise[]> {
    const store = await this.getStore(this.STORES.EXERCISES);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  static async addExercise(exercise: Exercise): Promise<void> {
    const store = await this.getStore(this.STORES.EXERCISES, 'readwrite');
    const enriched = { ...exercise, _sync: { isDirty: true, version: 1 } };
    return new Promise((resolve) => {
      const request = store.put(enriched);
      request.onsuccess = () => {
        this.triggerSync('STUDIO_EXERCISE', enriched);
        resolve();
      };
    });
  }

  static async deleteExercise(id: string): Promise<void> {
    const store = await this.getStore(this.STORES.EXERCISES, 'readwrite');
    return new Promise((resolve) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
    });
  }

  static async updateExercise(exercise: Exercise): Promise<void> {
    await this.addExercise(exercise);
  }

  // --- PROFILES ---
  static async saveProfile(profile: PatientProfile): Promise<void> {
    const store = await this.getStore(this.STORES.PROFILES, 'readwrite');
    const enriched = { ...profile, _sync: { isDirty: true, version: (profile._sync?.version || 0) + 1 } };
    return new Promise((resolve) => {
      const request = store.put(enriched);
      request.onsuccess = () => {
        this.triggerSync('PROFILE_UPSERT', enriched);
        resolve();
      };
    });
  }

  static async getProfile(): Promise<PatientProfile | null> {
    const store = await this.getStore(this.STORES.PROFILES);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result;
        resolve(results.length > 0 ? results[0] : null);
      };
    });
  }

  // --- USERS ---
  static async getUsers(): Promise<User[]> {
    const store = await this.getStore(this.STORES.USERS);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  static async addUser(user: User): Promise<void> {
    const store = await this.getStore(this.STORES.USERS, 'readwrite');
    return new Promise((resolve) => {
      const request = store.put(user);
      request.onsuccess = () => resolve();
    });
  }

  static async deleteUser(id: string): Promise<void> {
     const store = await this.getStore(this.STORES.USERS, 'readwrite');
     return new Promise((resolve) => {
       const request = store.delete(id);
       request.onsuccess = () => resolve();
     });
  }

  static async updateUser(user: User): Promise<void> {
    await this.addUser(user);
  }

  // --- SYNC ENGINE v2 CORE ---
  private static async triggerSync(type: string, payload: any) {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType: type, payload })
      });
      
      if (response.ok) {
        console.log(`[SyncEngine] ${type} başarıyla buluta işlendi.`);
        // Dirty flag'i temizle
        await this.markAsClean(type, payload);
      } else {
        throw new Error("Sunucu hatası");
      }
    } catch (err) {
      console.warn("[SyncEngine] Bağlantı yok, veri sıraya alındı.");
      this.addToSyncQueue(type, payload);
    }
  }

  private static async markAsClean(type: string, payload: any) {
    const storeName = type === 'PROFILE_UPSERT' ? this.STORES.PROFILES : this.STORES.EXERCISES;
    const key = type === 'PROFILE_UPSERT' ? 'user_id' : 'id';
    const store = await this.getStore(storeName, 'readwrite');
    const item = await new Promise<any>(resolve => {
        const req = store.get(payload[key]);
        req.onsuccess = () => resolve(req.result);
    });
    if (item) {
        item._sync.isDirty = false;
        item._sync.lastSyncedAt = new Date().toISOString();
        store.put(item);
    }
  }

  private static async addToSyncQueue(type: string, payload: any) {
    const store = await this.getStore(this.STORES.SYNC_QUEUE, 'readwrite');
    store.put({ type, payload, timestamp: new Date().toISOString() });
  }

  static async syncPendingData(): Promise<void> {
    if (!navigator.onLine) return;
    const store = await this.getStore(this.STORES.SYNC_QUEUE, 'readwrite');
    const pending = await new Promise<any[]>(resolve => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result);
    });

    for (const item of pending) {
        await this.triggerSync(item.type, item.payload);
        store.delete(item.id);
    }
  }

  static async syncExerciseToMobile(patientId: string, exerciseId: string): Promise<boolean> {
     const profile = await this.getProfile();
     if (!profile) return false;
     const exIndex = profile.suggestedPlan.findIndex(ex => ex.id === exerciseId);
     if (exIndex === -1) return false;
     profile.suggestedPlan[exIndex].syncInfo = {
       isSynced: true,
       lastSyncDate: new Date().toISOString(),
       downloadProgress: 100
     };
     await this.saveProfile(profile);
     return true;
  }
}
