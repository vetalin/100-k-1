import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { Season, SeasonPlayerState } from '../types/index';
import {
  getCurrentSeason,
  getLevelFromXP,
  getXPInCurrentLevel,
  XP_PER_LEVEL,
  MAX_LEVEL,
} from '../data/seasons';
import { useUser } from './UserContext';

interface SeasonContextType {
  currentSeason: Season | null;
  seasonState: SeasonPlayerState | null;
  currentLevel: number;
  xpInCurrentLevel: number;
  addXP: (xp: number) => void;
  claimReward: (level: number, track: 'free' | 'premium') => void;
  buyPremium: () => Promise<void>;
}

const SeasonContext = createContext<SeasonContextType>({} as SeasonContextType);

export function useSeason() {
  return useContext(SeasonContext);
}

const APP_ID = 0; // Replace with real app ID

function storageKey(userId: number, seasonId: string) {
  return `season_${userId}_${seasonId}`;
}

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [seasonState, setSeasonState] = useState<SeasonPlayerState | null>(null);
  const currentSeason = getCurrentSeason();

  // Load from VK Storage
  useEffect(() => {
    if (!user || !currentSeason) return;
    const key = storageKey(user.id, currentSeason.id);
    bridge.send('VKWebAppStorageGet', { keys: [key] }).then((res: any) => {
      const raw = res?.keys?.[0]?.value;
      if (raw) {
        try {
          const parsed: SeasonPlayerState = JSON.parse(raw);
          if (parsed.seasonId === currentSeason.id) {
            setSeasonState(parsed);
            return;
          }
        } catch {}
      }
      // Fresh state
      setSeasonState({
        seasonId: currentSeason.id,
        xp: 0,
        level: 0,
        claimedFree: [],
        claimedPremium: [],
        hasPremium: false,
      });
    }).catch(() => {
      setSeasonState({
        seasonId: currentSeason?.id ?? '',
        xp: 0,
        level: 0,
        claimedFree: [],
        claimedPremium: [],
        hasPremium: false,
      });
    });
  }, [user?.id, currentSeason?.id]);

  const save = useCallback((state: SeasonPlayerState) => {
    if (!user || !currentSeason) return;
    const key = storageKey(user.id, currentSeason.id);
    bridge.send('VKWebAppStorageSet', { key, value: JSON.stringify(state) }).catch(() => {});
    setSeasonState(state);
  }, [user?.id, currentSeason?.id]);

  const addXP = useCallback((xp: number) => {
    if (!seasonState) return;
    const newXP = Math.min(seasonState.xp + xp, MAX_LEVEL * XP_PER_LEVEL);
    const newLevel = getLevelFromXP(newXP);
    save({ ...seasonState, xp: newXP, level: newLevel });
  }, [seasonState, save]);

  const claimReward = useCallback((level: number, track: 'free' | 'premium') => {
    if (!seasonState) return;
    if (track === 'free') {
      if (seasonState.claimedFree.includes(level)) return;
      save({ ...seasonState, claimedFree: [...seasonState.claimedFree, level] });
    } else {
      if (!seasonState.hasPremium || seasonState.claimedPremium.includes(level)) return;
      save({ ...seasonState, claimedPremium: [...seasonState.claimedPremium, level] });
    }
  }, [seasonState, save]);

  const buyPremium = useCallback(async () => {
    if (!seasonState || seasonState.hasPremium) return;
    try {
      await (bridge as any).send('VKWebAppOpenPayForm', {
        app_id: APP_ID,
        action: 'pay-to-app',
        params: {
          amount: 99,
          description: `Season Pass: ${currentSeason?.name ?? 'Сезон'}`,
        },
      });
      save({ ...seasonState, hasPremium: true, purchasedAt: new Date().toISOString() });
    } catch {
      // Cancelled / error — ignore
    }
  }, [seasonState, currentSeason, save]);

  const currentLevel = seasonState ? getLevelFromXP(seasonState.xp) : 0;
  const xpInLevel = seasonState ? getXPInCurrentLevel(seasonState.xp) : 0;

  return (
    <SeasonContext.Provider value={{
      currentSeason,
      seasonState,
      currentLevel,
      xpInCurrentLevel: xpInLevel,
      addXP,
      claimReward,
      buyPremium,
    }}>
      {children}
    </SeasonContext.Provider>
  );
}
