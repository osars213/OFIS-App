import { UserProfile } from '../types';
import { DEMO_USERS } from '../mockData';
import { storageService } from './storageService';

const CURRENT_USER_KEY = 'current_user';

export const authService = {
  getCurrentUser(): UserProfile {
    return storageService.getItem<UserProfile>(CURRENT_USER_KEY, DEMO_USERS[0]);
  },

  setCurrentUser(user: UserProfile): void {
    storageService.setItem<UserProfile>(CURRENT_USER_KEY, user);
  },

  signInAs(userId: string): UserProfile {
    const user = DEMO_USERS.find(u => u.id === userId) || DEMO_USERS[0];
    this.setCurrentUser(user);
    return user;
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile {
    const currentUser = this.getCurrentUser();
    const updated = { ...currentUser, ...updates };
    this.setCurrentUser(updated);
    return updated;
  }
};
