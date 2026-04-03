import bridge from '@vkontakte/vk-bridge';
import React, { useState, useEffect, useMemo } from 'react';
import { Div, Button, Card, Progress, Text, Title, Group, Spacing, FixedLayout } from '@vkontakte/vkui';
import { Icon24LightbulbOutline, Icon24CheckCircleOutline, Icon24Cancel } from '@vkontakte/icons';
import { useGame } from '../store/GameContext';
import { useSettings } from '../store/SettingsContext';
import { useUser } from '../store/UserContext';
import { updateCategoryStats, CategoryStatsMap, pushAnswerHistory } from '../utils/categoryStats';

interface Props {
  onRoundEnd: () => void;
}

const GameScreen: React.FC<Props> = ({ onRoundEnd }) => {
  const { state, dispatch } = useGame();
  const { user } = useUser();
  const { play, vibra } = useSettings();
  const [timer, setTimer] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintBought, setHintBought] = useState(false);

  const currentQuestion = state.roundQuestions[state.currentQuestionIndex];

  // Fisher-Yates shuffle — proper uniform random, not sort()-based (which is broken in v8)
  const shuffledAnswers = useMemo(() => {
    if (!currentQuestion) return [];
    const arr = [...currentQuestion.answers];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
    // Recompute on question index AND id to handle round resets
  }, [state.currentQuestionIndex, currentQuestion?.id]);

  useEffect(() => {
    setTimer(15);
    setSelectedAnswer(null);
    setRevealed(false);
    setShowHint(false);
  }, [state.currentQuestionIndex]);

  useEffect(() => {
    if (timer <= 0 || revealed) return;
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, revealed]);

  const handleTimeout = () => {
    if (!revealed) {
      setRevealed(true);
      dispatch({ type: 'SELECT_ANSWER', answerIndex: -1, isCorrect: false, percent: 0 });
      setTimeout(() => {
        if (state.currentQuestionIndex >= state.questionsPerRound - 1) {
          onRoundEnd();
        } else {
          dispatch({ type: 'NEXT_QUESTION' });
        }
      }, 2000);
    }
  };

  const handleAnswer = (index: number) => {
    if (revealed) return;
    setSelectedAnswer(index);
    setRevealed(true);
    // Correct answer = highest votes in shuffled array
    const maxVotes = Math.max(...currentQuestion.answers.map(a => a.votes));
    const isCorrect = shuffledAnswers[index]?.votes === maxVotes;
    const percent = shuffledAnswers[index]?.percent ?? 0;
    dispatch({ type: 'SELECT_ANSWER', answerIndex: index, isCorrect, percent });
    if (isCorrect) { play('correct'); vibra('correct'); }
    else { play('wrong'); vibra('wrong'); }

    // Save category stats
    if (user && currentQuestion && currentQuestion.category) {
      const correct = shuffledAnswers[index]?.votes === maxVotes;
      const key = `cat_stat_${user.id}`;
      bridge.send('VKWebAppStorageGet', { keys: [key] }).then((result: any) => {
        let stats: CategoryStatsMap;
        try { stats = JSON.parse(result.keys?.[0]?.value || '{}'); }
        catch { stats = {} as CategoryStatsMap; }
        const updated = updateCategoryStats(stats, currentQuestion.category, correct);
        bridge.send('VKWebAppStorageSet', { key, value: JSON.stringify(updated) });
        pushAnswerHistory(user.id, currentQuestion.category, correct);
      }).catch(() => {});
    }

    setTimeout(() => {
      if (state.currentQuestionIndex >= state.questionsPerRound - 1) {
        onRoundEnd();
      } else {
        dispatch({ type: 'NEXT_QUESTION' });
      }
    }, 2500);
  };

  const handleBuyHint = async () => {
    // For demo purposes, just enable hints without payment
    setHintBought(true);
    dispatch({ type: 'BUY_HINTS' });
    setShowHint(true);
  };

  if (!currentQuestion) {
    return <Div>Загрузка...</Div>;
  }

  const progress = ((state.currentQuestionIndex) / state.questionsPerRound) * 100;

  return (
    <Div style={{ paddingBottom: 66 }}>
      <FixedLayout vertical="top" style={{ background: 'var(--vkui--color_background)' }}>
        <Div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎯</span>
            <Text>{state.score}</Text>
            {state.comboCount >= 2 && (
              <span style={{ color: '#FF6B00', fontWeight: 700, fontSize: 14 }}>
                🔥×{state.comboCount}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⏱️</span>
            <Text style={{ color: timer <= 5 ? '#E64646' : undefined }}>
              00:{timer.toString().padStart(2, '0')}
            </Text>
          </div>
        </Div>
      </FixedLayout>

      <Spacing size={56} />

      <Card mode="shadow" style={{ padding: 20, marginBottom: 16 }}>
        <Title level="2" style={{ textAlign: 'center' }}>
          {currentQuestion.text}
        </Title>
      </Card>

      <Progress value={progress} style={{ marginBottom: 16 }} />

      <Text style={{ textAlign: 'center', marginBottom: 16, color: 'var(--vkui--color_text_secondary)' }}>
        Вопрос {state.currentQuestionIndex + 1} из {state.questionsPerRound}
      </Text>

      {/* Max votes = correct answer (answers are sorted by votes in data, but we shuffle display) */}
      {(() => {
        const maxVotes = Math.max(...currentQuestion.answers.map(a => a.votes));
        return (
          <Group>
            {shuffledAnswers.map((answer, index) => {
              const isSelected = selectedAnswer === index;
              const isRevealed = revealed || hintBought;
              const isCorrectAnswer = answer.votes === maxVotes;

              let mode: 'outline' | 'tertiary' = 'outline';
              let background = undefined;
              let borderColor = undefined;

              if (isRevealed) {
                if (isCorrectAnswer) {
                  background = '#E8F5E9';
                  borderColor = '#4BB34A';
                } else if (isSelected) {
                  background = '#FFEBEE';
                  borderColor = '#E64646';
                }
              } else if (answer.percent < 15) {
                mode = 'tertiary';
              }

              return (
                <Div key={index} style={{ padding: '6px 0' }}>
                  <Button
                    size="l"
                    mode={mode}
                    stretched
                    onClick={() => handleAnswer(index)}
                    disabled={revealed}
                    before={
                      !isRevealed && answer.percent < 15 ? (
                        <span>🔒</span>
                      ) : isRevealed && isCorrectAnswer ? (
                        <Icon24CheckCircleOutline style={{ color: '#4BB34A' }} />
                      ) : isRevealed && isSelected ? (
                        <Icon24Cancel style={{ color: '#E64646' }} />
                      ) : undefined
                    }
                    after={
                      isRevealed ? (
                        <span
                          style={{
                            background: isCorrectAnswer ? '#4BB34A' : 'var(--vkui--color_text_secondary)',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {answer.percent}%
                        </span>
                      ) : undefined
                    }
                    style={{
                      background,
                      borderColor,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {answer.text}
                  </Button>
                </Div>
              );
            })}
          </Group>
        );
      })()}


      {!revealed && !hintBought && (
        <Div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button
            mode="tertiary"
            size="l"
            onClick={handleBuyHint}
            before={<Icon24LightbulbOutline />}
          >
            💡 Показать % за 29₽
          </Button>
        </Div>
      )}

      {hintBought && !showHint && (
        <Div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button mode="tertiary" size="l" onClick={() => setShowHint(true)}>
            💡 Показать подсказку
          </Button>
        </Div>
      )}
    </Div>
  );
};

export default GameScreen;
