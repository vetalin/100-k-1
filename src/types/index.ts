export type Category = 'food' | 'people' | 'animals' | 'school' | 'work' | 'love';

export type QuestRewardType = 'points' | 'hint' | 'shield';

export interface QuestReward {
  type: QuestRewardType;
  value: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  reward: QuestReward;
  difficulty: 'easy' | 'medium' | 'hard';
  visibleAtStreak?: number;
}

export interface QuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
  rewardClaimed: boolean;
}

export interface DailyQuestState {
  date: string;
  quests: QuestProgress[];
  totalCompleted: number;
}

export interface Answer {
  text: string;
  votes: number;
  percent: number;
  emoji?: string;
}

export interface Question {
  id: number;
  category: Category;
  text: string;
  answers: Answer[];
}

export interface SeasonReward {
  level: number;
  free?: {
    type: 'points' | 'badge' | 'title';
    value: string | number;
  };
  premium?: {
    type: 'avatar' | 'theme' | 'badge' | 'title';
    value: string;
  };
}

export interface Season {
  id: string;
  name: string;
  icon: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  levels: SeasonReward[];
}

export interface SeasonPlayerState {
  seasonId: string;
  xp: number;
  level: number;
  claimedFree: number[];
  claimedPremium: number[];
  hasPremium: boolean;
  purchasedAt?: string;
}
