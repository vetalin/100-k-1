import React from 'react';
import { ModalRoot, ModalPage, ModalPageHeader, Div, Button, Text, Title, Spacing } from '@vkontakte/vkui';
import { ChallengeParams } from '../utils/challenge';

interface Props {
  challenge: ChallengeParams | null;
  onAccept: () => void;
  onDecline: () => void;
}

const ChallengeModal: React.FC<Props> = ({ challenge, onAccept, onDecline }) => {
  if (!challenge) return null;

  return (
    <ModalRoot activeModal="challenge_invite">
      <ModalPage
        id="challenge_invite"
        onClose={onDecline}
        header={<ModalPageHeader>🏆 Тебе бросили вызов!</ModalPageHeader>}
      >
        <Div style={{ textAlign: 'center', paddingBottom: 32 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <Title level="2" style={{ marginBottom: 8 }}>
            {challenge.fromName}
          </Title>
          <Text style={{ color: 'var(--vkui--color_text_secondary)', marginBottom: 24 }}>
            набрал <strong style={{ color: 'var(--vkui--color_accent)', fontSize: 20 }}>
              {challenge.score.toLocaleString()}
            </strong> очков
          </Text>
          <Text style={{ marginBottom: 24 }}>
            Сыграй те же вопросы и побей его результат!
          </Text>
          <Button size="l" stretched mode="primary" onClick={onAccept}>
            ⚔️ Принять вызов
          </Button>
          <Spacing size={12} />
          <Button size="l" stretched mode="outline" onClick={onDecline}>
            Отказаться
          </Button>
        </Div>
      </ModalPage>
    </ModalRoot>
  );
};

export default ChallengeModal;
