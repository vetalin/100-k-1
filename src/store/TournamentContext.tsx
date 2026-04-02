import React, { createContext, useContext, useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { useUser } from './UserContext';
import { getWeekKey, isTournamentWeek, TournamentState } from '../utils/tournament';

interface TournamentContextType {
  tournament: TournamentState | null;
  isTournament: boolean;
  multiplier: number;
  addTournamentScore: (points: number) => void;
}

const TournamentContext = createContext<TournamentContextType | null>(null);

export const useTournament = () => {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider');
  return ctx;
};

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const weekKey = getWeekKey();
  const isTournament = isTournamentWeek(weekKey);
  const multiplier = isTournament ? 2 : 1;

  useEffect(() => {
    if (!user) return;
    bridge.send('VKWebAppStorageGet', { keys: [`tournament_${user.id}`] }).then((result: any) => {
      const saved = result.keys?.find((k: any) => k.key === `tournament_${user.id}`)?.value;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.weekKey === weekKey) {
          setTournament(parsed);
        }
      }
    });
  }, [user, weekKey]);

  const addTournamentScore = (points: number) => {
    if (!user || !isTournament) return;
    const newScore = (tournament?.score || 0) + points * 2;
    const newBest = Math.max(tournament?.bestScore || 0, newScore);
    const updated: TournamentState = {
      weekKey,
      score: newScore,
      bestScore: newBest,
      isActive: true,
    };
    setTournament(updated);
    bridge.send('VKWebAppStorageSet', {
      key: `tournament_${user.id}`,
      value: JSON.stringify(updated),
    });
  };

  return (
    <TournamentContext.Provider value={{ tournament, isTournament, multiplier, addTournamentScore }}>
      {children}
    </TournamentContext.Provider>
  );
};
