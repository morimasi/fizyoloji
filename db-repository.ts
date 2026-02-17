import { Exercise, PatientProfile, User } from './types.ts';
import { SEED_EXERCISES } from './seed-data.ts';

/**
 * PHYSIOCORE CLOUD ENGINE v7.0 (LIVE-ONLY)
 * - No IndexedDB.
 * - No Local Storage.
 * - Direct PostgreSQL Connection via API.
 * - Single Source of Truth.
 */
export class PhysioDB {
  
  // Veritabanı bağlantısı gerekmez, her şey API üzerinden.
  static async initializeDB(): Promise<void> {
    console.log("[PhysioCore] Cloud Engine Initialized. Mode: LIVE");
  }

  // --- GENERIC API CLIENT ---

  private static async fetchAPI<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    try {
      const res = await fetch(`/api/data${endpoint}`, options);
      if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.error("[Cloud Error]", err);
      throw err;
    }
  }

  // --- EXERCISES (LIVE CRUD) ---

  static async getExercises(): Promise<Exercise[]> {
    try {
      const data = await this.fetchAPI<Exercise[]>('?table=exercises');
      
      // AUTO-SEEDING LOGIC
      // Eğer sunucu boşsa, elimizdeki Master Data'yı sunucuya yükle.
      if (data.length === 0) {
        console.warn("[Cloud] Envanter boş. Otomatik Cloud Seeding başlatılıyor...");
        await this.seedCloudDatabase();
        return SEED_EXERCISES;
      }
      
      return data;
    } catch (e) {
      console.error("Egzersizler getirilemedi:", e);
      return [];
    }
  }

  private static async seedCloudDatabase() {
    // 70 Egzersizi Paralel Olarak Sunucuya Gönder
    const promises = SEED_EXERCISES.map(ex => this.addExercise(ex));
    await Promise.all(promises);
    console.log("[Cloud] Seeding Tamamlandı. 70 Egzersiz Canlı.");
  }

  static async addExercise(exercise: Exercise): Promise<void> {
    await this.fetchAPI('', 'POST', { table: 'exercises', data: exercise });
  }

  static async updateExercise(exercise: Exercise): Promise<void> {
    // API tarafında POST işlemi UPSERT (Varsa Güncelle, Yoksa Ekle) mantığında çalışır.
    await this.addExercise(exercise);
  }

  static async deleteExercise(id: string): Promise<void> {
    await this.fetchAPI(`?table=exercises&id=${id}`, 'DELETE');
  }

  // --- USERS & PROFILES (LIVE CRUD) ---

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

  static async getProfile(): Promise<PatientProfile | null> {
    // Demo veya Auth bağlamında, şu anlık ilk hastayı veya mock profili çekebiliriz.
    // Gerçek senaryoda auth token'dan gelen ID kullanılır.
    try {
      const users = await this.getUsers();
      const patient = users.find(u => u.role === 'Patient');
      return patient?.patientProfile || null;
    } catch {
      return null;
    }
  }

  static async saveProfile(profile: PatientProfile): Promise<void> {
    // Profil aslında User tablosunun bir parçası (JSONB). 
    // Bu yüzden User update endpoint'ini kullanacağız.
    // Ancak burada User objesini tam yapılandırmak gerekir. 
    // Basitlik adına, backend'e "profile_update" aksiyonu gönderebiliriz.
    await this.fetchAPI('', 'POST', { table: 'profiles', data: profile });
  }

  // --- TASKS (LIVE CRUD) ---

  static async getTasks(): Promise<any[]> {
    return await this.fetchAPI<any[]>('?table=tasks');
  }

  static async saveTask(task: any): Promise<void> {
    await this.fetchAPI('', 'POST', { table: 'tasks', data: task });
  }

  static async deleteTask(id: string): Promise<void> {
    await this.fetchAPI(`?table=tasks&id=${id}`, 'DELETE');
  }

  // --- LEGACY / HELPER METHODS ---
  // Eski kodlarda hata vermemesi için boş metodlar.
  static async syncAllLocalToCloud() { return { success: true, count: 0 }; }
  
  static async syncExerciseToMobile(patientId: string, exerciseId: string) { 
    // Placeholder for mobile sync logic
    return true; 
  }
  
  static async resetLibrary() { 
    // Cloud'da reset tehlikeli olabilir, bu yüzden sadece konsola basıyoruz.
    console.log("Cloud Reset is managed via Admin Panel only."); 
  }
}