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
