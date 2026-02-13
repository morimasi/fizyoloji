
import { Exercise, PatientProfile, User } from './types.ts';

export class PhysioDB {
  private static EXERCISES_KEY = 'physiocore_exercises';
  private static PROFILE_KEY = 'physiocore_patient';
  private static USERS_KEY = 'physiocore_users';

  /**
   * Remote status check
   */
  static async checkRemoteStatus(): Promise<{connected: boolean, latency: number}> {
    return { connected: true, latency: 42 };
  }

  /**
   * RPM BRIDGE: Syncs a specific exercise to a patient's mobile device
   */
  static async syncExerciseToMobile(patientId: string, exerciseId: string): Promise<boolean> {
    const profile = this.getProfile();
    if (!profile) return false;

    const exIndex = profile.suggestedPlan.findIndex(ex => ex.id === exerciseId);
    if (exIndex === -1) return false;

    // Simulate Network & Encryption Overhead
    profile.suggestedPlan[exIndex].syncInfo = {
      isSynced: true,
      lastSyncDate: new Date().toISOString(),
      downloadProgress: 100
    };
    
    profile.syncStatus = 'Synced';
    await this.saveProfile(profile);
    
    // Cloud Notification Relay
    return await this.pushToCloud('PROFILE', profile);
  }

  static async getUsers(): Promise<User[]> {
    const cached = localStorage.getItem(this.USERS_KEY);
    return cached ? JSON.parse(cached) : [];
  }

  static async addUser(user: User): Promise<void> {
    const users = await this.getUsers();
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static async deleteUser(id: string): Promise<void> {
    const users = await this.getUsers();
    const updated = users.filter(u => u.id !== id);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(updated));
  }

  static async updateUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  static async saveProfile(profile: PatientProfile): Promise<void> {
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }

  static getProfile(): PatientProfile | null {
    const saved = localStorage.getItem(this.PROFILE_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  static async getExercises(): Promise<Exercise[]> {
    const cached = localStorage.getItem(this.EXERCISES_KEY);
    return cached ? JSON.parse(cached) : [];
  }

  static async addExercise(exercise: Exercise): Promise<void> {
    const current = await this.getExercises();
    current.push(exercise);
    localStorage.setItem(this.EXERCISES_KEY, JSON.stringify(current));
  }

  static async deleteExercise(id: string): Promise<void> {
    const current = await this.getExercises();
    const updated = current.filter(ex => ex.id !== id);
    localStorage.setItem(this.EXERCISES_KEY, JSON.stringify(updated));
  }

  static async updateExercise(exercise: Exercise): Promise<void> {
    const current = await this.getExercises();
    const index = current.findIndex(ex => ex.id === exercise.id);
    if (index !== -1) {
      current[index] = exercise;
      localStorage.setItem(this.EXERCISES_KEY, JSON.stringify(current));
    }
  }

  private static async pushToCloud(type: string, data: any): Promise<boolean> {
    console.log(`[Cloud Sync] Type: ${type}, Data:`, data);
    return true;
  }
}
