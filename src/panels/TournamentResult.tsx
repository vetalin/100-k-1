import React from 'react';
import { Div, Button, Card, Text, Title, Spacing } from '@vkontakte/vkui';
import { useTournament } from '../store/TournamentContext';

interface Props {
  onViewProfile: () => void;
  onNewTournament: () => void;
}

const TournamentResult: React.FC<Props> = ({ onViewProfile, onNewTournament }) => {
  const { tournament, isTournament } = useTournament();

  return (
    <Div style={{ paddingBottom: 66 }}>
      <Card mode="shadow" style={{ padding: 32, textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🏆</div>
        <Title level="1" style={{ marginBottom: 8 }}>Турнир завершён!</Title>
        {tournament && (
          <>
            <Text style={{ color: 'var(--vkui--color_text_secondary)', marginBottom: 24 }}>
              Неделя {tournament.weekKey}
            </Text>
            <div style={{ marginBottom: 24 }}>
              <Title level="2">Твой лучший результат</Title>
              <Title level="1" style={{ color: '#FFD700', fontSize: 48 }}>
                {tournament.bestScore}
              </Title>
            </div>
          </>
        )}
      </Card>

      {!isTournament && (
        <Card mode="outline" style={{ padding: 16, marginBottom: 16, textAlign: 'center' }}>
          <Text>Новый турнир начнётся в пятницу в 18:00 MSK</Text>
        </Card>
      )}

      <Spacing size={16} />

      <Button
        size="l"
        stretched
        onClick={onViewProfile}
        style={{
          background: 'linear-gradient(135deg, #F5C518 0%, #E3A008 100%)',
          color: '#000',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(227, 160, 8, 0.3)',
        }}
      >
        🏅 Смотреть награды
      </Button>

      <Spacing size={12} />

      <Button size="l" mode="outline" stretched onClick={onNewTournament}>
        🔄 К новому турниру
      </Button>
    </Div>
  );
};

export default TournamentResult;
