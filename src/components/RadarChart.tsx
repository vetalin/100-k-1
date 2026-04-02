import { CategoryStatsMap } from '../utils/categoryStats';

interface Props {
  stats: CategoryStatsMap;
}

type CatKey = keyof CategoryStatsMap;

const CATEGORIES: Array<{ key: CatKey; label: string; angle: number }> = [
  { key: 'food',    label: 'Еда',      angle: -90 },
  { key: 'love',    label: 'Любовь',   angle: -30 },
  { key: 'animals', label: 'Животные', angle: 30 },
  { key: 'people',  label: 'Люди',     angle: 90 },
  { key: 'school',  label: 'Школа',    angle: 150 },
  { key: 'work',    label: 'Работа',   angle: 210 },
];

const SIZE = 280;
const CENTER = SIZE / 2;
const MAX_RADIUS = 110;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function getPoint(angle: number, value: number) {
  const r = (value / 100) * MAX_RADIUS;
  return {
    x: CENTER + r * Math.cos(toRad(angle)),
    y: CENTER + r * Math.sin(toRad(angle)),
  };
}

export function RadarChart({ stats }: Props) {
  const hasAnyData = Object.values(stats).some(s => s.totalAnswered > 0);
  if (!hasAnyData) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--vkui--color_text_secondary)' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
        <div style={{ fontSize: 13 }}>Сыграй несколько раундов, чтобы увидеть радар</div>
      </div>
    );
  }

  const values = CATEGORIES.map(cat => {
    const s = stats[cat.key];
    if (!s || s.totalAnswered === 0) return 20;
    return Math.max(20, s.correctRate);
  });

  const polygonPoints = values
    .map((v, i) => getPoint(CATEGORIES[i].angle, v))
    .map(p => `${p.x},${p.y}`)
    .join(' ');

  const gridCircles = [25, 50, 75, 100].map(level => (
    <circle
      key={level}
      cx={CENTER}
      cy={CENTER}
      r={(level / 100) * MAX_RADIUS}
      fill="none"
      stroke="var(--vkui--color_field_border)"
      strokeWidth={level === 100 ? 1.5 : 0.5}
      strokeDasharray={level === 100 ? 'none' : '3,3'}
    />
  ));

  const axisLines = CATEGORIES.map(cat => {
    const outer = getPoint(cat.angle, 100);
    return (
      <line
        key={cat.key}
        x1={CENTER}
        y1={CENTER}
        x2={outer.x}
        y2={outer.y}
        stroke="var(--vkui--color_field_border)"
        strokeWidth={0.5}
      />
    );
  });

  const labels = CATEGORIES.map((cat, i) => {
    const labelPt = getPoint(cat.angle, 122);
    const val = values[i];
    const emoji = ['🍔', '❤️', '🐾', '👥', '📚', '💼'][i];
    return (
      <g key={cat.key}>
        <text
          x={labelPt.x}
          y={labelPt.y}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 11, fontWeight: 600 }}
          fill="var(--vkui--color_text_secondary)"
        >
          {val}%
        </text>
        <text
          x={labelPt.x}
          y={labelPt.y + 13}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 10 }}
          fill="var(--vkui--color_text_tertiary)"
        >
          {emoji} {cat.label}
        </text>
      </g>
    );
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {gridCircles}
        {axisLines}
        <polygon
          points={polygonPoints}
          fill="rgba(99, 102, 241, 0.2)"
          stroke="rgba(99, 102, 241, 0.8)"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {values.map((v, i) => {
          const pt = getPoint(CATEGORIES[i].angle, v);
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={4}
              fill="rgba(99, 102, 241, 0.9)"
              stroke="#fff"
              strokeWidth={2}
            />
          );
        })}
        {labels}
      </svg>
    </div>
  );
}
