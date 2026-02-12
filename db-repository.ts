
import { Exercise, PatientProfile } from './types.ts';

/**
 * PhysioDB Master Repository v4.5
 * LocalStorage ve Remote API Senkronizasyonu
 */
export class PhysioDB {
  private static STORAGE_KEY = 'physiocore_exercises';
  private static PROFILE_KEY = 'physiocore_patient';
  private static SYNC_STATUS = 'physiocore_sync_meta';

  static async checkRemoteStatus(): Promise<{ connected: boolean; latency: number }> {
    const start = Date.now();
    try {
      // API uç noktasını kontrol et
      const res = await fetch('/api/sync', { method: 'OPTIONS' }).catch(() => null);
      return { connected: !!res, latency: Date.now() - start };
    } catch {
      return { connected: false, latency: 0 };
    }
  }

  static async syncWithRemote(): Promise<boolean> {
    const profile = this.getProfile();
    if (!profile) return false;

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(profile),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        localStorage.setItem(this.SYNC_STATUS, JSON.stringify({ 
          lastSync: new Date().toISOString(),
          status: 'SUCCESS'
        }));
        return true;
      }
    } catch (e) {
      console.error("Sync failed, retrying in background...", e);
    }
    return false;
  }

  static getExercises(): Exercise[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Local DB parse error.");
    }
    return [];
  }

  static addExercise(exercise: Exercise) {
    const current = this.getExercises();
    current.push(exercise);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
  }

  static updateExercise(exercise: Exercise) {
    const current = this.getExercises();
    const index = current.findIndex(ex => ex.id === exercise.id);
    if (index !== -1) {
      current[index] = exercise;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(current));
    }
  }

  static deleteExercise(id: string) {
    const current = this.getExercises();
    const filtered = current.filter(ex => ex.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  static saveProfile(profile: PatientProfile) {
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
    this.syncWithRemote().catch(console.error);
  }

  static getProfile(): PatientProfile | null {
    const saved = localStorage.getItem(this.PROFILE_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  static getLastSync(): string | null {
    const meta = localStorage.getItem(this.SYNC_STATUS);
    return meta ? JSON.parse(meta).lastSync : null;
  }
}
