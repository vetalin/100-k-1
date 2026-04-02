import React, { useState, useEffect } from 'react';
import { Div, Group, Tabs, TabsItem, SimpleCell, Avatar, Text, Title, Spacing, Card } from '@vkontakte/vkui';
import { useUser, VKUser } from '../store/UserContext';

interface LeaderboardEntry {
  user: VKUser;
  score: number;
  place: number;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { user: { id: 1, first_name: 'Александр', last_name: 'Петров', photo_200: '' }, score: 5200, place: 1 },
  { user: { id: 2, first_name: 'Мария', last_name: 'Иванова', photo_200: '' }, score: 4100, place: 2 },
  { user: { id: 3, first_name: 'Дмитрий', last_name: 'Сидоров', photo_200: '' }, score: 3800, place: 3 },
  { user: { id: 4, first_name: 'Елена', last_name: 'Козлова', photo_200: '' }, score: 3400, place: 4 },
  { user: { id: 5, first_name: 'Сергей', last_name: 'Новиков', photo_200: '' }, score: 2900, place: 5 },
];

const Leaderboard: React.FC = () => {
  const { user, stats } = useUser();
  const [activeTab, setActiveTab] = useState<'friends' | 'all'>('friends');
  const [friends, setFriends] = useState<LeaderboardEntry[]>([]);
  const [global] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);

  useEffect(() => {
    // For demo purposes, use mock data for friends
    setFriends(MOCK_LEADERBOARD.slice(0, 3));
  }, []);

  const medalEmoji = (place: number) => {
    if (place === 1) return '🥇';
    if (place === 2) return '🥈';
    if (place === 3) return '🥉';
    return null;
  };

  const data = activeTab === 'friends' ? friends : global;

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

      {data.slice(0, 3).map((entry) => (
        <Card key={entry.user.id} mode="shadow" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 28, width: 40, textAlign: 'center' }}>
              {medalEmoji(entry.place)}
            </div>
            <Avatar src={entry.user.photo_200} size={48} />
            <div style={{ flex: 1 }}>
              <Text>
                {entry.user.first_name} {entry.user.last_name}
              </Text>
              <Text style={{ color: 'var(--vkui--color_text_secondary)' }}>
                #{entry.place} место
              </Text>
            </div>
            <Title level="2">{entry.score}</Title>
          </div>
        </Card>
      ))}

      <Group header={<Title level="3">Остальные</Title>}>
        {data.slice(3).map((entry) => (
          <SimpleCell
            key={entry.user.id}
            before={<Avatar src={entry.user.photo_200} size={36} />}
            after={<Text>{entry.score}</Text>}
          >
            #{entry.place} {entry.user.first_name}
          </SimpleCell>
        ))}
      </Group>

      <Spacing size={16} />

      {user && (
        <Card mode="tint" style={{ padding: 16 }}>
          <SimpleCell
            before={<Avatar src={user.photo_200} size={36} />}
            after={<Text>{stats.totalScore}</Text>}
          >
            <Text>Вы</Text>
          </SimpleCell>
        </Card>
      )}
    </Div>
  );
};

export default Leaderboard;
