
import { Exercise, PatientProfile } from './types.ts';

/**
 * PhysioCore AI - Smart Persistence & Cost Optimizer (v3.7)
 * Maliyetleri sıfırlamak için "Klinik Önbellek" katmanı eklendi.
 */
export class PhysioDB {
  private static EXERCISES_KEY = 'physiocore_exercises';
  private static PROFILE_KEY = 'physiocore_patient';
  private static CACHE_KEY = 'physiocore_ai_cache'; // AI Yanıtları Önbelleği
  private static SYNC_STATUS_KEY = 'physiocore_sync_meta';

  /**
   * Semantik Önbellek Sorgulama (Maliyet Savunması)
   */
  static getCachedResponse(inputHash: string): any | null {
    const cache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
    return cache[inputHash] || null;
  }

  static setCachedResponse(inputHash: string, response: any) {
    const cache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
    cache[inputHash] = {
      data: response,
      timestamp: Date.now()
    };
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
  }

  /**
   * Basit bir input hash fonksiyonu (Prompt tekrarını önlemek için)
   */
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

  private static async pushToCloud(type: 'PROFILE' | 'EXERCISE' | 'STUDIO_UPDATE', data: any): Promise<boolean> {
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
    let exercises: Exercise[] = cached ? JSON.parse(cached) : [];
    if (exercises.length === 0) {
      const { SEED_EXERCISES } = await import('./seed-data.ts').catch(() => ({ SEED_EXERCISES: [] }));
      exercises = SEED_EXERCISES;
      localStorage.setItem(this.EXERCISES_KEY, JSON.stringify(exercises));
    }
    return exercises;
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
    return saved ? JSON.parse(saved) : null;
  }
}
