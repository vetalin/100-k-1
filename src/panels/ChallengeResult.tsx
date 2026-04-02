import React from 'react';
import { Div, Button, Card, Text, Title, Spacing } from '@vkontakte/vkui';
import { ChallengeParams } from '../utils/challenge';

interface Props {
  myScore: number;
  myName: string;
  challenge: ChallengeParams;
  onPlayAgain: () => void;
  onChallengeSomeoneElse: () => void;
}

const ChallengeResult: React.FC<Props> = ({
  myScore,
  myName,
  challenge,
  onPlayAgain,
  onChallengeSomeoneElse,
}) => {
  const iWon = myScore > challenge.score;
  const tied = myScore === challenge.score;

  const resultEmoji = iWon ? '🏆' : tied ? '🤝' : '😤';
  const resultText = iWon
    ? 'Ты победил!'
    : tied
    ? 'Ничья!'
    : 'Проиграл... Взять реванш?';

  return (
    <Div style={{ paddingBottom: 80, paddingTop: 16 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 64 }}>{resultEmoji}</div>
        <Title level="1" style={{ marginTop: 8 }}>{resultText}</Title>
      </div>

      <Card mode="shadow" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {/* My side */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--vkui--color_accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, margin: '0 auto 8px',
            }}>
              🧑
            </div>
            <Text weight="3" style={{ fontSize: 13 }}>{myName}</Text>
            <Title level="2" style={{
              color: iWon ? '#4BB34A' : 'inherit',
              marginTop: 4,
            }}>
              {myScore.toLocaleString()}
            </Title>
            {iWon && <Text style={{ color: '#4BB34A', fontSize: 13 }}>👑 Победитель</Text>}
          </div>

          {/* VS */}
          <div style={{ textAlign: 'center', padding: '0 12px' }}>
            <Text style={{ fontSize: 20, fontWeight: 900, color: 'var(--vkui--color_text_secondary)' }}>VS</Text>
          </div>

          {/* Their side */}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--vkui--color_background_secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, margin: '0 auto 8px',
            }}>
              👤
            </div>
            <Text weight="3" style={{ fontSize: 13 }}>{challenge.fromName}</Text>
            <Title level="2" style={{
              color: !iWon && !tied ? '#4BB34A' : 'inherit',
              marginTop: 4,
            }}>
              {challenge.score.toLocaleString()}
            </Title>
            {!iWon && !tied && <Text style={{ color: '#4BB34A', fontSize: 13 }}>👑 Победитель</Text>}
          </div>
        </div>
      </Card>

      <Button size="l" mode="primary" stretched onClick={onChallengeSomeoneElse}>
        🏆 Бросить вызов другому
      </Button>
      <Spacing size={12} />
      <Button size="l" mode="outline" stretched onClick={onPlayAgain}>
        🔄 Сыграть ещё раз
      </Button>
    </Div>
  );
};

export default ChallengeResult;
