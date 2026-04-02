import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { questions } from '../data/questions';
import { Question, Category } from '../types';


export interface GameState {
  currentRound: number;
  totalRounds: number;
  questionsPerRound: number;
  currentQuestionIndex: number;
  score: number;
  roundScore: number;
  streak: number;
  selectedCategory: Category | null;
  questions: Question[];
  roundQuestions: Question[];
  userAnswers: { questionId: number; answerIndex: number; correct: boolean; percent: number }[];
  hintsBought: boolean;
  gamePhase: 'idle' | 'playing' | 'revealing' | 'round_end' | 'game_end';
  dateSeed: number;
}

type GameAction =
  | { type: 'START_GAME'; category?: Category }
  | { type: 'SELECT_ANSWER'; answerIndex: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'NEXT_ROUND' }
  | { type: 'END_ROUND' }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME' }
  | { type: 'BUY_HINTS' }
  | { type: 'SELECT_CATEGORY'; category: Category }
  | { type: 'SET_QUESTIONS'; questions: Question[] };

const initialState: GameState = {
  currentRound: 1,
  totalRounds: 4,
  questionsPerRound: 5,
  currentQuestionIndex: 0,
  score: 0,
  roundScore: 0,
  streak: 0,
  selectedCategory: null,
  questions: questions,
  roundQuestions: [],
  userAnswers: [],
  hintsBought: false,
  gamePhase: 'idle',
  dateSeed: 0,
};

// Seeded PRNG (djb2 hash + linear congruential generator)
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function seededShuffle<T>(array: T[], seed: number): T[] {
  const rng = seededRandom(seed);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getDateSeed(): number {
  const now = new Date();
  const mskDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  const dateStr = mskDate.toISOString().split('T')[0];
  let hash = 5381;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) + hash) + dateStr.charCodeAt(i);
  }
  return Math.abs(hash);
}

function getQuestionsForRound(category: Category | null, allQuestions: Question[], seed: number): Question[] {
  const filtered = category
    ? allQuestions.filter(q => q.category === category)
    : allQuestions;
  return seededShuffle(filtered, seed).slice(0, 5);
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const category = action.category ?? state.selectedCategory;
      const todaySeed = getDateSeed();
      const roundQuestions = getQuestionsForRound(category, state.questions, todaySeed);
      return {
        ...state,
        currentRound: 1,
        currentQuestionIndex: 0,
        roundScore: 0,
        userAnswers: [],
        hintsBought: false,
        gamePhase: 'playing',
        roundQuestions,
        dateSeed: todaySeed,
      };
    }
    case 'SELECT_CATEGORY':
      return { ...state, selectedCategory: action.category };
    case 'SELECT_ANSWER': {
      const currentQuestion = state.roundQuestions[state.currentQuestionIndex];
      if (!currentQuestion) return state;
      const selectedAnswer = currentQuestion.answers[action.answerIndex];
      const isCorrect = action.answerIndex === 0;
      const pointsEarned = isCorrect ? selectedAnswer.percent : 0;
      return {
        ...state,
        score: state.score + pointsEarned,
        roundScore: state.roundScore + pointsEarned,
        hintsBought: false,
        gamePhase: 'revealing',
        userAnswers: [
          ...state.userAnswers,
          { questionId: currentQuestion.id, answerIndex: action.answerIndex, correct: isCorrect, percent: selectedAnswer.percent },
        ],
      };
    }
    case 'NEXT_QUESTION': {
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex >= state.questionsPerRound) {
        return { ...state, gamePhase: 'round_end' };
      }
      return { ...state, currentQuestionIndex: nextIndex, gamePhase: 'playing' };
    }
    case 'END_ROUND': {
      const nextRound = state.currentRound + 1;
      if (nextRound > state.totalRounds) {
        return { ...state, gamePhase: 'game_end' };
      }
      const nextRoundQuestions = getQuestionsForRound(state.selectedCategory, state.questions, state.dateSeed);
      return {
        ...state,
        currentRound: nextRound,
        currentQuestionIndex: 0,
        roundScore: 0,
        userAnswers: [],
        hintsBought: false,
        gamePhase: 'playing',
        roundQuestions: nextRoundQuestions,
      };
    }
    case 'END_GAME':
      return { ...state, gamePhase: 'game_end' };
    case 'RESET_GAME':
      return { ...initialState, questions: state.questions };
    case 'BUY_HINTS':
      return { ...state, hintsBought: true };
    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
