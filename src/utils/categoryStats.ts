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
