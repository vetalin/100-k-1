import React, { useState, useEffect } from 'react';
import { Div, Button, Card, CardGrid, Text, Title, Group, Badge, Spacing, Progress } from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge';
import { useGame } from '../store/GameContext';
import { useUser } from '../store/UserContext';
import { useTournament } from '../store/TournamentContext';
import { getTournamentTimeLeft } from '../utils/tournament';
import {
  CategoryStatsMap,
  getEmptyCategoryStats,
  getStorageKey,
  isWeakCategory,
  isStrongCategory,
} from '../utils/categoryStats';
import { Category } from '../types';

interface Props {
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
}

const CATEGORIES: { id: Category; emoji: string; name: string }[] = [
  { id: 'food', emoji: '🍔', name: 'Еда' },
  { id: 'people', emoji: '👥', name: 'Люди' },
  { id: 'animals', emoji: '🐾', name: 'Животные' },
  { id: 'school', emoji: '📚', name: 'Школа' },
  { id: 'work', emoji: '💼', name: 'Работа' },
  { id: 'love', emoji: '❤️', name: 'Любовь' },
];

const StartScreen: React.FC<Props> = ({ onStartGame, onOpenLeaderboard }) => {
  const { dispatch } = useGame();
  const { user, stats } = useUser();
  const { tournament, isTournament, multiplier } = useTournament();
  const timeLeft = getTournamentTimeLeft();

  const [catStats, setCatStats] = useState<CategoryStatsMap>(getEmptyCategoryStats());

  // Load category stats from VK Storage
  useEffect(() => {
    if (!user) return;
    bridge.send('VKWebAppStorageGet', { keys: [getStorageKey(user.id)] }).then((result: any) => {
      const saved = result.keys?.find((k: any) => k.key === getStorageKey(user.id))?.value;
      if (saved) {
        try {
          setCatStats(JSON.parse(saved));
        } catch (e) {}
      }
    });
  }, [user]);

  const getDayLabel = () => {
    const now = new Date();
    const msk = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
    const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return days[msk.getDay()];
  };

  const handlePlay = () => {
    dispatch({ type: 'START_GAME' });
    onStartGame();
  };

  const handleCategorySelect = (categoryId: Category) => {
    dispatch({ type: 'SELECT_CATEGORY', category: categoryId });
    dispatch({ type: 'START_GAME', category: categoryId });
    onStartGame();
  };

  const hasAnyStats = Object.values(catStats).some(s => s.totalAnswered > 0);

  return (
    <Div style={{ paddingBottom: 66 }}>
      <Card mode="shadow" style={{ marginBottom: 16, textAlign: 'center', padding: 24 }}>
        <Title level="1" style={{ marginBottom: 8 }}>🎯 Угадай популярный ответ!</Title>
        <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
          {getDayLabel()}, новые вопросы!
        </Text>
        {stats.streak > 0 && (
          <div style={{ marginTop: 12 }}>
            <Badge mode="prominent">
              {stats.streak} дней подряд!
            </Badge>
          </div>
        )}
      </Card>

      {isTournament && timeLeft && (
        <Card mode="outline" style={{ border: '2px solid #FFD700', marginBottom: 12, padding: 12, textAlign: 'center' }}>
          <Title level="3">🏆 Недельный турнир</Title>
          <Text>Заканчивается через: {timeLeft.days}д {timeLeft.hours}ч</Text>
          {tournament && <Text>Твой счёт: {tournament.score} ×{multiplier}</Text>}
        </Card>
      )}

      {/* Category Progress — show only if user has stats */}
      {hasAnyStats && (
        <Group header={<Title level="2">📈 Твоя статистика</Title>}>
          <CardGrid size="s" style={{ gap: 8 }}>
            {CATEGORIES.map(cat => {
              const stat = catStats[cat.id];
              const weak = isWeakCategory(stat);
              const strong = isStrongCategory(stat);
              const hasEnough = stat.totalAnswered >= 3;

              return (
                <Card
                  key={cat.id}
                  mode={weak ? 'outline' : 'shadow'}
                  onClick={() => handleCategorySelect(cat.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderColor: weak ? '#FF4444' : strong ? '#44AA44' : undefined,
                    opacity: hasEnough ? 1 : 0.5,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 24 }}>{cat.emoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, fontWeight: 500 }}>{cat.name}</Text>
                        {hasEnough && (
                          <Badge mode={weak ? 'prominent' : undefined} style={{ fontSize: 11 }}>
                            {stat.correctRate}%
                          </Badge>
                        )}
                        {weak && <span style={{ fontSize: 12 }}>📉</span>}
                        {!hasEnough && <Text style={{ fontSize: 11, color: 'var(--vkui--color_text_secondary)' }}>—</Text>}
                      </div>
                      {hasEnough && (
                        <Progress
                          value={stat.correctRate}
                          style={{ marginTop: 4, height: 6 }}
                          className={weak ? undefined : 'vkuiProgress'}
                        />
                      )}
                      {!hasEnough && (
                        <Text style={{ fontSize: 10, color: 'var(--vkui--color_text_secondary)' }}>
                          {stat.totalAnswered}/3 ответов
                        </Text>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </CardGrid>
        </Group>
      )}

      <Spacing size={16} />

      <Group header={<Title level="2">Категории</Title>}>
        <CardGrid size="s">
          {CATEGORIES.map((cat) => (
            <Card
              key={cat.id}
              mode="shadow"
              onClick={() => handleCategorySelect(cat.id)}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                padding: 16,
                minHeight: 80,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 32 }}>{cat.emoji}</div>
              <Text style={{ marginTop: 8 }}>{cat.name}</Text>
              <Text style={{ fontSize: 12, color: 'var(--vkui--color_text_secondary)' }}>
                ?
              </Text>
            </Card>
          ))}
        </CardGrid>
      </Group>

      <Spacing size={16} />

      <Button
        size="l"
        stretched
        onClick={handlePlay}
        style={{
          background: 'linear-gradient(135deg, #F5C518 0%, #E3A008 100%)',
          color: '#000',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(227, 160, 8, 0.3)',
        }}
      >
        🎮 Играть
      </Button>

      <Spacing size={12} />

      <Button size="l" stretched mode="outline" onClick={onOpenLeaderboard}>
        🏆 Таблица лидеров
      </Button>
    </Div>
  );
};

export default StartScreen;
