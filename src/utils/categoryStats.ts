import { Category } from '../types';

export interface CategoryStat {
  category: Category;
  totalAnswered: number;
  totalCorrect: number;
  correctRate: number; // 0-100
}

export type CategoryStatsMap = Record<Category, CategoryStat>;

const STORAGE_KEY_PREFIX = 'cat_stat_';
const MIN_ANSWERS_THRESHOLD = 3;

export function getEmptyCategoryStats(): CategoryStatsMap {
  return {
    food: { category: 'food', totalAnswered: 0, totalCorrect: 0, correctRate: 0 },
    people: { category: 'people', totalAnswered: 0, totalCorrect: 0, correctRate: 0 },
    animals: { category: 'animals', totalAnswered: 0, totalCorrect: 0, correctRate: 0 },
    school: { category: 'school', totalAnswered: 0, totalCorrect: 0, correctRate: 0 },
    work: { category: 'work', totalAnswered: 0, totalCorrect: 0, correctRate: 0 },
    love: { category: 'love', totalAnswered: 0, totalCorrect: 0, correctRate: 0 },
  };
}

export function calculateCorrectRate(stat: CategoryStat): number {
  if (stat.totalAnswered === 0) return 0;
  return Math.round((stat.totalCorrect / stat.totalAnswered) * 100);
}

export function updateCategoryStats(
  stats: CategoryStatsMap,
  category: Category,
  correct: boolean
): CategoryStatsMap {
  const updated = { ...stats };
  const current = { ...updated[category] };
  current.totalAnswered += 1;
  if (correct) current.totalCorrect += 1;
  current.correctRate = calculateCorrectRate(current);
  updated[category] = current;
  return updated;
}

export function isWeakCategory(stat: CategoryStat): boolean {
  return stat.totalAnswered >= MIN_ANSWERS_THRESHOLD && stat.correctRate < 60;
}

export function isStrongCategory(stat: CategoryStat): boolean {
  return stat.totalAnswered >= MIN_ANSWERS_THRESHOLD && stat.correctRate >= 80;
}

export function getWeakCategories(stats: CategoryStatsMap): Category[] {
  return (Object.values(stats) as CategoryStat[])
    .filter(isWeakCategory)
    .sort((a, b) => a.correctRate - b.correctRate)
    .map(s => s.category);
}

export function getCategoryEmoji(category: Category): string {
  const map: Record<Category, string> = {
    food: '🍔',
    people: '👥',
    animals: '🐾',
    school: '📚',
    work: '💼',
    love: '❤️',
  };
  return map[category] || '❓';
}

export function getCategoryName(category: Category): string {
  const map: Record<Category, string> = {
    food: 'Еда',
    people: 'Люди',
    animals: 'Животные',
    school: 'Школа',
    work: 'Работа',
    love: 'Любовь',
  };
  return map[category] || category;
}

export function getStorageKey(userId: number): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

export type TrendDirection = 'improving' | 'declining' | 'stable';

export interface WeakCategoryInfo {
  category: Category;
  accuracy: number;         // 0-100
  totalAnswered: number;
  trend: TrendDirection;
  emoji: string;
  name: string;
}

const HISTORY_KEY_PREFIX = 'cat_hist_';
const HISTORY_LENGTH = 10;
const WEAK_THRESHOLD = 65;
const MIN_ANSWERS_FOR_TREND = 4;

export function getHistoryStorageKey(userId: number, category: Category): string {
  return `${HISTORY_KEY_PREFIX}${category}_${userId}`;
}

export function pushAnswerHistory(userId: number, category: Category, correct: boolean): void {
  try {
    const key = getHistoryStorageKey(userId, category);
    const raw = localStorage.getItem(key);
    const history: boolean[] = raw ? JSON.parse(raw) : [];
    history.push(correct);
    if (history.length > HISTORY_LENGTH) history.shift();
    localStorage.setItem(key, JSON.stringify(history));
  } catch {}
}

export function getCategoryTrend(userId: number, category: Category): TrendDirection {
  try {
    const key = getHistoryStorageKey(userId, category);
    const raw = localStorage.getItem(key);
    if (!raw) return 'stable';
    const history: boolean[] = JSON.parse(raw);
    if (history.length < MIN_ANSWERS_FOR_TREND) return 'stable';

    const half = Math.floor(history.length / 2);
    const recent = history.slice(-half);
    const older = history.slice(0, half);

    const avgRecent = recent.filter(Boolean).length / recent.length;
    const avgOlder = older.filter(Boolean).length / older.length;

    const diff = avgRecent - avgOlder;
    if (diff > 0.1) return 'improving';
    if (diff < -0.1) return 'declining';
    return 'stable';
  } catch {
    return 'stable';
  }
}

export function getWeakCategoryInfos(
  stats: CategoryStatsMap,
  userId: number
): WeakCategoryInfo[] {
  return (Object.values(stats) as CategoryStat[])
    .filter(s => s.totalAnswered >= 5 && s.correctRate < WEAK_THRESHOLD)
    .sort((a, b) => a.correctRate - b.correctRate)
    .slice(0, 2)
    .map(s => ({
      category: s.category,
      accuracy: s.correctRate,
      totalAnswered: s.totalAnswered,
      trend: getCategoryTrend(userId, s.category),
      emoji: getCategoryEmoji(s.category),
      name: getCategoryName(s.category),
    }));
}

export function getStrongCategories(stats: CategoryStatsMap): Category[] {
  return (Object.values(stats) as CategoryStat[])
    .filter(isStrongCategory)
    .sort((a, b) => b.correctRate - a.correctRate)
    .map(s => s.category);
}
