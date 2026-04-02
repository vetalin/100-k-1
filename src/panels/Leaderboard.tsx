import React, { useState, useEffect } from 'react';
import { Div, Group, Tabs, TabsItem, SimpleCell, Avatar, Text, Title, Spacing, Card, Placeholder, Button, Spinner, Badge } from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge';
import { useUser } from '../store/UserContext';

interface FriendEntry {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    photo_200: string;
  };
  score: number;
  streak: number;
  place: number;
}

interface LeaderboardEntry {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    photo_200: string;
  };
  score: number;
  place: number;
  isDemo?: boolean;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { user: { id: 1, first_name: 'Пример', last_name: '(demo)', photo_200: '' }, score: 5200, place: 1, isDemo: true },
  { user: { id: 2, first_name: 'Данные', last_name: '(demo)', photo_200: '' }, score: 4100, place: 2, isDemo: true },
  { user: { id: 3, first_name: 'Тест', last_name: '(demo)', photo_200: '' }, score: 3800, place: 3, isDemo: true },
  { user: { id: 4, first_name: 'Образец', last_name: '(demo)', photo_200: '' }, score: 3400, place: 4, isDemo: true },
  { user: { id: 5, first_name: 'Проба', last_name: '(demo)', photo_200: '' }, score: 2900, place: 5, isDemo: true },
];

type FriendsState = 'loading' | 'loaded' | 'empty' | 'error' | 'mock';

const Leaderboard: React.FC = () => {
  const { user, stats } = useUser();
  const [activeTab, setActiveTab] = useState<'friends' | 'all'>('friends');
  const [friends, setFriends] = useState<FriendEntry[]>([]);
  const [friendsState, setFriendsState] = useState<FriendsState>('loading');
  const [myPlace, setMyPlace] = useState<number>(0);


  useEffect(() => {
    if (activeTab === 'friends') {
      loadFriendsLeaderboard();
    }
  }, [activeTab]);

  const loadFriendsLeaderboard = async () => {
    if (!user) {
      setFriendsState('mock');
      return;
    }

    setFriendsState('loading');

    try {
      // 1. Получить VK Auth Token (app_id должен быть установлен в VK Developer Console)
      // Если app_id не настроен — используем mock-данные
      const userInfo = await bridge.send('VKWebAppGetUserInfo');
      const appId = (userInfo as any).app_id || 0;
      if (!appId) {
        console.warn('VK App ID not configured, using mock leaderboard');
        setFriendsState('mock');
        return;
      }
      const token = await bridge.send('VKWebAppGetAuthToken', { app_id: appId, scope: 'friends' });

      // 2. Получить друзей в приложении
      const friendIdsResponse: any = await bridge.send('VKWebAppCallAPIMethod', {
        method: 'friends.getAppUsers',
        params: { access_token: token.access_token, v: '5.131' }
      });
      const friendIds: number[] = friendIdsResponse.response || [];

      if (friendIds.length === 0) {
        setFriendsState('empty');
        return;
      }

      // 3. Получить данные пользователей
      const usersResponse: any = await bridge.send('VKWebAppCallAPIMethod', {
        method: 'users.get',
        params: {
          user_ids: friendIds.slice(0, 20).join(','),
          fields: 'photo_200',
          access_token: token.access_token,
          v: '5.131'
        }
      });
      const users: any[] = usersResponse.response || [];

      // 4. Получить их результаты из VK Storage
      const scoreKeys = friendIds.slice(0, 20).map((id: number) => `lb_${id}`);
      const scoresResult = await bridge.send('VKWebAppStorageGet', { keys: scoreKeys });

      // 5. Собрать массив
      const friendsData: FriendEntry[] = friendIds.slice(0, 20).map((fid: number, idx: number) => {
        const userData = users.find((u: any) => u.id === fid);
        const scoreData = scoresResult.keys?.[idx]?.value
          ? JSON.parse(scoresResult.keys[idx].value)
          : null;
        return {
          user: userData || { id: fid, first_name: 'Игрок', last_name: `#${fid}`, photo_200: '' },
          score: scoreData?.score ?? 0,
          streak: scoreData?.streak ?? 0,
          place: 0
        };
      }).filter(f => f.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry, idx) => ({ ...entry, place: idx + 1 }));

      // 6. Добавить текущего пользователя
      const meEntry: FriendEntry = {
        user: { id: user.id, first_name: user.first_name, last_name: user.last_name, photo_200: user.photo_200 },
        score: stats.totalScore,
        streak: stats.streak,
        place: 0
      };
      const allWithMe = [...friendsData, meEntry]
        .sort((a, b) => b.score - a.score)
        .map((entry, idx) => ({ ...entry, place: idx + 1 }));

      setFriends(allWithMe);
      setMyPlace(allWithMe.find(e => e.user.id === user.id)?.place ?? 0);
      setFriendsState('loaded');
    } catch (e) {
      console.error('Leaderboard error:', e);
      setFriendsState('mock');
    }
  };

  const handleInvite = async () => {
    try {
      await bridge.send('VKWebAppShowInviteBox', {});
    } catch (e) {
      console.error('Invite error:', e);
    }
  };



  const medalEmoji = (place: number) => {
    if (place === 1) return '🥇';
    if (place === 2) return '🥈';
    if (place === 3) return '🥉';
    return null;
  };

  const renderFriendsTab = () => {
    if (friendsState === 'loading') {
      return (
        <Div style={{ textAlign: 'center', padding: 40 }}>
          <Spinner size="l" />
          <Text style={{ display: 'block', marginTop: 16 }}>Загружаем друзей...</Text>
        </Div>
      );
    }

    if (friendsState === 'empty') {
      return (
        <Placeholder
          icon="😔"
          action={
            <Button size="l" mode="primary" onClick={handleInvite}>
              🔗 Пригласить друзей
            </Button>
          }
        >
          <Title level="2" style={{ marginBottom: 8 }}>Пусто</Title>
          Пока никто из друзей не играет в 100 к 1
        </Placeholder>
      );
    }

    if (friendsState === 'mock') {
      return (
        <Div>
          <Text style={{ color: 'var(--vkui--color_text_secondary)', textAlign: 'center', marginBottom: 16 }}>
            Войдите через VK для просмотра друзей
          </Text>
          <Group header={<Title level="3">Друзья (демо)</Title>}>
            {MOCK_LEADERBOARD.slice(0, 3).map((entry) => (
              <Card key={entry.user.id} mode="shadow" style={{ padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 28, width: 40, textAlign: 'center' }}>
                    {medalEmoji(entry.place)}
                  </div>
                  <Avatar src={entry.user.photo_200} size={48} />
                  <div style={{ flex: 1 }}>
                    <Text>
                      {entry.user.first_name} {entry.user.last_name}
                      {entry.isDemo && <Badge style={{ marginLeft: 6, background: '#666' }}>🧪 demo</Badge>}
                    </Text>
                    <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                      #{entry.place} место
                    </Text>
                  </div>
                  <Title level="2">{entry.score}</Title>
                </div>
              </Card>
            ))}
          </Group>
        </Div>
      );
    }

    if (friends.length === 0) {
      return (
        <Placeholder
          icon="😔"
          action={
            <Button size="l" mode="primary" onClick={handleInvite}>
              🔗 Пригласить друзей
            </Button>
          }
        >
          <Title level="2" style={{ marginBottom: 8 }}>Пусто</Title>
          Пока никто из друзей не играет в 100 к 1
        </Placeholder>
      );
    }

    return (
      <Div>
        {friends.slice(0, 3).map((entry) => (
          <Card
            key={entry.user.id}
            mode="shadow"
            style={{
              padding: 16,
              marginBottom: 12,
              border: entry.user.id === user?.id ? '2px solid #2688EB' : 'none',
              borderRadius: entry.user.id === user?.id ? 12 : 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 28, width: 40, textAlign: 'center' }}>
                {medalEmoji(entry.place)}
              </div>
              <Avatar src={entry.user.photo_200} size={48} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Text>
                    {entry.user.first_name} {entry.user.last_name}
                  </Text>
                  {entry.user.id === user?.id && (
                    <Badge mode="prominent">Вы</Badge>
                  )}
                </div>
                <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                  #{entry.place} место
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Title level="2">{entry.score}</Title>
                {entry.streak > 0 && (
                  <Badge mode="prominent" style={{ background: '#FF4500' }}>
                    🔥{entry.streak}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}

        {friends.length > 3 && (
          <Group header={<Title level="3">Остальные</Title>}>
            {friends.slice(3).map((entry) => (
              <SimpleCell
                key={entry.user.id}
                before={<Avatar src={entry.user.photo_200} size={36} />}
                after={<Text>{entry.score}</Text>}
                style={entry.user.id === user?.id ? { border: '2px solid #2688EB', borderRadius: 8 } : {}}
              >
                #{entry.place} {entry.user.first_name}
                {entry.streak > 0 && (
                  <Badge mode="prominent" style={{ background: '#FF4500', marginLeft: 8 }}>
                    🔥{entry.streak}
                  </Badge>
                )}
                {entry.user.id === user?.id && (
                  <Badge mode="prominent" style={{ marginLeft: 4 }}>Вы</Badge>
                )}
              </SimpleCell>
            ))}
          </Group>
        )}

        {myPlace > 0 && (
          <Card mode="tint" style={{ padding: 16, marginTop: 16 }}>
            <SimpleCell
              before={<Avatar src={user?.photo_200} size={36} />}
              after={<Text>{stats.totalScore}</Text>}
            >
              Ваше место: #{myPlace}
            </SimpleCell>
          </Card>
        )}
      </Div>
    );
  };

  const renderGlobalTab = () => {
    return (
      <Div>
        <Card mode="shadow" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
          <Title level="2" style={{ marginBottom: 8 }}>Глобальный рейтинг</Title>
          <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
            Скоро здесь появится таблица лидеров среди всех игроков VK!
          </Text>
          <Spacing size={16} />
          <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
            Приглашай друзей — чем больше игроков, тем интереснее 🎉
          </Text>
        </Card>
      </Div>
    );
  };

  return (
    <Div style={{ paddingBottom: 66 }}>
      <Tabs>
        <TabsItem
          onClick={() => setActiveTab('friends')}
          selected={activeTab === 'friends'}
        >
          Друзья
        </TabsItem>
        <TabsItem
          onClick={() => setActiveTab('all')}
          selected={activeTab === 'all'}
        >
          Все
        </TabsItem>
      </Tabs>

      <Spacing size={16} />

      {activeTab === 'friends' ? renderFriendsTab() : renderGlobalTab()}


    </Div>
  );
};

export default Leaderboard;
