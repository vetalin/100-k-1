import React, { createContext, useContext, useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { useUser } from './UserContext';

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
  unlockedAt: string | null; // ISO date or null (locked)
}

interface AchievementContextType {
  achievements: Achievement[];
  unlockedCount: number;
  checkAndUnlock: (stats: any) => void;
  checkPerfectRound: () => void;
  checkCategoryMaster: (correctInCategory: number) => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_game', emoji: '🌟', title: 'Первая игра', description: 'Сыграй первую игру', unlockedAt: null },
  { id: 'streak_3', emoji: '🔥', title: '3 дня подряд', description: 'Играй 3 дня подряд', unlockedAt: null },
  { id: 'streak_7', emoji: '💥', title: 'Неделя подряд', description: 'Играй 7 дней подряд', unlockedAt: null },
  { id: 'score_1000', emoji: '👑', title: '1000 очков', description: 'Набери 1000 очков', unlockedAt: null },
  { id: 'score_5000', emoji: '🏅', title: '5000 очков', description: 'Набери 5000 очков', unlockedAt: null },
  { id: 'perfect_round', emoji: '💯', title: 'Идеальный раунд', description: '5/5 верных за раунд', unlockedAt: null },
  { id: 'category_master', emoji: '🎓', title: 'Знаток категории', description: '10 верных в одной категории', unlockedAt: null },
  { id: 'top_1', emoji: '🥇', title: '#1 в рейтинге', description: 'Займи 1 место среди друзей', unlockedAt: null },
  { id: 'tournament_top_3', emoji: '🎖', title: 'Топ-3 турнира', description: 'Займи 3 место в турнире', unlockedAt: null },
  { id: 'tournament_winner', emoji: '🏆', title: 'Победитель турнира', description: 'Займи 1 место в турнире', unlockedAt: null },
];

const AchievementContext = createContext<AchievementContextType | null>(null);

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) throw new Error('useAchievements must be used within AchievementProvider');
  return context;
};

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const { user } = useUser();

  // Load achievements on init
  useEffect(() => {
    if (!user) return;
    bridge.send('VKWebAppStorageGet', { keys: ['achievements'] }).then((result: any) => {
      const saved = result.keys?.find((k: any) => k.key === 'achievements')?.value;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setAchievements(prev => prev.map(a => parsed[a.id] ? { ...a, unlockedAt: parsed[a.id] } : a));
        } catch (e) {
          // ignore parse errors
        }
      }
    }).catch(() => {});
  }, [user]);

  const saveAchievements = (achs: Achievement[]) => {
    if (!user) return;
    const obj: Record<string, string> = {};
    achs.forEach(a => { if (a.unlockedAt) obj[a.id] = a.unlockedAt; });
    bridge.send('VKWebAppStorageSet', { key: 'achievements', value: JSON.stringify(obj) }).catch(() => {});
  };

  const checkAndUnlock = (stats: any) => {
    setAchievements(prev => {
      let changed = false;
      const next = prev.map(a => {
        if (a.unlockedAt) return a; // already unlocked

        let unlocked = false;
        switch (a.id) {
          case 'first_game':
            unlocked = (stats.gamesPlayed || 0) >= 1;
            break;
          case 'streak_3':
            unlocked = (stats.streak || 0) >= 3;
            break;
          case 'streak_7':
            unlocked = (stats.streak || 0) >= 7;
            break;
          case 'score_1000':
            unlocked = (stats.bestScore || 0) >= 1000;
            break;
          case 'score_5000':
            unlocked = (stats.bestScore || 0) >= 5000;
            break;
          case 'tournament_top_3':
            unlocked = (stats as any).tournamentPlace !== undefined && (stats as any).tournamentPlace <= 3;
            break;
          case 'tournament_winner':
            unlocked = (stats as any).tournamentPlace === 1;
            break;
          // perfect_round and top_1 handled separately
        }

        if (unlocked) {
          changed = true;
          return { ...a, unlockedAt: new Date().toISOString() };
        }
        return a;
      });

      if (changed) {
        saveAchievements(next);
      }
      return next;
    });
  };

  const checkPerfectRound = () => {
    setAchievements(prev => {
      const idx = prev.findIndex(a => a.id === 'perfect_round');
      if (idx === -1 || prev[idx].unlockedAt) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], unlockedAt: new Date().toISOString() };
      saveAchievements(next);
      return next;
    });
  };

  const checkCategoryMaster = (correctInCategory: number) => {
    if (correctInCategory < 10) return;
    setAchievements(prev => {
      const idx = prev.findIndex(a => a.id === 'category_master');
      if (idx === -1 || prev[idx].unlockedAt) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], unlockedAt: new Date().toISOString() };
      saveAchievements(next);
      return next;
    });
  };

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  return (
    <AchievementContext.Provider value={{ achievements, unlockedCount, checkAndUnlock, checkPerfectRound, checkCategoryMaster }}>
      {children}
    </AchievementContext.Provider>
  );
};
