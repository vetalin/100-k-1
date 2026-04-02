import React, { createContext, useContext, useState, useCallback } from 'react';
import { Quest, DailyQuestState, QuestProgress } from '../types';
import { getDailyQuests, QUEST_POOL } from '../data/quests';

interface QuestContextType {
  dailyQuests: Quest[];
  questState: DailyQuestState;
  updateProgress: (questId: string, newValue: number) => void;
  claimReward: (questId: string) => void;
  initQuests: (streak: number) => void;
}

const today = () => new Date().toISOString().split('T')[0];

const QuestContext = createContext<QuestContextType>({} as QuestContextType);

export function QuestProvider({ children }: { children: React.ReactNode }) {
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [questState, setQuestState] = useState<DailyQuestState>({
    date: '',
    quests: [],
    totalCompleted: 0,
  });

  const initQuests = useCallback((streak: number) => {
    const todayStr = today();
    if (questState.date === todayStr && questState.quests.length > 0) return;

    // Date-based seed so same quests all day
    const dateSeed = parseInt(todayStr.replace(/-/g, ''), 10);
    const quests = getDailyQuests(streak, dateSeed);
    setDailyQuests(quests);
    setQuestState({
      date: todayStr,
      quests: quests.map(q => ({
        questId: q.id,
        progress: 0,
        completed: false,
        rewardClaimed: false,
      })),
      totalCompleted: 0,
    });
  }, [questState.date, questState.quests.length]);

  const updateProgress = useCallback((questId: string, newValue: number) => {
    setQuestState(prev => {
      const idx = prev.quests.findIndex(q => q.questId === questId);
      if (idx === -1) return prev;

      const q = prev.quests[idx];
      if (q.completed) return prev;

      const quest = QUEST_POOL.find(p => p.id === questId);
      if (!quest) return prev;

      const newProgress = Math.max(q.progress, newValue);
      const completed = newProgress >= quest.target;
      const wasCompleted = q.completed;

      const newQuests: QuestProgress[] = prev.quests.map((item, i) =>
        i === idx ? { ...item, progress: newProgress, completed } : item
      );

      return {
        ...prev,
        quests: newQuests,
        totalCompleted: completed && !wasCompleted ? prev.totalCompleted + 1 : prev.totalCompleted,
      };
    });
  }, []);

  const claimReward = useCallback((questId: string) => {
    setQuestState(prev => ({
      ...prev,
      quests: prev.quests.map(q =>
        q.questId === questId ? { ...q, rewardClaimed: true } : q
      ),
    }));
  }, []);

  return (
    <QuestContext.Provider value={{ dailyQuests, questState, updateProgress, claimReward, initQuests }}>
      {children}
    </QuestContext.Provider>
  );
}

export function useQuests() {
  return useContext(QuestContext);
}
