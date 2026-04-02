import React from 'react';
import { Div, Button, Card, Text, Title, Group, Spacing, Avatar, CardGrid } from '@vkontakte/vkui';
import { useGame } from '../store/GameContext';
import { useUser } from '../store/UserContext';
import { useAchievements } from '../store/AchievementContext';
import { useTournament } from '../store/TournamentContext';
import { generateStoryImage } from '../utils/storyImage';
import bridge from '@vkontakte/vk-bridge';

interface Props {
  onPlayAgain: () => void;
  onLeaderboard: () => void;
}

const FinalResult: React.FC<Props> = ({ onPlayAgain, onLeaderboard }) => {
  const { state, dispatch } = useGame();
  const { user, stats, updateStats } = useUser();
  const { checkAndUnlock } = useAchievements();
  const { addTournamentScore, isTournament, multiplier } = useTournament();

  const correctAnswers = state.userAnswers.filter(a => a.correct).length;
  const totalAnswers = state.userAnswers.length;
  const bestPercent = state.userAnswers.length > 0
    ? Math.max(...state.userAnswers.map(a => a.percent))
    : 0;

  React.useEffect(() => {
    const newGamesPlayed = stats.gamesPlayed + 1;
    const newBestScore = Math.max(stats.bestScore, state.score);

    // Calculate streak
    const today = new Date().toISOString().split('T')[0];
    const lastPlayed = stats.lastPlayedDate;
    let newStreak = 1;
    if (lastPlayed) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastPlayed === yesterday) {
        newStreak = (stats.streak || 0) + 1;
      } else if (lastPlayed === today) {
        newStreak = stats.streak || 1;
      }
    }

    updateStats({
      gamesPlayed: newGamesPlayed,
      totalScore: stats.totalScore + state.score,
      bestScore: newBestScore,
      streak: newStreak,
      lastPlayedDate: today,
    });

    // Check achievements
    checkAndUnlock({
      gamesPlayed: newGamesPlayed,
      streak: newStreak,
      bestScore: newBestScore,
    });

    // Сохранить результат в VK Storage для таблицы лидеров
    if (user) {
      bridge.send('VKWebAppStorageSet', {
        key: `lb_${user.id}`,
        value: JSON.stringify({
          score: state.score,
          gamesPlayed: newGamesPlayed,
          streak: newStreak,
          updatedAt: Date.now()
        })
      }).catch(e => console.error('Failed to save leaderboard score:', e));
    }

    // Save tournament score if tournament is active
    if (isTournament) {
      addTournamentScore(state.score);
    }
  }, []);

    const handleShare = async () => {
    try {
      // Generate story image
      const imageDataUrl = await generateStoryImage({
        userName: user ? `${user.first_name} ${user.last_name}` : 'Игрок',
        userAvatarUrl: user?.photo_200 || '',
        score: state.score,
        correctAnswers,
        totalQuestions: totalAnswers,
        bestPercent,
        streak: stats?.streak || 0,
        isTournament,
        tournamentMultiplier: multiplier,
      });

      // Try Stories first
      try {
        await bridge.send('VKWebAppShowStoryBox', {
          background_type: 'image',
          url: imageDataUrl,
          attachment: {
            type: 'url',
            text: `Мой результат: ${state.score} очков в 100 к 1! 🎯`,
            url: `https://vk.com/app0`,
          }
        });
      } catch {
        // Fallback to wall post
        await bridge.send('VKWebAppShowWallPostBox', {
          message: `🎯 Мой результат в 100 к 1: ${state.score} очков! ${correctAnswers}/${totalAnswers} верных ответов. Попробуй и ты!`,
        });
      }
    } catch (e) {
      console.error('Share failed:', e);
    }
  };


  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_GAME' });
    onPlayAgain();
  };

  return (
    <Div style={{ paddingBottom: 66 }}>
      <Card mode="shadow" style={{ padding: 24, textAlign: 'center', marginBottom: 16 }}>
        {user && (
          <>
            <Avatar src={user.photo_200} size={96} style={{ margin: '0 auto' }} />
            <Title level="2" style={{ marginTop: 12 }}>{user.first_name} {user.last_name}</Title>
          </>
        )}
        <Title level="1" style={{ marginTop: 16 }}>
          🏆 {state.score} очков
        </Title>
        {isTournament && (
          <Text style={{ color: '#FFD700' }}>
            🎁 Турнирные очки: +{state.score * multiplier} (×{multiplier})
          </Text>
        )}
      </Card>

      <CardGrid size="s" style={{ marginBottom: 16 }}>
        <Card mode="shadow" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 24 }}>🎯</div>
          <Title level="3" style={{ marginTop: 4 }}>{correctAnswers}/{totalAnswers}</Title>
          <Text style={{ fontSize: 12 }}>Верных ответов</Text>
        </Card>
        <Card mode="shadow" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 24 }}>⭐</div>
          <Title level="3" style={{ marginTop: 4 }}>{bestPercent}%</Title>
          <Text style={{ fontSize: 12 }}>Лучший ответ</Text>
        </Card>
        <Card mode="shadow" style={{ padding: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 24 }}>🔥</div>
          <Title level="3" style={{ marginTop: 4 }}>{stats.streak}</Title>
          <Text style={{ fontSize: 12 }}>Серия</Text>
        </Card>
      </CardGrid>

      <Card mode="shadow" style={{ padding: 16, marginBottom: 16 }}>
        <Group header={<Title level="3">📖 Поделиться в Stories</Title>}>
          <Button size="l" mode="outline" stretched onClick={handleShare}>
            Поделиться результатом
          </Button>
        </Group>
      </Card>

      <Spacing size={16} />

      <Button
        size="l"
        stretched
        onClick={handlePlayAgain}
        style={{
          background: 'linear-gradient(135deg, #F5C518 0%, #E3A008 100%)',
          color: '#000',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(227, 160, 8, 0.3)',
        }}
      >
        🎮 Играть снова
      </Button>

      <Spacing size={12} />

      <Button size="l" mode="outline" stretched onClick={onLeaderboard}>
        🏆 Таблица лидеров
      </Button>
    </Div>
  );
};

export default FinalResult;
