import { Season, SeasonReward } from '../types/index';

export const SEASON_LEVELS: SeasonReward[] = [
  { level: 1,  free: { type: 'badge',  value: 'Новичок сезона' },     premium: { type: 'avatar', value: 'Аватар «Весна»' } },
  { level: 5,  free: { type: 'points', value: 100 },                   premium: { type: 'badge',  value: 'Исследователь' } },
  { level: 10, free: { type: 'badge',  value: 'Знаток' },              premium: { type: 'theme',  value: 'Тема «Золото»' } },
  { level: 15, free: { type: 'title',  value: 'Эрудит' },              premium: { type: 'badge',  value: 'Штудиоз' } },
  { level: 20, free: { type: 'points', value: 200 },                   premium: { type: 'avatar', value: 'Аватар «Золото»' } },
  { level: 25, free: { type: 'badge',  value: 'Постоянный игрок' },   premium: { type: 'badge',  value: 'Ветеран' } },
  { level: 30, free: { type: 'title',  value: 'Знаток' },              premium: { type: 'theme',  value: 'Тема «Кристалл»' } },
  { level: 40, free: { type: 'points', value: 300 },                   premium: { type: 'badge',  value: 'Чемпион сезона' } },
  { level: 50, free: { type: 'badge',  value: 'Легенда сезона' },      premium: { type: 'title',  value: 'Сезонный мастер' } },
];

export const SEASONS: Season[] = [
  {
    id: 'season_1_spring_2026',
    name: 'Вопросы Весны',
    icon: '🌸',
    startDate: '2026-04-01',
    endDate: '2026-04-28',
    durationDays: 28,
    levels: SEASON_LEVELS,
  },
];

export const XP_PER_LEVEL = 100;
export const MAX_LEVEL = 50;

export function getCurrentSeason(): Season | null {
  const now = new Date();
  for (const season of SEASONS) {
    const start = new Date(season.startDate);
    const end = new Date(season.endDate);
    end.setHours(23, 59, 59, 999);
    if (now >= start && now <= end) return season;
  }
  // During development, always return first season
  return SEASONS[0] ?? null;
}

export function getDaysLeft(season: Season): number {
  const now = new Date();
  const end = new Date(season.endDate);
  end.setHours(23, 59, 59, 999);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getLevelFromXP(xp: number): number {
  return Math.min(MAX_LEVEL, Math.floor(xp / XP_PER_LEVEL));
}

export function getXPInCurrentLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}
