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
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getQuestionsForRound(category: Category | null, allQuestions: Question[]): Question[] {
  const filtered = category
    ? allQuestions.filter(q => q.category === category)
    : allQuestions;
  return shuffleArray(filtered).slice(0, 5);
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const roundQuestions = getQuestionsForRound(state.selectedCategory, state.questions);
      return {
        ...state,
        currentRound: 1,
        currentQuestionIndex: 0,
        roundScore: 0,
        userAnswers: [],
        hintsBought: false,
        gamePhase: 'playing',
        roundQuestions,
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
      const nextRoundQuestions = getQuestionsForRound(state.selectedCategory, state.questions);
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
