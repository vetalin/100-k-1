import { Text } from '@vkontakte/vkui';
import { CategoryStatsMap, getCategoryEmoji, getCategoryName } from '../utils/categoryStats';
import type { Category } from '../types/index';

interface Props {
  stats: CategoryStatsMap;
}

const CATEGORIES: Category[] = ['food', 'people', 'animals', 'school', 'work', 'love'];

export function CategoryBreakdown({ stats }: Props) {
  const sorted = CATEGORIES
    .map(c => ({ category: c, stat: stats[c] }))
    .filter(({ stat }) => stat && stat.totalAnswered > 0)
    .sort((a, b) => b.stat.correctRate - a.stat.correctRate);

  if (sorted.length === 0) return null;

  return (
    <div style={{ padding: '0 4px' }}>
      {sorted.map(({ category, stat }) => {
        const pct = stat.correctRate;
        const barColor = pct >= 75 ? '#4BB34A' : pct >= 55 ? '#FF9800' : '#E64646';

        return (
          <div key={category} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>{getCategoryEmoji(category)}</span>
                <Text style={{ fontSize: 13, fontWeight: 600 }}>{getCategoryName(category)}</Text>
              </div>
              <Text style={{ fontSize: 13, fontWeight: 700, color: barColor }}>
                {pct}%
              </Text>
            </div>
            <div style={{
              height: 8,
              background: 'var(--vkui--color_background_secondary)',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: barColor,
                borderRadius: 4,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <Text style={{ fontSize: 11, color: 'var(--vkui--color_text_tertiary)', marginTop: 2 }}>
              {stat.totalCorrect}/{stat.totalAnswered} правильных
            </Text>
          </div>
        );
      })}
    </div>
  );
}
