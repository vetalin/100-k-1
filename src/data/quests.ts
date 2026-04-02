import { Quest } from '../types';

export const QUEST_POOL: Quest[] = [
  {
    id: 'play_2_rounds',
    title: 'Сыграй 2 раунда',
    description: 'Пройди два полных раунда сегодня',
    icon: '🎮',
    target: 2,
    reward: { type: 'points', value: 50 },
    difficulty: 'easy',
  },
  {
    id: 'accuracy_70',
    title: '70% точность',
    description: 'Достигни 70% правильных ответов в одном раунде',
    icon: '🎯',
    target: 1,
    reward: { type: 'hint', value: 1 },
    difficulty: 'medium',
  },
  {
    id: 'combo_3',
    title: '3 правильных подряд',
    description: 'Ответь правильно на 3 вопроса без ошибки',
    icon: '🔥',
    target: 3,
    reward: { type: 'hint', value: 1 },
    difficulty: 'easy',
  },
  {
    id: 'mini_round',
    title: 'Повторение',
    description: 'Пройди мини-раунд (разбор ошибок)',
    icon: '🔄',
    target: 1,
    reward: { type: 'hint', value: 1 },
    difficulty: 'easy',
  },
  {
    id: 'share_stories',
    title: 'Поделись в Stories',
    description: 'Покажи результат игры в VK Stories',
    icon: '📱',
    target: 1,
    reward: { type: 'points', value: 50 },
    difficulty: 'easy',
  },
  {
    id: 'streak_3',
    title: 'Streak 3 дня',
    description: 'Поддерживай streak минимум 3 дня',
    icon: '⭐',
    target: 3,
    reward: { type: 'shield', value: 1 },
    difficulty: 'medium',
  },
  {
    id: 'round_1000_score',
    title: '1000 очков за раунд',
    description: 'Набери 1000 или больше очков за один раунд',
    icon: '💰',
    target: 1,
    reward: { type: 'points', value: 100 },
    difficulty: 'medium',
  },
  {
    id: 'new_category',
    title: 'Новая категория',
    description: 'Сыграй в категории, которую ещё не выбирал',
    icon: '📚',
    target: 1,
    reward: { type: 'points', value: 25 },
    difficulty: 'easy',
  },
  {
    id: 'play_3_rounds',
    title: 'Сыграй 3 раунда',
    description: 'Пройди три полных раунда сегодня',
    icon: '🏃',
    target: 3,
    reward: { type: 'points', value: 75 },
    difficulty: 'medium',
  },
  {
    id: 'weekly_tournament',
    title: 'Войди в топ 3 недели',
    description: 'Займи призовое место в Weekly Tournament',
    icon: '👑',
    target: 1,
    reward: { type: 'points', value: 200 },
    difficulty: 'hard',
    visibleAtStreak: 7,
  },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function getDailyQuests(streak: number, dateSeed: number): Quest[] {
  const available = QUEST_POOL.filter(q => !q.visibleAtStreak || streak >= q.visibleAtStreak);
  const rand = seededRandom(dateSeed);

  // Ensure mix: at least 2 easy
  const easy = available.filter(q => q.difficulty === 'easy');
  const medium = available.filter(q => q.difficulty === 'medium');
  const hard = available.filter(q => q.difficulty === 'hard');

  const shuffle = (arr: Quest[]) => [...arr].sort(() => rand() - 0.5);

  const picked: Quest[] = [];
  const shuffledEasy = shuffle(easy);
  const shuffledMedium = shuffle(medium);
  const shuffledHard = shuffle(hard);

  // 2 easy, 2 medium, 1 hard (or fallback)
  picked.push(...shuffledEasy.slice(0, 2));
  picked.push(...shuffledMedium.slice(0, 2));
  if (shuffledHard.length > 0) {
    picked.push(shuffledHard[0]);
  } else {
    picked.push(...shuffledEasy.slice(2, 3));
  }

  return picked.slice(0, 5);
}
