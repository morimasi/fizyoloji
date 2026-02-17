
import { Exercise, PatientProfile, User } from './types.ts';
import { SEED_EXERCISES } from './seed-data.ts';

/**
 * PHYSIOCORE DATA ENGINE v4.0 (Cloud-First Sync Architecture)
 * Handles local IndexedDB as a cache and Vercel Postgres as the Master Truth.
 */
export class PhysioDB {
  private static DB_NAME = 'PhysioCore_Genesis_DB';
  private static DB_VERSION = 3;
  private static STORES = {
    EXERCISES: 'exercises',
    PROFILES: 'profiles',
    USERS: 'users',
    TASKS: 'tasks',
    SYNC_QUEUE: 'sync_queue'
  };

  private static db: IDBDatabase | null = null;

  static async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        Object.values(this.STORES).forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { 
              keyPath: store === this.STORES.SYNC_QUEUE ? 'id' : (store === this.STORES.PROFILES ? 'user_id' : 'id'), 
              autoIncrement: store === this.STORES.SYNC_QUEUE 
            });
          }
        });
      };

      request.onsuccess = async (event: any) => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = (event) => reject(event);
    });
  }

  private static async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) await this.initializeDB();
    return this.db!.transaction(storeName, mode).objectStore(storeName);
  }

  // --- GLOBAL SYNC ENGINE (MIGRATION) ---
  /**
   * Yereldeki tüm egzersizleri bulut veritabanına basar.
   * Bu işlem sadece admin tarafından bir kez veya veri değişikliğinde tetiklenir.
   */
  static async syncAllLocalToCloud(): Promise<{ success: boolean; count: number }> {
    const localExercises = await this.getExercises(true); // Sadece yereli al
    let successCount = 0;

    for (const ex of localExercises) {
      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ syncType: 'STUDIO_EXERCISE', payload: ex })
        });
        if (res.ok) successCount++;
      } catch (e) {
        console.error(`Sync failed for ${ex.code}`, e);
      }
    }
    return { success: true, count: successCount };
  }

  // --- EXERCISES (Cloud-First) ---
  static async getExercises(forceLocal = false): Promise<Exercise[]> {
    if (!forceLocal) {
      try {
        // Master Database'den çekmeye çalış (Gerçek zamanlı global veri)
        // Not: Bu endpoint backend'de tüm listeyi dönen bir GET /api/exercises gerektirir.
        // Şimdilik sync üzerinden simüle ediyoruz veya her açılışta sync tetikliyoruz.
      } catch (e) {
        console.warn("Cloud fetch failed, fallback to local storage.");
      }
    }

    const store = await this.getStore(this.STORES.EXERCISES);
    const localData: Exercise[] = await new Promise(r => { 
      const req = store.getAll(); 
      req.onsuccess = () => r(req.result || []); 
    });

    // Eğer yerel boşsa seed datayı bas (Initial setup)
    if (localData.length === 0 && !forceLocal) {
      for (const ex of SEED_EXERCISES) await this.addExercise(ex);
      return SEED_EXERCISES;
    }

    return localData;
  }

  static async addExercise(exercise: Exercise): Promise<void> {
    const store = await this.getStore(this.STORES.EXERCISES, 'readwrite');
    const enriched = { ...exercise, updated_at: new Date().toISOString(), _sync: { isDirty: true, version: 1 } };
    return new Promise(r => { 
      const req = store.put(enriched); 
      req.onsuccess = () => { 
        this.triggerSync('STUDIO_EXERCISE', enriched); 
        r(); 
      }; 
    });
  }

  static async deleteExercise(id: string): Promise<void> {
    const store = await this.getStore(this.STORES.EXERCISES, 'readwrite');
    // Bulut silme işlemi için sync logic eklenebilir
    return new Promise(r => { const req = store.delete(id); req.onsuccess = () => r(); });
  }

  static async updateExercise(exercise: Exercise): Promise<void> {
    await this.addExercise(exercise);
  }

  // --- PROFILES ---
  static async saveProfile(profile: PatientProfile): Promise<void> {
    const store = await this.getStore(this.STORES.PROFILES, 'readwrite');
    const enriched = { ...profile, _sync: { isDirty: true, version: (profile._sync?.version || 0) + 1 } };
    return new Promise(r => { 
      const req = store.put(enriched); 
      req.onsuccess = () => { this.triggerSync('PROFILE_UPSERT', enriched); r(); }; 
    });
  }

  static async getProfile(): Promise<PatientProfile | null> {
    const store = await this.getStore(this.STORES.PROFILES);
    return new Promise(r => { const req = store.getAll(); req.onsuccess = () => r(req.result[0] || null); });
  }

  // --- USERS ---
  static async getUsers(): Promise<User[]> {
    const store = await this.getStore(this.STORES.USERS);
    return new Promise(r => { const req = store.getAll(); req.onsuccess = () => r(req.result || []); });
  }

  static async addUser(user: User): Promise<void> {
    const store = await this.getStore(this.STORES.USERS, 'readwrite');
    const enriched = { ...user, _sync: { isDirty: true, version: 1 } };
    return new Promise(r => { 
      const req = store.put(enriched); 
      req.onsuccess = () => { this.triggerSync('PROFILE_UPSERT', enriched); r(); }; 
    });
  }

  static async updateUser(user: User): Promise<void> {
    await this.addUser(user);
  }

  static async deleteUser(id: string): Promise<void> {
    const store = await this.getStore(this.STORES.USERS, 'readwrite');
    return new Promise(r => { const req = store.delete(id); req.onsuccess = () => r(); });
  }

  // --- CLINICAL TASKS ---
  static async getTasks(): Promise<any[]> {
    const store = await this.getStore(this.STORES.TASKS);
    return new Promise(r => { const req = store.getAll(); req.onsuccess = () => r(req.result || []); });
  }

  static async saveTask(task: any): Promise<void> {
    const store = await this.getStore(this.STORES.TASKS, 'readwrite');
    const enriched = { ...task, _sync: { isDirty: true, version: 1 } };
    return new Promise(r => {
      const req = store.put(enriched);
      req.onsuccess = () => { this.triggerSync('TASK_SYNC', enriched); r(); };
    });
  }

  static async deleteTask(id: string): Promise<void> {
    const store = await this.getStore(this.STORES.TASKS, 'readwrite');
    return new Promise(r => { const req = store.delete(id); req.onsuccess = () => r(); });
  }

  // --- SYNC ENGINE ---
  private static async triggerSync(type: string, payload: any) {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType: type, payload })
      });
      
      if (response.ok) {
        await this.markAsClean(type, payload);
      } else {
        this.addToSyncQueue(type, payload);
      }
    } catch (err) {
      this.addToSyncQueue(type, payload);
    }
  }

  private static async markAsClean(type: string, payload: any) {
    const storeMap: any = { 
      'PROFILE_UPSERT': this.STORES.PROFILES, 
      'STUDIO_EXERCISE': this.STORES.EXERCISES, 
      'TASK_SYNC': this.STORES.TASKS,
      'USER_UPSERT': this.STORES.USERS 
    };
    const keyMap: any = { 
      'PROFILE_UPSERT': 'user_id', 
      'STUDIO_EXERCISE': 'id', 
      'TASK_SYNC': 'id',
      'USER_UPSERT': 'id'
    };
    
    const storeName = storeMap[type] || this.STORES.USERS;
    const store = await this.getStore(storeName, 'readwrite');
    const idValue = payload[keyMap[type]] || payload.id || payload.user_id;

    if (!idValue) return;

    const item = await new Promise<any>(r => {
      const req = store.get(idValue);
      req.onsuccess = () => r(req.result);
    });

    if (item && item._sync) {
      item._sync.isDirty = false;
      item._sync.lastSyncedAt = new Date().toISOString();
      store.put(item);
    }
  }

  private static async addToSyncQueue(type: string, payload: any) {
    const store = await this.getStore(this.STORES.SYNC_QUEUE, 'readwrite');
    store.put({ type, payload, timestamp: new Date().toISOString() });
  }

  static async syncExerciseToMobile(patientId: string, exerciseId: string): Promise<boolean> {
     const profile = await this.getProfile();
     if (!profile) return false;
     const exIndex = profile.suggestedPlan.findIndex(ex => ex.id === exerciseId);
     if (exIndex === -1) return false;
     profile.suggestedPlan[exIndex].syncInfo = { isSynced: true, lastSyncDate: new Date().toISOString(), downloadProgress: 100 };
     await this.saveProfile(profile);
     return true;
  }
}
