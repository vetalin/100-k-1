import React, { useState, useEffect } from 'react';
import { Div, Button, Card, Text, Title } from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge';

interface OnboardingStep {
  title: string;
  description: string;
  emoji: string;
}

const STEPS: OnboardingStep[] = [
  {
    title: 'Добро пожаловать!',
    description: '100 к 1 — викторина, где нужно угадывать самые популярные ответы. Отвечай так, как думают большинство!',
    emoji: '🎯',
  },
  {
    title: 'Как играть',
    description: 'На каждый вопрос — 6 вариантов ответа. Самый популярный — на первом месте. Угадал? Получи очки!',
    emoji: '✅',
  },
  {
    title: 'Играй каждый день',
    description: '🔥 Новые вопросы каждый день! Соревнуйся с друзьями в рейтинге и открывай достижения.',
    emoji: '🔥',
  },
  {
    title: 'Готов?',
    description: '👑 Ставь рекорды, участвуй в турнирах и стань лучшим! Удачи!',
    emoji: '👑',
  },
];

const STORAGE_KEY = 'onboarding_completed';

interface Props {
  onComplete: () => void;
}

const OnboardingGuide: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if already shown
    bridge.send('VKWebAppStorageGet', { keys: [STORAGE_KEY] }).then((result: any) => {
      const completed = result.keys?.find((k: any) => k.key === STORAGE_KEY)?.value;
      if (completed === 'true') {
        setIsVisible(false);
        onComplete();
      }
    });
  }, [onComplete]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Complete
      bridge.send('VKWebAppStorageSet', { key: STORAGE_KEY, value: 'true' });
      setIsVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    bridge.send('VKWebAppStorageSet', { key: STORAGE_KEY, value: 'true' });
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const current = STEPS[step];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Card
        mode="shadow"
        style={{
          background: 'var(--vkui--color_background)',
          padding: 0,
          borderRadius: 20,
          maxWidth: 400,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: 13 }}>
            {step + 1} / {STEPS.length}
          </Text>
          <Button
            onClick={handleSkip}
            appearance="neutral"
            size="s"
            style={{ color: 'var(--vkui--color_text_secondary)' }}
          >
            Пропустить
          </Button>
        </div>

        {/* Content */}
        <Div style={{ textAlign: 'center', padding: '24px 24px 16px' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>{current.emoji}</div>
          <Title level="2" style={{ marginBottom: 12 }}>{current.title}</Title>
          <Text style={{ color: 'var(--vkui--color_text_secondary)', lineHeight: 1.5 }}>
            {current.description}
          </Text>
        </Div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '0 0 16px' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === step ? '#FFD700' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Button */}
        <Div style={{ padding: '0 24px 24px' }}>
          <Button
            size="l"
            stretched
            onClick={handleNext}
            style={{
              background: 'linear-gradient(135deg, #F5C518 0%, #E3A008 100%)',
              color: '#000',
              fontWeight: 700,
            }}
          >
            {step < STEPS.length - 1 ? 'Далее →' : 'Начать! 🎮'}
          </Button>
        </Div>
      </Card>
    </div>
  );
};

export default OnboardingGuide;
