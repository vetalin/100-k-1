import React, { createContext, useContext, useState, ReactNode } from 'react';
import bridge from '@vkontakte/vk-bridge';

export interface VKUser {
  id: number;
  first_name: string;
  last_name: string;
  photo_200: string;
  sex?: number;
  city?: { id: number; title: string };
  country?: { id: number; title: string };
}

export interface UserStats {
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  streak: number;
  lastPlayedDate: string | null;
}

interface UserContextType {
  user: VKUser | null;
  stats: UserStats;
  loading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  updateStats: (updates: Partial<UserStats>) => Promise<void>;
}

const defaultStats: UserStats = {
  gamesPlayed: 0,
  totalScore: 0,
  bestScore: 0,
  streak: 0,
  lastPlayedDate: null,
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<VKUser | null>(null);
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await bridge.send('VKWebAppGetUserInfo');
      setUser(userData);
      await loadStats();
    } catch (e) {
      setError('Failed to load user');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stored = await bridge.send('VKWebAppStorageGet', { keys: ['stats'] });
      if (stored.keys && stored.keys[0] && stored.keys[0].value) {
        const parsed = JSON.parse(stored.keys[0].value);
        setStats(parsed);
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    }
  };

  const updateStats = async (updates: Partial<UserStats>) => {
    const newStats = { ...stats, ...updates };
    setStats(newStats);
    try {
      await bridge.send('VKWebAppStorageSet', {
        key: 'stats',
        value: JSON.stringify(newStats),
      });
    } catch (e) {
      console.error('Failed to save stats:', e);
      localStorage.setItem('100k1_stats', JSON.stringify(newStats));
    }
  };

  return (
    <UserContext.Provider value={{ user, stats, loading, error, fetchUser, updateStats }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
