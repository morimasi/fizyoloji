
import { Exercise, PatientProfile, User } from './types.ts';
import { SEED_EXERCISES } from './seed-data.ts';

/**
 * PHYSIOCORE CLOUD ENGINE v8.0 (STRICT CLOUD MODE)
 * - No LocalStorage
 * - No In-Memory Fallback
 * - Auto-Seeding to Production Database
 */
export class PhysioDB {
  
  static async initializeDB(): Promise<void> {
    console.log("[PhysioCore] Connecting to Live Cloud Database...");
    // Initial connection check is handled by the first data fetch
  }

  // --- CORE API CLIENT ---

  private static async fetchAPI<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`/api/data${endpoint}`, options);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Cloud Error] ${res.status}: ${errorText}`);
      throw new Error(`Cloud API Error: ${res.statusText}`);
    }
    return await res.json();
  }

  // --- EXERCISE MANAGEMENT (CLOUD ONLY) ---

  static async getExercises(): Promise<Exercise[]> {
    try {
      const data = await this.fetchAPI<Exercise[]>('?table=exercises');
      
      // AUTO-SEEDING TRIGGER
      // Eğer bulut veritabanı boşsa, Seed verisini yükle.
      if (Array.isArray(data) && data.length === 0) {
        console.warn("⚠️ BULUT VERİTABANI BOŞ! Otomatik Tohumlama Başlatılıyor (70 Öğe)...");
        await this.seedCloudDatabase();
        return await this.fetchAPI<Exercise[]>('?table=exercises'); // Yükleme bitince tekrar çek
      }
      
      return data;
    } catch (e) {
      console.error("Kritik Veritabanı Hatası:", e);
      throw e; // Hata fırlat ki UI "Sistem Hatası" versin, yalandan çalışmasın.
    }
  }

  // BATCH SEEDING ENGINE
  // Sunucuyu (Vercel Function Timeout) patlatmamak için 5'erli paketler halinde gönderir.
  private static async seedCloudDatabase() {
    const BATCH_SIZE = 5;
    const total = SEED_EXERCISES.length;
    
    console.log(`[Cloud Seed] ${total} egzersiz kuyruğa alındı.`);
    
    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = SEED_EXERCISES.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(ex => this.addExercise(ex)));
      console.log(`[Cloud Seed] Paket işlendi: ${i + batch.length}/${total}`);
      // Sunucuya nefes aldır
      await new Promise(r => setTimeout(r, 500)); 
    }
    console.log("[Cloud Seed] ✅ SENKRONİZASYON TAMAMLANDI.");
  }

  static async addExercise(exercise: Exercise): Promise<void> {
    await this.fetchAPI('', 'POST', { table: 'exercises', data: exercise });
  }

  static async updateExercise(exercise: Exercise): Promise<void> {
    // ID kontrolü kritik
    await this.fetchAPI('', 'POST', { table: 'exercises', data: exercise });
  }

  static async deleteExercise(id: string): Promise<void> {
    await this.fetchAPI(`?table=exercises&id=${id}`, 'DELETE');
  }

  // --- USER MANAGEMENT (CLOUD ONLY) ---

  static async getUsers(): Promise<User[]> {
    return await this.fetchAPI<User[]>('?table=users');
  }

  static async addUser(user: User): Promise<void> {
    await this.fetchAPI('', 'POST', { table: 'users', data: user });
  }

  static async updateUser(user: User): Promise<void> {
    await this.addUser(user); // Upsert logic in API
  }

  static async deleteUser(id: string): Promise<void> {
    await this.fetchAPI(`?table=users&id=${id}`, 'DELETE');
  }

  // --- PATIENT PROFILE ---

  static async getProfile(): Promise<PatientProfile | null> {
    try {
      const users = await this.getUsers();
      const patient = users.find(u => u.role === 'Patient');
      return patient?.patientProfile || null;
    } catch {
      return null;
    }
  }

  static async saveProfile(profile: PatientProfile): Promise<void> {
    // Profil kaydı karmaşık olduğu için genellikle User update üzerinden yürür
    // Ancak burada direkt profil endpoint'i simüle ediyoruz.
    // Gerçekte API tarafında handle edilmeli.
    console.warn("Profile save via direct DB call is pending implementation.");
  }

  // --- TASKS ---

  static async getTasks(): Promise<any[]> {
    return await this.fetchAPI<any[]>('?table=tasks');
  }

  static async saveTask(task: any): Promise<void> {
    await this.fetchAPI('', 'POST', { table: 'tasks', data: task });
  }

  static async deleteTask(id: string): Promise<void> {
    await this.fetchAPI(`?table=tasks&id=${id}`, 'DELETE');
  }

  // --- UTILS ---
  static async syncExerciseToMobile(patientId: string, exerciseId: string) { 
    // Cloud log only
    console.log(`[Cloud Sync] Ex: ${exerciseId} -> Patient: ${patientId}`);
    return true; 
  }
}
