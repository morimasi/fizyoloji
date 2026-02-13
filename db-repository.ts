
import { Exercise, PatientProfile, User, PatientUser } from './types.ts';

/**
 * PhysioCore AI - Smart Persistence & Cost Optimizer (v4.0)
 * Includes Full User Management System
 */
export class PhysioDB {
  private static EXERCISES_KEY = 'physiocore_exercises';
  private static PROFILE_KEY = 'physiocore_patient';
  private static USERS_KEY = 'physiocore_users';
  private static CACHE_KEY = 'physiocore_ai_cache'; 
  private static SYNC_STATUS_KEY = 'physiocore_sync_meta';

  // --- USER MANAGEMENT ---

  static async getUsers(): Promise<User[]> {
    const cached = localStorage.getItem(this.USERS_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        localStorage.removeItem(this.USERS_KEY);
      }
    }
    // Initial Seed
    const seedUsers = this.getSeedUsers();
    localStorage.setItem(this.USERS_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  }

  static async addUser(user: User): Promise<void> {
    const users = await this.getUsers();
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    await this.pushToCloud('USER_UPDATE', user);
  }

  static async updateUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      await this.pushToCloud('USER_UPDATE', user);
    }
  }

  static async deleteUser(id: string): Promise<void> {
    const users = await this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(filtered));
    await this.pushToCloud('USER_UPDATE', { deletedId: id });
  }

  private static getSeedUsers(): User[] {
    return [
      {
        id: 't1',
        role: 'Therapist',
        fullName: 'Uzm. Fzt. Erdem Arslan',
        email: 'erdem@physiocore.ai',
        phone: '+90 555 123 45 67',
        avatarUrl: 'https://i.pravatar.cc/150?u=t1',
        createdAt: '2023-01-01',
        therapistProfile: {
          specialization: ['Manuel Terapi', 'Sporcu Sağlığı'],
          bio: '12 yıllık klinik tecrübe, Ortopedik Rehabilitasyon uzmanı.',
          yearsOfExperience: 12,
          successRate: 94.5,
          totalPatientsActive: 12,
          averageRecoveryTime: '4.2 Hafta',
          status: 'Aktif',
          department: 'Ortopedi',
          aiAssistantSettings: { autoSuggestProtocols: true, notifyHighRisk: true, weeklyReports: true }
        }
      },
      {
        id: 'p1',
        role: 'Patient',
        fullName: 'Ahmet Yılmaz',
        email: 'ahmet@email.com',
        phone: '+90 532 999 88 77',
        avatarUrl: 'https://i.pravatar.cc/150?u=p1',
        createdAt: '2024-01-15',
        assignedTherapistId: 't1',
        patientStatus: 'Stabil',
        clinicalProfile: {
            diagnosis: 'L4-L5 Bel Fıtığı',
            riskLevel: 'Orta',
            notes: [],
            treatmentHistory: [],
            painLogs: []
        }
      } as unknown as User 
    ];
  }

  // --- EXISTING METHODS ---

  static getCachedResponse(inputHash: string): any | null {
    try {
      const cache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
      return cache[inputHash] || null;
    } catch { return null; }
  }

  static setCachedResponse(inputHash: string, response: any) {
    try {
      const cache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
      cache[inputHash] = {
        data: response,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    } catch (e) { console.warn("Cache save failed", e); }
  }

  static generateHash(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '').slice(0, 32);
  }

  static async checkRemoteStatus(): Promise<{ connected: boolean; latency: number }> {
    const start = Date.now();
    try {
      const res = await fetch('/api/sync', { method: 'OPTIONS' }).catch(() => null);
      return { connected: !!res, latency: Date.now() - start };
    } catch {
      return { connected: false, latency: 0 };
    }
  }

  private static async pushToCloud(type: 'PROFILE' | 'EXERCISE' | 'STUDIO_UPDATE' | 'USER_UPDATE', data: any): Promise<boolean> {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType: type, payload: data, timestamp: new Date().toISOString() })
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  static async getExercises(): Promise<Exercise[]> {
    const cached = localStorage.getItem(this.EXERCISES_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        localStorage.removeItem(this.EXERCISES_KEY);
      }
    }
    try {
      const { SEED_EXERCISES } = await import('./seed-data.ts');
      localStorage.setItem(this.EXERCISES_KEY, JSON.stringify(SEED_EXERCISES));
      return SEED_EXERCISES;
    } catch (err) {
      console.error("Seed data loading failed:", err);
      return [];
    }
  }

  static async addExercise(exercise: Exercise): Promise<void> {
    const current = await this.getExercises();
    current.push(exercise);
    localStorage.setItem(this.EXERCISES_KEY, JSON.stringify(current));
    await this.pushToCloud('STUDIO_UPDATE', exercise);
  }

  static async updateExercise(exercise: Exercise): Promise<void> {
    const current = await this.getExercises();
    const index = current.findIndex(ex => ex.id === exercise.id);
    if (index !== -1) {
      current[index] = exercise;
      localStorage.setItem(this.EXERCISES_KEY, JSON.stringify(current));
      await this.pushToCloud('STUDIO_UPDATE', exercise);
    }
  }

  static async deleteExercise(id: string): Promise<void> {
    const current = await this.getExercises();
    const filtered = current.filter(ex => ex.id !== id);
    localStorage.setItem(this.EXERCISES_KEY, JSON.stringify(filtered));
    await this.pushToCloud('STUDIO_UPDATE', { deletedId: id });
  }

  static async saveProfile(profile: PatientProfile): Promise<void> {
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
    await this.pushToCloud('PROFILE', profile);
  }

  static getProfile(): PatientProfile | null {
    const saved = localStorage.getItem(this.PROFILE_KEY);
    try {
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  }
}
