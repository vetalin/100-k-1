import React, { useState, useEffect } from 'react';
import { Div, Button, Card, Progress, Text, Title, Group, Spacing, FixedLayout } from '@vkontakte/vkui';
import { Icon24LightbulbOutline, Icon24CheckCircleOutline, Icon24Cancel } from '@vkontakte/icons';
import { useGame } from '../store/GameContext';

interface Props {
  onRoundEnd: () => void;
}

const GameScreen: React.FC<Props> = ({ onRoundEnd }) => {
  const { state, dispatch } = useGame();
  const [timer, setTimer] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintBought, setHintBought] = useState(false);

  const currentQuestion = state.roundQuestions[state.currentQuestionIndex];

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
      dispatch({ type: 'SELECT_ANSWER', answerIndex: -1 });
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
    dispatch({ type: 'SELECT_ANSWER', answerIndex: index });

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

      <Group>
        {currentQuestion.answers.map((answer, index) => {
          const isSelected = selectedAnswer === index;
          const isRevealed = revealed || hintBought;
          const isCorrectAnswer = index === 0;

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
          } else if (index > 1) {
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
                  !isRevealed && index > 1 ? (
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
