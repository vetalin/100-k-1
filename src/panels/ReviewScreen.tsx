import React from 'react';
import { Div, Button, Card, Text, Title, Group, Spacing } from '@vkontakte/vkui';
import { useGame } from '../store/GameContext';

interface Props {
  onBack: () => void;
}

const ReviewScreen: React.FC<Props> = ({ onBack }) => {
  const { state } = useGame();

  const wrongAnswers = state.userAnswers.filter(a => !a.correct);
  const wrongQuestions = wrongAnswers
    .map(a => {
      const q = state.roundQuestions.find(q => q.id === a.questionId)
        ?? state.questions.find(q => q.id === a.questionId);
      return q ? { question: q, chosen: a.answerIndex } : null;
    })
    .filter(Boolean) as { question: NonNullable<typeof state.questions[0]>; chosen: number }[];

  if (wrongQuestions.length === 0) {
    return (
      <Div style={{ paddingBottom: 66, textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 64 }}>🎉</div>
        <Title level="2" style={{ marginTop: 16 }}>Нет ошибок!</Title>
        <Text style={{ color: 'var(--vkui--color_text_secondary)', marginTop: 8 }}>
          Ты ответил на все вопросы правильно.
        </Text>
        <Spacing size={24} />
        <Button size="l" stretched onClick={onBack}>← Назад</Button>
      </Div>
    );
  }

  return (
    <Div style={{ paddingBottom: 66 }}>
      <Div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Button mode="tertiary" onClick={onBack}>← Назад</Button>
        <Title level="2">🔄 Разбор ошибок</Title>
      </Div>
      <Text style={{ color: 'var(--vkui--color_text_secondary)', marginBottom: 16, paddingLeft: 16 }}>
        {wrongQuestions.length} неправильных ответов
      </Text>

      {wrongQuestions.map(({ question, chosen }, idx) => (
        <Group key={question.id} style={{ marginBottom: 16 }}>
          <Card mode="shadow" style={{ padding: 16 }}>
            <Text style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>
              {idx + 1}. {question.text}
            </Text>

            {question.answers.map((answer, i) => {
              const isCorrect = i === 0;
              const wasChosen = i === chosen;

              let bg = 'var(--vkui--color_background_secondary)';
              let border = 'none';
              let emoji = '';
              if (isCorrect) {
                bg = 'rgba(75, 179, 74, 0.15)';
                border = '2px solid #4BB34A';
                emoji = '✅';
              } else if (wasChosen) {
                bg = 'rgba(230, 70, 70, 0.12)';
                border = '2px solid #E64646';
                emoji = '❌';
              }

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    marginBottom: 8,
                    borderRadius: 8,
                    background: bg,
                    border,
                  }}
                >
                  <Text style={{ fontWeight: isCorrect || wasChosen ? 700 : 400 }}>
                    {emoji} {answer.text}
                  </Text>
                  <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: 13 }}>
                    {answer.percent}%
                  </Text>
                </div>
              );
            })}
          </Card>
        </Group>
      ))}

      <Button size="l" stretched onClick={onBack} style={{ marginTop: 8 }}>
        ← Назад к результатам
      </Button>
    </Div>
  );
};

export default ReviewScreen;
