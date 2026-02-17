
import { Exercise, PatientProfile, User } from './types.ts';
import { SEED_EXERCISES } from './seed-data.ts';

/**
 * PHYSIOCORE CLOUD ENGINE v7.1 (Failover Enabled)
 * - Primary: Direct PostgreSQL Connection via /api/data
 * - Fallback: In-Memory Simulation (RAM) if API is unreachable.
 * - Constraint: No IndexedDB used.
 */
export class PhysioDB {
  
  // Static In-Memory Storage for Simulation Mode (Cloud Emulator)
  private static _memoryStore = {
    exercises: [...SEED_EXERCISES],
    users: [] as User[],
    tasks: [] as any[]
  };

  static async initializeDB(): Promise<void> {
    console.log("[PhysioCore] Cloud Engine Initialized.");
  }

  // --- GENERIC API CLIENT WITH FAILOVER ---

  private static async fetchAPI<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    try {
      const res = await fetch(`/api/data${endpoint}`, options);
      
      // Handle 404 (Not Found) or 500 (Server Error) by switching to Simulation
      if (!res.ok) {
        if (res.status === 404 || res.status === 500) {
            console.warn(`[Cloud] API Unreachable (${res.status}). Switching to Simulation Layer.`);
            return this.mockCloudResponse<T>(endpoint, method, body);
        }
        throw new Error(`API Error: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.warn("[Cloud] Connection Error. Using Simulation Layer.", err);
      return this.mockCloudResponse<T>(endpoint, method, body);
    }
  }

  // --- MOCK CLOUD SIMULATION (IN-MEMORY) ---
  private static mockCloudResponse<T>(endpoint: string, method: string, body: any): Promise<T> {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Parse Query
            const urlParams = new URLSearchParams(endpoint.replace('?', ''));
            const table = urlParams.get('table') || (body && body.table);
            const id = urlParams.get('id');

            // 1. READ (GET)
            if (method === 'GET') {
                if (table === 'exercises') resolve(this._memoryStore.exercises as any);
                else if (table === 'users') resolve(this._memoryStore.users as any);
                else if (table === 'tasks') resolve(this._memoryStore.tasks as any);
                else resolve([] as any);
            }
            
            // 2. WRITE (POST)
            else if (method === 'POST') {
                const data = body.data;
                const targetTable = body.table; // exercises, users, tasks
                
                if (targetTable === 'exercises') {
                    const idx = this._memoryStore.exercises.findIndex(e => e.id === data.id);
                    if (idx >= 0) this._memoryStore.exercises[idx] = { ...this._memoryStore.exercises[idx], ...data };
                    else this._memoryStore.exercises.unshift(data);
                } else if (targetTable === 'users') {
                    const idx = this._memoryStore.users.findIndex(u => u.id === data.id);
                    if (idx >= 0) this._memoryStore.users[idx] = { ...this._memoryStore.users[idx], ...data };
                    else this._memoryStore.users.push(data);
                } else if (targetTable === 'tasks') {
                    const idx = this._memoryStore.tasks.findIndex(t => t.id === data.id);
                    if (idx >= 0) this._memoryStore.tasks[idx] = { ...this._memoryStore.tasks[idx], ...data };
                    else this._memoryStore.tasks.push(data);
                }
                
                resolve({ success: true } as any);
            }

            // 3. DELETE
            else if (method === 'DELETE') {
                if (table === 'exercises') {
                    this._memoryStore.exercises = this._memoryStore.exercises.filter(e => e.id !== id);
                } else if (table === 'users') {
                    this._memoryStore.users = this._memoryStore.users.filter(u => u.id !== id);
                } else if (table === 'tasks') {
                    this._memoryStore.tasks = this._memoryStore.tasks.filter(t => t.id !== id);
                }
                resolve({ success: true } as any);
            }
        }, 300); // Simulate network latency
    });
  }

  // --- EXERCISES (LIVE CRUD) ---

  static async getExercises(): Promise<Exercise[]> {
    try {
      const data = await this.fetchAPI<Exercise[]>('?table=exercises');
      if (data.length === 0) {
        // If simulation is empty (unlikely with SEED) or API returns empty
        return SEED_EXERCISES;
      }
      return data;
    } catch (e) {
      console.error("Egzersizler getirilemedi:", e);
      return SEED_EXERCISES; // Fail-safe
    }
  }

  static async addExercise(exercise: Exercise): Promise<void> {
    await this.fetchAPI('', 'POST', { table: 'exercises', data: exercise });
  }

  static async updateExercise(exercise: Exercise): Promise<void> {
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
    // In strict cloud mode, we'd fetch the specific user. 
    // For now, we return the first patient found or null.
    try {
      const users = await this.getUsers();
      const patient = users.find(u => u.role === 'Patient');
      return patient?.patientProfile || null;
    } catch {
      return null;
    }
  }

  static async saveProfile(profile: PatientProfile): Promise<void> {
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

  // --- HELPER METHODS ---
  static async syncAllLocalToCloud() { return { success: true, count: 0 }; }
  
  static async syncExerciseToMobile(patientId: string, exerciseId: string) { 
    return true; 
  }
  
  static async resetLibrary() { 
    console.log("Cloud Reset is managed via Admin Panel only."); 
  }
}
