import { User } from '../types';

const STORAGE_KEY = 'clipboard_data';
const USERS_KEY = 'clipboard_users';
const CURRENT_USER_KEY = 'clipboard_current_user';
const MAX_ITEMS = 1000;

interface SavedContent {
  id: string;
  name: string;
  content: string;
  timestamp: number;
}

export const storage = {
  saveUser(username: string, passwordHash: string): void {
    const users = this.getUsers();
    users[username] = { username, passwordHash };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getUsers(): Record<string, User> {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  },

  getCurrentUser(): User | null {
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    return currentUser ? JSON.parse(currentUser) : null;
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  saveContent(userId: string, contents: SavedContent[]): void {
    const key = `${STORAGE_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(contents.slice(0, MAX_ITEMS)));
  },

  loadContent(userId: string): SavedContent[] {
    const key = `${STORAGE_KEY}_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  clearContent(userId: string): void {
    const key = `${STORAGE_KEY}_${userId}`;
    localStorage.removeItem(key);
  },

  hashPassword(password: string): string {
    return password.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
    }, 0).toString(16);
  }
};