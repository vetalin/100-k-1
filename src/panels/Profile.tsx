import React from 'react';
import { Div, Card, Avatar, Text, Title, Group, Spacing, Button, Snackbar, Badge } from '@vkontakte/vkui';
import { useUser } from '../store/UserContext';
import { useAchievements } from '../store/AchievementContext';
import { useState } from 'react';
import bridge from '@vkontakte/vk-bridge';

const Profile: React.FC = () => {
  const { user, stats } = useUser();
  const { achievements, unlockedCount } = useAchievements();
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleBuyPro = async () => {
    // For demo purposes, just show snackbar
    setShowSnackbar(true);
  };

  const handleShare = async () => {
    try {
      await bridge.send('VKWebAppShowWallPostBox', {
        message: `Мой профиль в 100 к 1:\n🎯 Игр: ${stats.gamesPlayed}\n🏆 Очки: ${stats.totalScore}\n🔥 Серия: ${stats.streak} дней\n\n🏅 Достижений: ${unlockedCount}/8`
      });
    } catch (e) {
      console.log('Share cancelled');
    }
  };

  return (
    <Div style={{ paddingBottom: 66 }}>
      <Card mode="shadow" style={{ padding: 24, textAlign: 'center', marginBottom: 16 }}>
        {user && (
          <>
            <Avatar src={user.photo_200} size={96} style={{ margin: '0 auto' }} />
            <Title level="1" style={{ marginTop: 12 }}>
              {user.first_name} {user.last_name}
            </Title>
          </>
        )}
      </Card>

      <Group header={<Title level="2">Статистика</Title>}>
        <Card mode="tint" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>🎯</div>
              <Title level="2">{stats.gamesPlayed}</Title>
              <Text style={{ fontSize: 12 }}>Игр</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>🏆</div>
              <Title level="2">{stats.totalScore}</Title>
              <Text style={{ fontSize: 12 }}>Очки</Text>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24 }}>🔥</div>
              <Title level="2">{stats.streak}</Title>
              <Text style={{ fontSize: 12 }}>Серия</Text>
            </div>
          </div>
        </Card>
      </Group>

      <Spacing size={16} />

      <Group header={<Title level="2">Достижения</Title>}>
        <Badge mode="prominent" style={{ marginBottom: 12 }}>
          {unlockedCount}/8 достижений
        </Badge>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {achievements.map(a => (
            <Card
              key={a.id}
              mode={a.unlockedAt ? 'shadow' : 'outline'}
              style={{
                padding: 8,
                textAlign: 'center',
                opacity: a.unlockedAt ? 1 : 0.4,
                border: a.unlockedAt ? '2px solid #E3A008' : '1px dashed #999',
              }}
            >
              <div style={{ fontSize: 28 }}>{a.emoji}</div>
              <Text style={{ fontSize: 9, marginTop: 2, display: 'block' }}>
                {a.unlockedAt ? a.title : '???'}
              </Text>
            </Card>
          ))}
        </div>
      </Group>

      <Spacing size={24} />

      <Button
        size="l"
        stretched
        onClick={handleBuyPro}
        style={{
          background: 'linear-gradient(135deg, #F5C518 0%, #E3A008 100%)',
          color: '#000',
          fontWeight: 700,
        }}
      >
        👑 Pro без рекламы — 99₽/мес
      </Button>

      <Spacing size={12} />

      <Button size="l" mode="outline" stretched onClick={handleShare}>
        📤 Поделиться профилем
      </Button>

      <Spacing size={24} />

      <Text style={{ textAlign: 'center', color: 'var(--vkui--color_text_secondary)', fontSize: 12 }}>
        Нажимая «Pro без рекламы», вы соглашаетесь с правилами использования.
      </Text>

      {showSnackbar && (
        <Snackbar onClose={() => setShowSnackbar(false)}>
          Покупка отменена
        </Snackbar>
      )}
    </Div>
  );
};

export default Profile;
