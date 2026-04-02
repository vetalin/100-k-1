// Daily Challenge utility — single daily question for quick engagement

import { Question } from '../types';
import { questions } from '../data/questions';

const STORAGE_KEY_PREFIX = 'daily_done_';

export interface DailyChallengeResult {
  completed: boolean;
  date: string;
  correct: boolean;
  bonus: number;
}

export function getDateKey(): string {
  const now = new Date();
  const msk = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  return msk.toISOString().split('T')[0]; // YYYY-MM-DD
}

export function getStorageKey(userId: number): string {
  return `${STORAGE_KEY_PREFIX}${userId}_${getDateKey()}`;
}

export function isChallengeCompleted(userId: number): Promise<boolean> {
  return new Promise((resolve) => {
    const key = getStorageKey(userId);
    // Use localStorage for quick check (works in VK Mini App webview)
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        resolve(data.completed && data.date === getDateKey());
        return;
      } catch (e) {}
    }
    resolve(false);
  });
}

export function markChallengeCompleted(userId: number, correct: boolean): number {
  const bonus = correct ? 100 : 0;
  const key = getStorageKey(userId);
  const data: DailyChallengeResult = {
    completed: true,
    date: getDateKey(),
    correct,
    bonus,
  };
  localStorage.setItem(key, JSON.stringify(data));
  return bonus;
}

// Get today's daily challenge question (one random question, seeded by date)
export function getDailyChallengeQuestion(): Question {
  const dateKey = getDateKey();
  // Simple seeded selection using date string chars
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = ((hash << 5) - hash) + dateKey.charCodeAt(i);
  }
  const idx = Math.abs(hash) % questions.length;
  return questions[idx];
}
