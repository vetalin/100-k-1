import React, { useState } from 'react';
import { Div, Button, Card, Text, Title, Group, FixedLayout, Spacing } from '@vkontakte/vkui';
import { Question } from '../types/index';
import { useQuests } from '../store/QuestContext';

interface Props {
  questions: Question[];
  onFinish: (correctCount: number) => void;
}

const MiniRoundScreen: React.FC<Props> = ({ questions, onFinish }) => {
  const { updateProgress } = useQuests();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progress = ((currentIndex) / questions.length) * 100;

  const handleAnswer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    if (index === 0) setCorrectCount(c => c + 1);
  };

  const handleNext = () => {
    if (isLast) {
      onFinish(selected === 0 ? correctCount : correctCount);
    } else {
      setCurrentIndex(i => i + 1);
      setSelected(null);
    }
  };

  const handleFinish = () => {
    updateProgress('mini_round', 1);
    onFinish(correctCount);
  };

  return (
    <Div style={{ paddingBottom: 80 }}>
      <FixedLayout vertical="top" style={{ zIndex: 10 }}>
        <Div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', padding: '12px 16px',
          background: 'var(--vkui--color_background)',
        }}>
          <Text weight="3">📚 Мини-раунд</Text>
          <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
            {currentIndex + 1} / {questions.length}
          </Text>
        </Div>
        <div style={{
          height: 4,
          background: 'var(--vkui--color_background_secondary)',
          borderRadius: 2,
          margin: '0 16px 8px',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--vkui--color_accent)',
            borderRadius: 2,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </FixedLayout>

      <Spacing size={72} />

      <Card mode="shadow" style={{ margin: '0 16px 16px', padding: '20px 16px' }}>
        <Title level="2" style={{ textAlign: 'center', lineHeight: '1.4' }}>
          {currentQuestion.text}
        </Title>
      </Card>

      <Group style={{ padding: '0 8px' }}>
        {currentQuestion.answers.map((answer, index) => {
          const isCorrectAnswer = index === 0;
          const isSelected = selected === index;

          let bg = 'var(--vkui--color_background_secondary)';
          let border = '2px solid transparent';
          let textColor = 'inherit';

          if (selected !== null) {
            if (isCorrectAnswer) {
              bg = 'rgba(75, 179, 74, 0.15)';
              border = '2px solid #4BB34A';
              textColor = '#4BB34A';
            } else if (isSelected) {
              bg = 'rgba(230, 70, 70, 0.1)';
              border = '2px solid #E64646';
              textColor = '#E64646';
            }
          }

          return (
            <div
              key={index}
              onClick={() => handleAnswer(index)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                marginBottom: 8,
                borderRadius: 12,
                background: bg,
                border,
                cursor: selected === null ? 'pointer' : 'default',
                transition: 'all 0.25s ease',
              }}
            >
              <Text style={{ fontWeight: isSelected || (selected !== null && isCorrectAnswer) ? 700 : 400, color: textColor }}>
                {selected !== null && isCorrectAnswer ? '✅ ' : ''}
                {selected !== null && isSelected && !isCorrectAnswer ? '❌ ' : ''}
                {answer.text}
              </Text>
              {selected !== null && (
                <Text style={{
                  color: '#fff',
                  background: isCorrectAnswer ? '#4BB34A' : 'var(--vkui--color_text_tertiary)',
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  flexShrink: 0,
                  marginLeft: 8,
                }}>
                  {answer.percent}%
                </Text>
              )}
            </div>
          );
        })}
      </Group>

      {selected !== null && (
        <Div style={{ marginTop: 8 }}>
          <Button size="l" mode="primary" stretched onClick={isLast ? handleFinish : handleNext}>
            {isLast ? '🏁 Завершить' : 'Дальше →'}
          </Button>
        </Div>
      )}
    </Div>
  );
};

export default MiniRoundScreen;
