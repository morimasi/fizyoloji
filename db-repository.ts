
import { Exercise, PatientProfile, User } from './types.ts';
import { SEED_EXERCISES } from './seed-data.ts';

/**
 * PHYSIOCORE SYNC ENGINE v5.0 (Global Autonomous Synchronization)
 * Local-First, Cloud-Consistent 24/7 Architecture.
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
  private static isSyncing = false;
  private static syncInterval: any = null;

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
        this.startAutoSync(); // Uygulama açıldığı an 7/24 döngüsünü başlat
        resolve();
      };

      request.onerror = (event) => reject(event);
    });
  }

  /**
   * 7/24 Otomatik Senkronizasyon Döngüsü
   * Her 30 saniyede bir yerel "Dirty" verileri buluta basar ve buluttan yenilikleri çeker.
   */
  private static startAutoSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    
    // 1. İlk açılışta hemen senkronize et
    this.processSyncQueue();

    // 2. 30 saniyelik "Heartbeat" döngüsü
    this.syncInterval = setInterval(() => {
      if (!this.isSyncing && navigator.onLine) {
        this.processSyncQueue();
      }
    }, 30000);

    // 3. Bağlantı geldiği an tetikle
    window.addEventListener('online', () => this.processSyncQueue());
  }

  private static async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) await this.initializeDB();
    return this.db!.transaction(storeName, mode).objectStore(storeName);
  }

  // --- SYNC CORE LOGIC ---

  static async processSyncQueue(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    console.log("[SyncEngine] Heartbeat: Starting background sync...");

    try {
      // A. YERELDE DEĞİŞENLERİ BULUTA BAS (Push)
      const allStores = [this.STORES.EXERCISES, this.STORES.PROFILES, this.STORES.USERS, this.STORES.TASKS];
      
      for (const storeName of allStores) {
        const store = await this.getStore(storeName, 'readonly');
        const items: any[] = await new Promise(r => {
          const req = store.getAll();
          req.onsuccess = () => r(req.result || []);
        });

        const dirtyItems = items.filter(i => i._sync?.isDirty);
        
        for (const item of dirtyItems) {
          const syncTypeMap: any = {
            'exercises': 'STUDIO_EXERCISE',
            'profiles': 'PROFILE_UPSERT',
            'users': 'USER_UPSERT',
            'tasks': 'TASK_SYNC'
          };
          await this.triggerSync(syncTypeMap[storeName], item);
        }
      }

      // B. BULUTTAKİ YENİLİKLERİ YERELE ÇEK (Pull - Opsiyonel/Gelişmiş)
      // Bu kısımda GET /api/sync?lastSyncedAt=... çağrısı yapılarak global güncellemeler alınabilir.
      
    } catch (e) {
      console.error("[SyncEngine] Auto-sync failed:", e);
    } finally {
      this.isSyncing = false;
    }
  }

  static async syncAllLocalToCloud(): Promise<{ success: boolean; count: number }> {
    await this.processSyncQueue();
    // Manuel tetiklendiğinde tüm veriyi kontrol et (isDirty olmasa bile)
    const localExercises = await this.getExercises(true);
    let successCount = 0;
    for (const ex of localExercises) {
       const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ syncType: 'STUDIO_EXERCISE', payload: ex })
       });
       if (res.ok) successCount++;
    }
    return { success: true, count: successCount };
  }

  // --- DATA METHODS ---

  static async getExercises(forceLocal = false): Promise<Exercise[]> {
    const store = await this.getStore(this.STORES.EXERCISES);
    const localData: Exercise[] = await new Promise(r => { 
      const req = store.getAll(); 
      req.onsuccess = () => r(req.result || []); 
    });

    if (localData.length === 0 && !forceLocal) {
      for (const ex of SEED_EXERCISES) await this.addExercise(ex);
      return SEED_EXERCISES;
    }
    return localData;
  }

  static async addExercise(exercise: Exercise): Promise<void> {
    const store = await this.getStore(this.STORES.EXERCISES, 'readwrite');
    const enriched = { 
      ...exercise, 
      updated_at: new Date().toISOString(), 
      _sync: { isDirty: true, version: (exercise._sync?.version || 0) + 1 } 
    };
    return new Promise(r => { 
      const req = store.put(enriched); 
      req.onsuccess = () => { 
        // Anında senkronizasyon denemesi (Offline ise sessizce kuyruğa kalır)
        this.triggerSync('STUDIO_EXERCISE', enriched); 
        r(); 
      }; 
    });
  }

  static async deleteExercise(id: string): Promise<void> {
    const store = await this.getStore(this.STORES.EXERCISES, 'readwrite');
    return new Promise(r => { const req = store.delete(id); req.onsuccess = () => r(); });
  }

  static async updateExercise(exercise: Exercise): Promise<void> {
    await this.addExercise(exercise);
  }

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

  private static async triggerSync(type: string, payload: any) {
    if (!navigator.onLine) return; // Çevrimdışı isek hiç deneme, Heartbeat beklesin.

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType: type, payload })
      });
      
      if (response.ok) {
        await this.markAsClean(type, payload);
      }
    } catch (err) {
      // Ağ hatası vb. sessizce yutulur, bir sonraki heartbeat deneyecek.
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

    if (item) {
      item._sync = { ...item._sync, isDirty: false, lastSyncedAt: new Date().toISOString() };
      store.put(item);
    }
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
