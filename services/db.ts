
import { UserAccount, SavedPatient } from '../types';

export const DEFAULT_ADMIN: UserAccount = {
  username: 'admin',
  password: '', 
  role: 'admin',
  createdAt: Date.now()
};

export const db = {
  users: {
    getAll: async (): Promise<UserAccount[]> => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('Failed to fetch');
        return await res.json();
      } catch (e) {
        return [DEFAULT_ADMIN];
      }
    },
    add: async (user: UserAccount): Promise<boolean> => {
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        return res.ok;
      } catch (e) {
        return false;
      }
    },
    delete: async (username: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/users/${username}`, { method: 'DELETE' });
        return res.ok;
      } catch (e) {
        return false;
      }
    }
  },
  patients: {
    getAll: async (): Promise<SavedPatient[]> => {
      try {
        const res = await fetch('/api/patients');
        if (!res.ok) throw new Error('Failed to fetch');
        return await res.json();
      } catch (e) {
        return [];
      }
    },
    add: async (patient: SavedPatient) => {
      try {
        await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patient)
        });
      } catch (e) {
        console.error('Failed to save patient', e);
      }
    },
    delete: async (id: string) => {
      try {
        await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      } catch (e) {
        console.error('Failed to delete patient', e);
      }
    }
  }
};
