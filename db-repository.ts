
import { Exercise, PatientProfile, User } from './types.ts';
import { SEED_EXERCISES } from './seed-data.ts';

/**
 * PHYSIOCORE CLOUD ENGINE v8.3 (STRICT CLOUD MODE - UNIVERSAL ROUTING)
 * - Forces Production API for all non-production environments
 * - No LocalStorage / In-Memory Fallback
 * - Auto-Seeding to Production Database
 */
export class PhysioDB {
  
  static async initializeDB(): Promise<void> {
    console.log("[PhysioCore] Cloud Engine Initializing...");
    // Initial connection check can be done here if needed
  }

  // --- CORE API CLIENT ---

  private static getApiBaseUrl(): string {
    if (typeof window === 'undefined') return ''; // Server-side safety
    
    const hostname = window.location.hostname;
    
    // If we are strictly on the production domain, use relative paths.
    // This ensures internal routing works best when deployed to the main site.
    if (hostname === 'fizyoloji.vercel.app') {
      return '';
    }

    // For ALL other environments (Localhost, Bolt, Stackblitz, Vercel Previews, Forks),
    // we must proxy to the live production server to access the centralized database.
    return 'https://fizyoloji.vercel.app';
  }

  private static async fetchAPI<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    const baseUrl = this.getApiBaseUrl();
    const url = `${baseUrl}/api/data${endpoint}`;

    try {
      const res = await fetch(url, options);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[Cloud Error] ${res.status} at ${url}: ${errorText}`);
        
        if (res.status === 404) {
          throw new Error("Cloud API Endpoint Not Found. (Backend may not be deployed or URL is incorrect)");
        }
        throw new Error(`Cloud API Error: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.error("[Fatal DB Error]", err);
      throw err;
    }
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
      throw e; 
    }
  }

  // BATCH SEEDING ENGINE
  private static async seedCloudDatabase() {
    const BATCH_SIZE = 5;
    const total = SEED_EXERCISES.length;
    
    console.log(`[Cloud Seed] ${total} egzersiz kuyruğa alındı.`);
    
    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = SEED_EXERCISES.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(ex => this.addExercise(ex)));
      console.log(`[Cloud Seed] Paket işlendi: ${i + batch.length}/${total}`);
      await new Promise(r => setTimeout(r, 500)); 
    }
    console.log("[Cloud Seed] ✅ SENKRONİZASYON TAMAMLANDI.");
  }

  static async addExercise(exercise: Exercise): Promise<void> {
    await this.fetchAPI('', 'POST', { table: 'exercises', data: exercise });
  }

  static async updateExercise(exercise: Exercise): Promise<void> {
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
    await this.addUser(user); 
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
    console.warn("Profile save via direct DB call is pending implementation in Vercel API.");
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
    console.log(`[Cloud Sync] Ex: ${exerciseId} -> Patient: ${patientId}`);
    return true; 
  }
}
