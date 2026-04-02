import React, { useEffect } from 'react';
import { Div, Button, Card, Text, Title, Group, Spacing, CardGrid } from '@vkontakte/vkui';
import { Icon24CheckCircleOutline, Icon24Cancel } from '@vkontakte/icons';
import bridge, { EAdsFormats } from '@vkontakte/vk-bridge';
import { useGame } from '../store/GameContext';
import { useAchievements } from '../store/AchievementContext';

interface Props {
  onNextRound: () => void;
  onFinalResult: () => void;
}

const RoundResult: React.FC<Props> = ({ onNextRound, onFinalResult }) => {
  const { state, dispatch } = useGame();
  const { checkPerfectRound } = useAchievements();

  useEffect(() => {
    // Check perfect round achievement (5/5 correct)
    if (correctAnswers === totalAnswers && totalAnswers === 5) {
      checkPerfectRound();
    }

    setTimeout(() => {
      bridge.send('VKWebAppShowNativeAds', { ad_format: EAdsFormats.INTERSTITIAL }).catch(() => {});
    }, 1500);
  }, []);

  const correctAnswers = state.userAnswers.filter(a => a.correct).length;
  const totalAnswers = state.userAnswers.length;
  const averagePercent = totalAnswers > 0
    ? Math.round(state.userAnswers.reduce((sum, a) => sum + a.percent, 0) / totalAnswers)
    : 0;

  const handleNext = async () => {
    if (state.currentRound >= state.totalRounds) {
      dispatch({ type: 'END_ROUND' });
      onFinalResult();
    } else {
      dispatch({ type: 'END_ROUND' });
      onNextRound();
    }
  };

  return (
    <Div style={{ paddingBottom: 66 }}>
      <Card mode="shadow" style={{ padding: 24, textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 48 }}>🏆</div>
        <Title level="1" style={{ marginTop: 8 }}>Раунд пройден!</Title>
        <Text
          style={{
            color: '#4BB34A',
            fontSize: 28,
            marginTop: 8,
          }}
        >
          +{state.roundScore} очков
        </Text>
        <Text style={{ color: 'var(--vkui--color_text_secondary)', marginTop: 4 }}>
          Всего: {state.score}
        </Text>
        {state.bestCombo >= 2 && (
          <Text style={{ color: '#FF6B00', marginTop: 8, fontWeight: 700 }}>
            🔥 Лучшее комбо: ×{state.bestCombo}
          </Text>
        )}
      </Card>

      <Card mode="tint" style={{ padding: 16, marginBottom: 16 }}>
        <Group header={<Title level="3">Статистика раунда</Title>}>
          <Div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Icon24CheckCircleOutline style={{ color: '#4BB34A' }} />
                <Text style={{ color: '#4BB34A' }}>{correctAnswers}</Text>
              </div>
              <Text style={{ fontSize: 12 }}>Верных</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Icon24Cancel style={{ color: '#E64646' }} />
                <Text style={{ color: '#E64646' }}>{totalAnswers - correctAnswers}</Text>
              </div>
              <Text style={{ fontSize: 12 }}>Ошибочных</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text>{averagePercent}%</Text>
              <Text style={{ fontSize: 12 }}>Средний %</Text>
            </div>
          </Div>
        </Group>
      </Card>

      <Group header={<Title level="3">Ответы</Title>}>
        <CardGrid size="s">
          {state.roundQuestions.map((q, idx) => {
            const userAnswer = state.userAnswers[idx];
            const isCorrect = userAnswer?.correct;
            return (
              <Card key={q.id} mode="shadow" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13 }}>{q.text}</Text>
                    <Text style={{ marginTop: 4 }}>
                      {userAnswer ? q.answers[userAnswer.answerIndex]?.text || 'Не ответили' : 'Не ответили'}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {userAnswer && (
                      <span style={{
                        background: isCorrect ? '#E8F5E9' : '#FFEBEE',
                        color: isCorrect ? '#4BB34A' : '#E64646',
                        padding: '2px 8px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {userAnswer.percent}%
                      </span>
                    )}
                    <span>{isCorrect ? '✅' : '❌'}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </CardGrid>
      </Group>

      <Spacing size={24} />

      <Button
        size="l"
        stretched
        onClick={handleNext}
        style={{
          background: 'linear-gradient(135deg, #F5C518 0%, #E3A008 100%)',
          color: '#000',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(227, 160, 8, 0.3)',
        }}
      >
        {state.currentRound >= state.totalRounds ? 'Финальный результат' : 'Далее'}
      </Button>
    </Div>
  );
};

export default RoundResult;
