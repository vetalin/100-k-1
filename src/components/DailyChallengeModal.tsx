import React, { useState, useEffect } from 'react';
import { Div, Button, Card, Text, Title } from '@vkontakte/vkui';

import { playSound } from '../utils/sounds';
import { vibrate } from '../utils/vibration';
import { getDailyChallengeQuestion, markChallengeCompleted } from '../utils/dailyChallenge';
import { useUser } from '../store/UserContext';

interface Props {
  onComplete: (correct: boolean, bonus: number) => void;
  onClose: () => void;
}

const DailyChallengeModal: React.FC<Props> = ({ onComplete, onClose }) => {
  const { user } = useUser();
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [done, setDone] = useState(false);
  const question = getDailyChallengeQuestion();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!revealed && !done) {
            handleTimeout();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [revealed, done]);

  const handleAnswer = (index: number) => {
    if (revealed || done) return;
    setSelected(index);
    setRevealed(true);
    setDone(true);
    const isCorrect = index === 0;
    playSound(isCorrect ? 'correct' : 'wrong');
    vibrate(isCorrect ? 'correct' : 'wrong');

    let bonus = 0;
    if (user) {
      bonus = markChallengeCompleted(user.id, isCorrect);
    }

    setTimeout(() => {
      onComplete(isCorrect, bonus);
    }, 2000);
  };

  const handleTimeout = () => {
    if (done) return;
    setDone(true);
    setRevealed(true);
    setSelected(-1);
    playSound('wrong');
    vibrate('wrong');
    setTimeout(() => {
      onComplete(false, 0);
    }, 2000);
  };

  const handleSkip = () => {
    onClose();
  };

  const isCorrect = selected === 0;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.9)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <Card mode="shadow" style={{ background: 'var(--vkui--color_background)', borderRadius: 20, padding: 0, width: '100%', maxWidth: 400 }}>
        {/* Header */}
        <Div style={{ textAlign: 'center', padding: '20px 24px 8px', background: 'linear-gradient(135deg, #F5C518 0%, #E3A008 100%)', borderRadius: '20px 20px 0 0' }}>
          <Title level="2" style={{ color: '#000' }}>⚡ Ежедневный вызов</Title>
          <Text style={{ color: 'rgba(0,0,0,0.7)', fontSize: 13 }}>1 вопрос + 100 очков бонуса!</Text>
          {!revealed && (
            <div style={{ fontSize: 48, fontWeight: 700, color: timeLeft <= 3 ? '#FF4444' : '#000', marginTop: 8 }}>
              {timeLeft}
            </div>
          )}
          {revealed && (
            <div style={{ fontSize: 36, marginTop: 8 }}>
              {isCorrect ? '✅ Верно!' : '❌ Неверно'}
            </div>
          )}
        </Div>

        {/* Question */}
        <Div style={{ padding: '24px 24px 8px' }}>
          <Title level="3" style={{ textAlign: 'center', marginBottom: 16 }}>
            {question.text}
          </Title>

          {question.answers.slice(0, 4).map((answer, idx) => {
            let bg = 'var(--vkui--color_card_background)';
            let border = '1px solid var(--vkui--color_separator)';
            let textColor = 'var(--vkui--color_text_primary)';

            if (revealed) {
              if (idx === 0) {
                bg = '#4BB34A';
                textColor = '#fff';
              } else if (selected === idx) {
                bg = '#FF4444';
                textColor = '#fff';
              }
            }

            return (
              <Button
                key={idx}
                size="l"
                mode="tertiary"
                stretched
                disabled={revealed}
                onClick={() => handleAnswer(idx)}
                style={{
                  background: bg,
                  border: border,
                  color: textColor,
                  marginBottom: 8,
                  fontWeight: 500,
                  justifyContent: 'flex-start',
                  paddingLeft: 16,
                }}
              >
                {revealed && idx === 0 && <span style={{ marginRight: 8 }}>✓</span>}
                {revealed && selected === idx && idx !== 0 && <span style={{ marginRight: 8 }}>✗</span>}
                {!revealed && <span style={{ marginRight: 8, opacity: 0.5 }}>{idx + 1}.</span>}
                {answer.text}
                {revealed && idx === 0 && (
                  <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{answer.percent}%</span>
                )}
              </Button>
            );
          })}
        </Div>

        {/* Bonus info */}
        {revealed && (
          <Div style={{ padding: '0 24px 16px', textAlign: 'center' }}>
            {isCorrect ? (
              <Text style={{ color: '#4BB34A', fontWeight: 700, fontSize: 16 }}>
                🎁 +100 очков бонуса!
              </Text>
            ) : (
              <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: 14 }}>
                Правильный ответ: {question.answers[0].text} ({question.answers[0].percent}%)
              </Text>
            )}
          </Div>
        )}

        {/* Close */}
        {!revealed && (
          <Div style={{ padding: '0 24px 16px' }}>
            <Button size="l" mode="outline" stretched onClick={handleSkip}>
              Пропустить
            </Button>
          </Div>
        )}
      </Card>
    </div>
  );
};

export default DailyChallengeModal;
