export type Category = 'food' | 'people' | 'animals' | 'school' | 'work' | 'love';

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
