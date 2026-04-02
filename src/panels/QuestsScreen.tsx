import React from 'react';
import { Div, Button, Card, Text, Title, Group, Spacing } from '@vkontakte/vkui';
import { useQuests } from '../store/QuestContext';
import { Quest } from '../types';

interface Props {
  onBack: () => void;
}

const QuestsScreen: React.FC<Props> = ({ onBack }) => {
  const { dailyQuests, questState, claimReward } = useQuests();

  const renderReward = (quest: Quest) => {
    const { type, value } = quest.reward;
    if (type === 'points') return `+${value} 🪙`;
    if (type === 'hint') return `+${value} 💡`;
    if (type === 'shield') return '🛡️ Streak Shield';
    return '';
  };

  const completedCount = questState.totalCompleted;
  const totalCount = dailyQuests.length;

  return (
    <Div style={{ paddingBottom: 80 }}>
      <Div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <Button mode="tertiary" onClick={onBack}>← Назад</Button>
        <Title level="2">⭐ Задания дня</Title>
      </Div>
      <Text style={{ color: 'var(--vkui--color_text_secondary)', paddingLeft: 16, marginBottom: 16, fontSize: 13 }}>
        Обновляются каждый день в 00:00
      </Text>

      {/* Summary card */}
      <Card mode="shadow" style={{ padding: 16, marginBottom: 16, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          {Array.from({ length: totalCount }).map((_, i) => (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: i < completedCount ? '#4BB34A' : 'var(--vkui--color_background_secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>
              {i < completedCount ? '✅' : '○'}
            </div>
          ))}
        </div>
        <Text weight="3">
          {completedCount === totalCount
            ? '🎉 Все задания выполнены!'
            : `${completedCount} / ${totalCount} заданий`}
        </Text>
        {completedCount < totalCount && (
          <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: 13, marginTop: 4 }}>
            Ещё {totalCount - completedCount} осталось
          </Text>
        )}
      </Card>

      <Group>
        {dailyQuests.map(quest => {
          const state = questState.quests.find(q => q.questId === quest.id);
          const progress = state?.progress ?? 0;
          const target = quest.target;
          const completed = state?.completed ?? false;
          const claimed = state?.rewardClaimed ?? false;
          const pct = Math.min(100, (progress / target) * 100);

          const diffColor = quest.difficulty === 'easy' ? '#4BB34A' : quest.difficulty === 'medium' ? '#FF9800' : '#E64646';

          return (
            <Card
              key={quest.id}
              mode="shadow"
              style={{
                marginBottom: 12,
                padding: 16,
                opacity: claimed ? 0.6 : 1,
                borderLeft: `3px solid ${completed ? '#4BB34A' : diffColor}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{quest.icon}</span>
                  <div>
                    <Text weight="3" style={{ fontSize: 15 }}>{quest.title}</Text>
                    <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: 12, marginTop: 2 }}>
                      {quest.description}
                    </Text>
                  </div>
                </div>
                {completed && !claimed && (
                  <Button size="s" mode="primary" onClick={() => claimReward(quest.id)}>
                    Забрать!
                  </Button>
                )}
                {claimed && (
                  <Text style={{ color: '#4BB34A', fontSize: 20 }}>✅</Text>
                )}
              </div>

              {/* Progress bar */}
              <div style={{
                height: 6, background: 'var(--vkui--color_background_secondary)',
                borderRadius: 3, marginBottom: 6,
              }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: completed ? '#4BB34A' : 'var(--vkui--color_accent)',
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: 'var(--vkui--color_text_secondary)' }}>
                  {Math.min(progress, target)} / {target}
                </Text>
                <Text style={{ fontSize: 13, fontWeight: 700, color: 'var(--vkui--color_accent)' }}>
                  {renderReward(quest)}
                </Text>
              </div>
            </Card>
          );
        })}
      </Group>

      <Spacing size={16} />
      <Button size="l" mode="outline" stretched onClick={onBack}>← Назад</Button>
    </Div>
  );
};

export default QuestsScreen;
