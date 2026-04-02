import React from 'react';
import { Div, Card, Text, Title, Group, Spacing, Button } from '@vkontakte/vkui';
import { useSeason } from '../store/SeasonContext';
import { getDaysLeft, XP_PER_LEVEL, MAX_LEVEL } from '../data/seasons';

interface Props {
  onBack?: () => void;
}

const SeasonScreen: React.FC<Props> = ({ onBack: _onBack }) => {
  const { currentSeason, seasonState, currentLevel, xpInCurrentLevel, buyPremium, claimReward } = useSeason();

  if (!currentSeason) {
    return (
      <Div style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 64 }}>🏆</div>
        <Title level="2" style={{ marginTop: 16 }}>Нет активного сезона</Title>
        <Text style={{ color: 'var(--vkui--color_text_secondary)', marginTop: 8 }}>
          Следующий сезон начнётся скоро!
        </Text>
      </Div>
    );
  }

  const daysLeft = getDaysLeft(currentSeason);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const totalXP = seasonState?.xp ?? 0;
  const maxXP = MAX_LEVEL * XP_PER_LEVEL;
  const levelPct = Math.min(100, (xpInCurrentLevel / XP_PER_LEVEL) * 100);
  const hasPremium = seasonState?.hasPremium ?? false;

  const daysLabel = daysLeft === 1 ? 'день' : daysLeft < 5 ? 'дня' : 'дней';

  return (
    <Div style={{ paddingBottom: 80 }}>
      {/* Season Header */}
      <Card mode="shadow" style={{
        padding: 24, marginBottom: 16, textAlign: 'center',
        background: 'linear-gradient(135deg, #FF9A9E, #FAD0C4, #FFD1FF)',
      }}>
        <div style={{ fontSize: 56 }}>{currentSeason.icon}</div>
        <Title level="1" style={{ marginTop: 8 }}>{currentSeason.name}</Title>
        <div style={{
          display: 'inline-block', marginTop: 8,
          background: daysLeft <= 3 ? '#E64646' : 'rgba(0,0,0,0.15)',
          color: '#fff', padding: '4px 12px', borderRadius: 12,
          fontSize: 13, fontWeight: 700,
        }}>
          ⏰ {daysLeft} {daysLabel} до конца
        </div>
      </Card>

      {/* XP Progress */}
      <Card mode="shadow" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text weight="3">⭐ Уровень {currentLevel} / {MAX_LEVEL}</Text>
          <Text style={{ color: 'var(--vkui--color_text_secondary)', fontSize: 13 }}>
            {xpInCurrentLevel} / {XP_PER_LEVEL} XP
          </Text>
        </div>
        <div style={{
          height: 8, background: 'var(--vkui--color_background_secondary)',
          borderRadius: 4, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${levelPct}%`,
            background: 'linear-gradient(90deg, #FF9A9E, #FECFEF)',
            borderRadius: 4, transition: 'width 0.4s ease',
          }} />
        </div>
        <Text style={{ fontSize: 12, color: 'var(--vkui--color_text_secondary)', marginTop: 4 }}>
          {totalXP} XP всего · {maxXP - totalXP} XP до макс.
        </Text>
      </Card>

      {/* Premium CTA (if not bought) */}
      {!hasPremium && (
        <Card mode="shadow" style={{
          padding: 16, marginBottom: 16,
          background: 'linear-gradient(135deg, #F5C518, #E3A008)',
          color: '#000',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36 }}>👑</div>
            <div style={{ flex: 1 }}>
              <Text weight="3" style={{ fontSize: 16, color: '#000' }}>Season Pass</Text>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.7)' }}>
                Все Premium-награды сезона
              </Text>
            </div>
            <Button
              size="m"
              onClick={buyPremium}
              style={{ background: '#000', color: '#FFD700', fontWeight: 700, flexShrink: 0 }}
            >
              99₽
            </Button>
          </div>
        </Card>
      )}
      {hasPremium && (
        <div style={{
          textAlign: 'center', padding: '8px 0', marginBottom: 12,
          color: '#E3A008', fontSize: 13, fontWeight: 700,
        }}>
          👑 Season Pass активен — все награды доступны
        </div>
      )}

      {/* Reward Tiers */}
      <Title level="2" style={{ marginBottom: 12, paddingLeft: 8 }}>🎁 Награды сезона</Title>

      <Group>
        {currentSeason.levels.map((reward) => {
          const lvl = reward.level;
          const isUnlocked = currentLevel >= lvl;
          const isClaimedFree = seasonState?.claimedFree.includes(lvl) ?? false;
          const isClaimedPremium = seasonState?.claimedPremium.includes(lvl) ?? false;

          const canClaimFree = isUnlocked && !isClaimedFree && !!reward.free;
          const canClaimPremium = isUnlocked && hasPremium && !isClaimedPremium && !!reward.premium;

          return (
            <Card key={lvl} mode="shadow" style={{
              marginBottom: 12, padding: 14,
              opacity: isUnlocked ? 1 : 0.55,
              borderLeft: `3px solid ${isUnlocked ? '#FF9A9E' : 'transparent'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: isUnlocked ? 'linear-gradient(135deg,#FF9A9E,#FECFEF)' : '#eee',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 14, color: isUnlocked ? '#fff' : '#999',
                  flexShrink: 0,
                }}>
                  {isUnlocked ? lvl : '🔒'}
                </div>
                <Text weight="3" style={{ fontSize: 14 }}>Уровень {lvl}</Text>
              </div>

              {/* Free reward */}
              {reward.free && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 10px', marginBottom: 6,
                  background: 'var(--vkui--color_background_secondary)', borderRadius: 8,
                }}>
                  <Text style={{ fontSize: 13 }}>
                    Free: {reward.free.type === 'points'
                      ? `+${reward.free.value} 🪙`
                      : reward.free.type === 'badge'
                      ? `🏅 ${reward.free.value}`
                      : `📛 ${reward.free.value}`}
                  </Text>
                  {isClaimedFree ? (
                    <Text style={{ color: '#4BB34A', fontSize: 13 }}>✅</Text>
                  ) : canClaimFree ? (
                    <Button size="s" mode="primary" onClick={() => claimReward(lvl, 'free')}>
                      Забрать
                    </Button>
                  ) : null}
                </div>
              )}

              {/* Premium reward */}
              {reward.premium && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '6px 10px',
                  background: hasPremium ? 'rgba(227,160,8,0.1)' : 'rgba(0,0,0,0.03)',
                  borderRadius: 8,
                  border: hasPremium ? '1px solid rgba(227,160,8,0.3)' : '1px solid transparent',
                }}>
                  <Text style={{ fontSize: 13, color: hasPremium ? '#E3A008' : 'var(--vkui--color_text_secondary)' }}>
                    👑 {reward.premium.type === 'avatar' ? `🖼 ${reward.premium.value}` :
                        reward.premium.type === 'theme' ? `🎨 ${reward.premium.value}` :
                        reward.premium.type === 'badge' ? `🏅 ${reward.premium.value}` :
                        `📛 ${reward.premium.value}`}
                  </Text>
                  {!hasPremium ? (
                    <div style={{
                      background: '#E3A008', color: '#fff',
                      padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                    }}>
                      Premium
                    </div>
                  ) : isClaimedPremium ? (
                    <Text style={{ color: '#E3A008', fontSize: 13 }}>✅</Text>
                  ) : canClaimPremium ? (
                    <Button size="s" mode="secondary" onClick={() => claimReward(lvl, 'premium')}>
                      Забрать
                    </Button>
                  ) : null}
                </div>
              )}
            </Card>
          );
        })}
      </Group>

      <Spacing size={16} />

      {/* Bottom CTA */}
      {!hasPremium && (
        <Button size="l" stretched onClick={buyPremium} style={{
          background: 'linear-gradient(135deg, #F5C518, #E3A008)',
          color: '#000', fontWeight: 700,
        }}>
          👑 Купить Season Pass за 99₽
        </Button>
      )}
    </Div>
  );
};

export default SeasonScreen;
