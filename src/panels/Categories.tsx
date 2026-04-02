import React from 'react';
import { Div, Button, Card, CardGrid, Text, Title, Group, Spacing } from '@vkontakte/vkui';
import { useGame } from '../store/GameContext';
import { Category } from '../types';
import { questions } from '../data/questions';

interface Props {
  onSelectCategory: () => void;
}

const CATEGORY_INFO = [
  { id: 'food' as const, emoji: '🍔', name: 'Еда', description: 'Завтрак, обед, ужин...' },
  { id: 'people' as const, emoji: '👥', name: 'Люди', description: 'Привычки, характер...' },
  { id: 'animals' as const, emoji: '🐾', name: 'Животные', description: 'Зоопарк, домашние...' },
  { id: 'school' as const, emoji: '📚', name: 'Школа', description: 'Уроки, учителя...' },
  { id: 'work' as const, emoji: '💼', name: 'Работа', description: 'Офис, карьера...' },
  { id: 'love' as const, emoji: '❤️', name: 'Любовь', description: 'Отношения, чувства...' },
];

const Categories: React.FC<Props> = ({ onSelectCategory }) => {
  const { dispatch } = useGame();

  const getCategoryCount = (category: Category) => {
    return questions.filter(q => q.category === category).length;
  };

  const handleSelect = (category: Category) => {
    dispatch({ type: 'SELECT_CATEGORY', category });
    dispatch({ type: 'START_GAME', category });
    onSelectCategory();
  };

  const handleRandom = () => {
    dispatch({ type: 'SELECT_CATEGORY', category: 'food' as Category });
    dispatch({ type: 'START_GAME' });
    onSelectCategory();
  };

  return (
    <Div style={{ paddingBottom: 66 }}>
      <Group header={<Title level="2">Выберите категорию</Title>}>
        <CardGrid size="s">
          {CATEGORY_INFO.map((cat) => {
            const count = getCategoryCount(cat.id);
            return (
              <Card
                key={cat.id}
                mode="shadow"
                onClick={() => handleSelect(cat.id)}
                style={{
                  cursor: 'pointer',
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 40 }}>{cat.emoji}</div>
                  <div>
                    <Title level="3">{cat.name}</Title>
                    <Text style={{ fontSize: 12, color: 'var(--vkui--color_text_secondary)' }}>
                      {cat.description}
                    </Text>
                    <Text style={{ fontSize: 13, marginTop: 4 }}>
                      {count} вопросов
                    </Text>
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
        onClick={handleRandom}
        style={{
          background: 'linear-gradient(135deg, #F5C518 0%, #E3A008 100%)',
          color: '#000',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(227, 160, 8, 0.3)',
        }}
      >
        🎲 Случайная категория
      </Button>
    </Div>
  );
};

export default Categories;
