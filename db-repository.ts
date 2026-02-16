
import { Exercise, PatientProfile, User } from './types.ts';
import { SEED_EXERCISES } from './seed-data.ts';

/**
 * PHYSIOCORE DATA ENGINE v3.0 (Enterprise IndexedDB & Cloud Orchestrator)
 */
export class PhysioDB {
  private static DB_NAME = 'PhysioCore_Genesis_DB';
  private static DB_VERSION = 2; // Şema değişikliği için versiyon artırıldı
  private static STORES = {
    EXERCISES: 'exercises',
    PROFILES: 'profiles',
    USERS: 'users',
    TASKS: 'tasks',
    LOGS: 'logs',
    SYNC_QUEUE: 'sync_queue'
  };

  private static db: IDBDatabase | null = null;

  static async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORES.EXERCISES)) db.createObjectStore(this.STORES.EXERCISES, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(this.STORES.PROFILES)) db.createObjectStore(this.STORES.PROFILES, { keyPath: 'user_id' });
        if (!db.objectStoreNames.contains(this.STORES.USERS)) db.createObjectStore(this.STORES.USERS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(this.STORES.TASKS)) db.createObjectStore(this.STORES.TASKS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(this.STORES.LOGS)) db.createObjectStore(this.STORES.LOGS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(this.STORES.SYNC_QUEUE)) db.createObjectStore(this.STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
      };

      request.onsuccess = async (event: any) => {
        this.db = event.target.result;
        const exercises = await this.getExercises();
        if (exercises.length === 0) {
          for (const ex of SEED_EXERCISES) await this.addExercise(ex);
        }
        resolve();
      };

      request.onerror = (event) => reject(event);
    });
  }

  private static async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) await this.initializeDB();
    return this.db!.transaction(storeName, mode).objectStore(storeName);
  }

  // --- EXERCISES ---
  static async getExercises(): Promise<Exercise[]> {
    const store = await this.getStore(this.STORES.EXERCISES);
    return new Promise(r => { const req = store.getAll(); req.onsuccess = () => r(req.result || []); });
  }

  static async addExercise(exercise: Exercise): Promise<void> {
    const store = await this.getStore(this.STORES.EXERCISES, 'readwrite');
    const enriched = { ...exercise, _sync: { isDirty: true, version: 1 } };
    return new Promise(r => { 
      const req = store.put(enriched); 
      req.onsuccess = () => { this.triggerSync('STUDIO_EXERCISE', enriched); r(); }; 
    });
  }

  static async deleteExercise(id: string): Promise<void> {
    const store = await this.getStore(this.STORES.EXERCISES, 'readwrite');
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
  // Fix: Added missing getUsers method to retrieve all users from IDB
  static async getUsers(): Promise<User[]> {
    const store = await this.getStore(this.STORES.USERS);
    return new Promise(r => { const req = store.getAll(); req.onsuccess = () => r(req.result || []); });
  }

  // Fix: Added missing addUser method to store a new user and trigger sync
  static async addUser(user: User): Promise<void> {
    const store = await this.getStore(this.STORES.USERS, 'readwrite');
    const enriched = { ...user, _sync: { isDirty: true, version: 1 } };
    return new Promise(r => { 
      const req = store.put(enriched); 
      req.onsuccess = () => { this.triggerSync('USER_UPSERT', enriched); r(); }; 
    });
  }

  // Fix: Added missing updateUser method (alias to addUser for simplicity in IDB put)
  static async updateUser(user: User): Promise<void> {
    await this.addUser(user);
  }

  // Fix: Added missing deleteUser method to remove user records by ID
  static async deleteUser(id: string): Promise<void> {
    const store = await this.getStore(this.STORES.USERS, 'readwrite');
    return new Promise(r => { const req = store.delete(id); req.onsuccess = () => r(); });
  }

  // --- CLINICAL TASKS (New) ---
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
      if (response.ok) await this.markAsClean(type, payload);
      else throw new Error("Sync Failed");
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
    
    const storeName = storeMap[type];
    if (!storeName) return;

    const store = await this.getStore(storeName, 'readwrite');
    const item = await new Promise<any>(r => {
      const req = store.get(payload[keyMap[type]]);
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
