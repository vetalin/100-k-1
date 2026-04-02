import React from 'react';
import { Div, Button, Card, CardGrid, Text, Title, Group, Badge, Spacing } from '@vkontakte/vkui';
import { useGame } from '../store/GameContext';
import { useUser } from '../store/UserContext';

interface Props {
  onStartGame: () => void;
  onOpenCategories: () => void;
}

const CATEGORIES = [
  { id: 'food' as const, emoji: '🍔', name: 'Еда', count: 20 },
  { id: 'people' as const, emoji: '👥', name: 'Люди', count: 20 },
  { id: 'animals' as const, emoji: '🐾', name: 'Животные', count: 20 },
  { id: 'school' as const, emoji: '📚', name: 'Школа', count: 17 },
  { id: 'work' as const, emoji: '💼', name: 'Работа', count: 14 },
  { id: 'love' as const, emoji: '❤️', name: 'Любовь', count: 10 },
];

const StartScreen: React.FC<Props> = ({ onStartGame, onOpenCategories }) => {
  const { dispatch } = useGame();
  const { stats } = useUser();

  const handlePlay = () => {
    dispatch({ type: 'START_GAME' });
    onStartGame();
  };

  const handleCategorySelect = (categoryId: 'food' | 'people' | 'animals' | 'school' | 'work' | 'love') => {
    dispatch({ type: 'SELECT_CATEGORY', category: categoryId });
    dispatch({ type: 'START_GAME', category: categoryId });
    onStartGame();
  };

  return (
    <Div style={{ paddingBottom: 66 }}>
      <Card mode="shadow" style={{ marginBottom: 16, textAlign: 'center', padding: 24 }}>
        <Title level="1" style={{ marginBottom: 8 }}>🎯 Угадай популярный ответ!</Title>
        <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
          Проверь свою интуицию в викторине 100 к 1
        </Text>
        {stats.streak > 0 && (
          <div style={{ marginTop: 12 }}>
            <Badge mode="prominent">
              {stats.streak} дней подряд!
            </Badge>
          </div>
        )}
      </Card>

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
                {cat.count} ?
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

      <Button size="l" stretched mode="outline" onClick={onOpenCategories}>
        📋 Все категории
      </Button>
    </Div>
  );
};

export default StartScreen;
